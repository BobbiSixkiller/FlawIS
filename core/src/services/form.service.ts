import { Service } from "typedi";
import { ObjectId } from "mongodb";
import { Repository } from "../repositories/base.repository";
import { FieldType, Form } from "../entitites/Form";
import { toDTO } from "../util/helpers";
import { FormFieldInput } from "../resolvers/types/form/form.types";
import { ClientSession } from "mongoose";
import { isEqual, toString, trim } from "lodash";

function oid(id: any): string | null {
  if (!id) return null;
  if (id instanceof ObjectId) return id.toHexString();
  return String(id);
}

function nstr(v: any): string | null {
  const s = trim(toString(v ?? ""));
  return s.length ? s : null;
}

function canonFieldsKeepOrder(fields: any[]) {
  return (fields ?? []).map((f) => {
    const type = f.type as FieldType;

    // Decide if option order matters:
    // - if YES: keep as-is
    // - if NO: sort by value+text
    const selectOptions =
      type === FieldType.Select
        ? (f.selectOptions ?? [])
            .map((o: any) => ({
              value: trim(toString(o?.value ?? "")),
              text: trim(toString(o?.text ?? "")),
            }))
            // drop empty rows (optional)
            .filter((o: any) => o.value || o.text)
        : null;

    return {
      id: oid(f.id ?? f._id), // normalize ObjectId
      name: nstr(f.name),
      type,
      label: nstr(f.label),
      required: Boolean(f.required),
      placeholder: nstr(f.placeholder),
      helpText: nstr(f.helpText),
      selectOptions,
    };
  });
}

@Service()
export class FormService {
  constructor(private readonly formRepository = new Repository(Form)) {}

  async getForm(id: ObjectId) {
    const form = await this.formRepository.findOne({ _id: id });
    if (!form) throw new Error("Form not found!");
    return toDTO(form);
  }

  async getLatestCourseForm(courseId: ObjectId) {
    const forms = await this.formRepository.findAll(
      { course: courseId },
      null,
      {
        sort: { version: -1 },
        limit: 1,
      },
    );

    const latest = forms[0];

    if (!latest) throw new Error("Form not found for course!");
    return toDTO(latest);
  }

  async getCourseForms(courseId: ObjectId) {
    const forms = await this.formRepository.findAll(
      { course: courseId },
      null,
      {
        sort: { version: -1 },
      },
    );
    return forms.map(toDTO);
  }

  async createForm(
    formFields: FormFieldInput[],
    courseId: ObjectId,
    session?: ClientSession,
  ) {
    for (let attempt = 0; attempt < 3; attempt++) {
      const latest = await this.formRepository.findOne(
        { course: courseId },
        null,
        { sort: { version: -1 }, session } as any,
      );

      if (latest) {
        const incomingCanon = canonFieldsKeepOrder(formFields);
        const storedCanon = canonFieldsKeepOrder((latest as any).fields);

        // Field order is preserved, so reorder => not equal => new version
        if (isEqual(incomingCanon, storedCanon)) {
          return toDTO(latest);
        }
      }

      const nextVersion = (latest?.version ?? 0) + 1;

      try {
        const created = await this.formRepository.create(
          {
            course: courseId,
            version: nextVersion,
            fields: formFields.map(({ id, ...rest }) => ({
              _id: id ?? new ObjectId(),
              ...rest,
            })),
          },
          { session },
        );

        return toDTO(created);
      } catch (e: any) {
        if (String(e?.message ?? "").includes("E11000")) continue;
        throw e;
      }
    }

    throw new Error("Failed to create form version. Please retry.");
  }

  /**
   * Optional: only allow deleting latest version to avoid breaking history.
   */
  async deleteLatestForm(courseId: ObjectId) {
    const latest = await this.formRepository.findOne(
      { course: courseId },
      null,
      { sort: { version: -1 } } as any,
    );
    if (!latest) throw new Error("No form to delete!");

    const deleted = await this.formRepository.findOneAndDelete({
      _id: latest._id,
    });
    if (!deleted) throw new Error("Delete failed!");
    return toDTO(deleted);
  }
}
