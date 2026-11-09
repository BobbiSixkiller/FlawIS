import { GraphQLError } from "graphql";
import { Service } from "typedi";
import { ObjectId } from "mongodb";
import { ClientSession } from "mongoose";
import { Repository } from "../repositories/base.repository";
import { ReviewFile } from "../entitites/Review";
import { StoredObject } from "../entitites/StoredObject";
import { FormFieldInput } from "../resolvers/types/form/form.types";
import {
  AnswerRepository,
  AnswerRevisionRepository,
  FormBindingRepository,
  FormDefinitionRepository,
  FormRepository,
} from "../repositories/form.repository";
import { toDTO, withOptionalTransaction } from "../util/helpers";
import { validateAnswers } from "../util/formValidation";

@Service()
export class FormService {
  constructor(
    private readonly forms: FormRepository,
    private readonly definitions: FormDefinitionRepository,
    private readonly bindings: FormBindingRepository,
    private readonly answers: AnswerRepository,
    private readonly revisions: AnswerRevisionRepository,
  ) {}

  async list(search = "") {
    const records = await this.definitions.findAll(
      {
        archived: false,
        ...(search
          ? {
              name: {
                $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                $options: "i",
              },
            }
          : {}),
      },
      null,
      { sort: { updatedAt: -1 }, limit: 100 },
    );
    return records.map(toDTO);
  }

  async createDefinition(
    name: string,
    description: string,
    actor: ObjectId,
    session?: ClientSession,
  ) {
    if (description.length > 5000) throw new Error("Description is too long.");
    if (!name.trim() || name.length > 200)
      throw new Error("A form name is required (maximum 200 characters).");
    return toDTO(
      await this.definitions.create(
        { name: name.trim(), description, createdBy: actor },
        { session },
      ),
    );
  }

  async updateDefinition(
    definition: ObjectId,
    name: string,
    description: string,
  ) {
    if (!name.trim() || name.length > 200 || description.length > 5000)
      throw new Error("Invalid form name or description.");
    const updated = await this.definitions.findOneAndUpdate(
      { _id: definition, archived: false },
      { $set: { name: name.trim(), description } },
    );
    if (!updated) throw new Error("Form is missing or archived.");
  }

  async publish(
    definition: ObjectId,
    fields: FormFieldInput[],
    session?: ClientSession,
  ) {
    if (fields.length > 100) throw new Error("Maximum 100 fields.");
    const normalized = fields.map((f) => ({
      ...f,
      _id: f.id ?? new ObjectId(),
    }));
    const ids = normalized.map((f) => String(f._id));
    if (new Set(ids).size !== ids.length)
      throw new Error("Duplicate field IDs.");
    for (const f of normalized) {
      if (
        !f.label.trim() ||
        f.label.length > 500 ||
        (f.helpText?.length || 0) > 5000
      )
        throw new Error(
          "Field labels are required and must be at most 500 characters.",
        );
      if (
        [f.minFiles, f.maxFiles].some(
          (v) => v != null && (!Number.isInteger(v) || v < 0 || v > 20),
        )
      )
        throw new Error("File limits must be between 0 and 20.");
      if (
        ["SELECT", "RADIO_GROUP"].includes(f.type) &&
        (!f.selectOptions?.length ||
          f.selectOptions.length > 100 ||
          f.selectOptions.some(
            (o) =>
              !o.value.trim() ||
              !o.text.trim() ||
              o.value.length > 200 ||
              o.text.length > 500,
          ) ||
          new Set(f.selectOptions.map((o) => o.value)).size !==
            f.selectOptions.length)
      )
        throw new Error("Choice fields need unique options.");
      if (f.type === "FILE_UPLOAD") {
        const min = Math.max(
          f.required ? 1 : 0,
          f.minFiles ?? (f.required ? 1 : 0),
        );
        const max = f.maxFiles ?? 10;
        if (max < 1 || min > max)
          throw new Error(
            "Maximum files must be at least 1 and no less than the minimum.",
          );
      }
    }
    return withOptionalTransaction(session, async (s) => {
      const root = await this.definitions.findOneAndUpdate(
        { _id: definition, archived: false },
        { $inc: { latestVersion: 1 } },
        { new: true, session: s },
      );
      if (!root) throw new Error("Form is missing or archived.");
      return toDTO(
        await this.forms.create(
          { definition, version: root.latestVersion, fields: normalized },
          { session: s },
        ),
      );
    });
  }

  async versions(definition: ObjectId) {
    return (
      await this.forms.findAll({ definition }, null, { sort: { version: -1 } })
    ).map(toDTO);
  }
  async archive(definition: ObjectId) {
    await this.definitions.findOneAndUpdate(
      { _id: definition },
      { $set: { archived: true } },
    );
    return true;
  }
  async getForm(id: ObjectId, session?: ClientSession) {
    const form = await this.forms.findOne({ _id: id }, null, { session });
    if (!form) throw new Error("Form not found.");
    return toDTO(form);
  }

  async bind(
    context: "COURSE" | "REVIEW",
    owner: ObjectId,
    form: ObjectId,
    session?: ClientSession,
  ) {
    const version = await this.getForm(form, session);
    const root = await this.definitions.findOne(
      { _id: version.definition, archived: false },
      null,
      { session },
    );
    if (!root) throw new Error("Form is archived.");
    await this.bindings.findOneAndUpdate(
      { context, owner },
      { $set: { form } },
      { upsert: true, session, runValidators: true },
    );
    return version;
  }

  async bound(
    context: "COURSE" | "REVIEW",
    owner: ObjectId,
    session?: ClientSession,
  ) {
    const binding = await this.bindings.findOne({ context, owner }, null, {
      session,
    });
    if (!binding) throw new Error("No form is assigned.");
    return {
      ...(await this.getForm(binding.form, session)),
      ...(context === "COURSE" ? { course: owner } : {}),
    };
  }

  async saveAnswers(
    input: {
      context: "COURSE" | "REVIEW";
      owner: ObjectId;
      subject: ObjectId;
      respondent: string;
      form: ObjectId;
      answers: Record<string, unknown>;
      submitted: boolean;
      expectedRevision?: number;
      reopen?: boolean;
    },
    session?: ClientSession,
  ) {
    return withOptionalTransaction(session, async (s) => {
      const existing = await this.answers.findOne(
        { context: input.context, subject: input.subject },
        null,
        { session: s },
      );
      const version = existing
        ? await this.getForm(existing.form, s)
        : await this.bound(input.context, input.owner, s);
      if (String(version.id) !== String(input.form))
        throw new Error("Form version mismatch.");
      if (existing && input.expectedRevision !== existing.revision)
        throw new GraphQLError("Answers changed. Reload before saving.", {
          extensions: { code: "CONFLICT" },
        });
      if (existing?.submitted && !input.reopen)
        throw new Error("Submitted answers are immutable.");
      const validated = validateAnswers(
        version.fields,
        input.answers,
        input.submitted,
      );
      for (const field of version.fields.filter(
        (f) => f.type === "FILE_UPLOAD",
      )) {
        for (const reference of validated[String(field.id)] || []) {
          const previous =
            existing?.answers instanceof Map
              ? existing.answers.get(String(field.id))
              : (existing?.answers as any)?.[String(field.id)];
          if (Array.isArray(previous) && previous.includes(reference)) continue;
          if (input.context === "REVIEW") {
            if (
              !ObjectId.isValid(reference) ||
              !(await new Repository(ReviewFile).exists({
                _id: new ObjectId(reference),
                kind: "REPORT",
                assignment: input.subject,
                actor: input.respondent,
              }))
            )
              throw new Error("Report file does not belong to this reviewer.");
          } else {
            if (
              !(Array.isArray(previous) && previous.includes(reference)) &&
              !(await new Repository(StoredObject).exists({
                url: reference,
                owner: new ObjectId(input.respondent),
              }))
            )
              throw new Error(
                "Application file does not belong to this applicant.",
              );
          }
        }
      }
      const revision = (existing?.revision ?? 0) + 1;
      const values = {
        form: version.id,
        formVersion: version.version,
        answers: validated,
        submitted: input.submitted,
        revision,
        respondent: input.respondent,
      };
      const saved = existing
        ? await this.answers.findOneAndUpdate(
            { _id: existing._id, revision: existing.revision },
            { $set: values },
            { new: true, session: s },
          )
        : await this.answers.create(
            { context: input.context, subject: input.subject, ...values },
            { session: s },
          );
      if (!saved)
        throw new GraphQLError("Answers changed. Reload before saving.", {
          extensions: { code: "CONFLICT" },
        });
      await this.revisions.create(
        {
          answer: saved._id,
          revision,
          form: version.id,
          actor: input.respondent,
          answers: validated,
          submitted: input.submitted,
        },
        { session: s },
      );
      return toDTO(saved);
    });
  }

  async answer(context: string, subject: ObjectId, session?: ClientSession) {
    const answer = await this.answers.findOne({ context, subject }, null, {
      session,
    });
    return answer ? toDTO(answer) : null;
  }

  async createForm(
    fields: FormFieldInput[],
    owner: ObjectId,
    session: ClientSession | undefined,
    actor: ObjectId,
  ) {
    const binding = await this.bindings.findOne(
      { context: "COURSE", owner },
      null,
      { session },
    );
    const definition = binding
      ? (await this.getForm(binding.form, session)).definition
      : (await this.createDefinition("Course registration", "", actor, session))
          .id;
    const version = await this.publish(definition, fields, session);
    await this.bind("COURSE", owner, version.id, session);
    return { ...version, course: owner };
  }
  async getLatestCourseForm(owner: ObjectId) {
    return this.bound("COURSE", owner);
  }
  async deleteCourseForms(owner: ObjectId, session?: ClientSession) {
    return this.bindings.deleteMany({ context: "COURSE", owner }, { session });
  }
  async deleteAnswers(
    context: string,
    subjects: ObjectId[],
    session?: ClientSession,
  ) {
    const answers = await this.answers.findAll(
      { context, subject: { $in: subjects } },
      null,
      { session },
    );
    await this.revisions.deleteMany(
      { answer: { $in: answers.map((a) => a._id) } },
      { session },
    );
    await this.answers.deleteMany(
      { context, subject: { $in: subjects } },
      { session },
    );
  }
}
