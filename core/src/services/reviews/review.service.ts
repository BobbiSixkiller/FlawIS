import { createHash, randomBytes } from "crypto";
import { ObjectId } from "mongodb";
import { ClientSession } from "mongoose";
import { reviewQueuePipeline, QueueFilters } from "./queue.pipeline";
import {
  bpfQuestionnaire,
  bpfFormalChecks,
  conditionsId,
} from "./bpf-questionnaire";
import { reviewFormView } from "./form-view";
import { reviewBlockers, reviewError, blockerMessages } from "./workflow";
import { Service } from "typedi";
import { Notification } from "../../entitites/Notification";
import { FieldType } from "../../entitites/Form";
import { Attendee } from "../../entitites/Attendee";
import { Conference } from "../../entitites/Conference";
import { User } from "../../entitites/User";
import { Section } from "../../entitites/Section";
import { Submission } from "../../entitites/Submission";
import {
  CorrectionPoint,
  FeedbackRelease,
  ManuscriptVersion,
  RevisionRequest,
  Reviewer,
  ReviewerEligibility,
  ReviewAssignment,
  ReviewRound,
  ReviewSettings,
  SubmissionReview,
  ReviewFile,
} from "../../entitites/Review";
import { Repository } from "../../repositories/base.repository";
import { CtxUser } from "../../util/types";
import { toDTO, withOptionalTransaction } from "../../util/helpers";
import { seal, unseal } from "../../util/secrets";
import { FormService } from "../form.service";
import { RmqService } from "../rmq.service";
import { ActivityService } from "./activity.service";
import { isReviewAuthor, ReviewAccessService } from "./access.service";

export const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export const recommendations = ["PUBLISH", "CONDITIONAL", "REJECT"];
const id = (value: unknown) => new ObjectId(String(value));

function authorCorrection(request: RevisionRequest & { _id: ObjectId }) {
  return {
    id: String(request._id),
    versionNumber: request.versionNumber,
    templateUrl: request.templateConference
      ? "/api/conference-review/templates/" +
        request.templateConference +
        "/manuscript?submission=" +
        request.submission
      : undefined,
    kind: request.kind,
    manuscriptFile: request.manuscriptFile,
    proofPdf: request.proofPdf,
    instructions: request.instructions,
    deadline: request.deadline,
    status: request.status,
    note: request.note,
    points: request.points?.map(({ assignment, ...point }) => point),
  };
}

const plain = <T>(doc: any): T => (doc?.toJSON ? (toDTO(doc) as T) : doc);
const dataAnswers = (value: any): Record<string, string | string[]> =>
  value instanceof Map ? Object.fromEntries(value) : value || {};

@Service()
export class ReviewService {
  private readonly notifications = new Repository(Notification);
  readonly reviewers = new Repository(Reviewer);
  readonly settings = new Repository(ReviewSettings);
  readonly cases = new Repository(SubmissionReview);
  readonly versions = new Repository(ManuscriptVersion);
  readonly rounds = new Repository(ReviewRound);
  readonly assignments = new Repository(ReviewAssignment);
  readonly releases = new Repository(FeedbackRelease);
  readonly revisions = new Repository(RevisionRequest);
  readonly files = new Repository(ReviewFile);
  readonly eligibility = new Repository(ReviewerEligibility);
  private readonly submissions = new Repository(Submission);
  private readonly users = new Repository(User);
  private readonly attendees = new Repository(Attendee);
  private readonly conferences = new Repository(Conference);

  constructor(
    private readonly access: ReviewAccessService,
    private readonly activity: ActivityService,
    private readonly forms: FormService,
    private readonly mail: RmqService,
  ) {}

  async reviewerPage(
    user: CtxUser,
    search = "",
    after?: ObjectId,
    archived?: boolean,
  ) {
    if (
      !user.access.includes("ADMIN" as any) &&
      !(await this.access.scopes(user)).length
    )
      throw new Error("Coordinator access required.");
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const filter = {
      ...(archived === undefined ? {} : { archived }),
      ...(search
        ? {
            $or: [
              { name: { $regex: escaped, $options: "i" } },
              { email: { $regex: escaped, $options: "i" } },
              { institution: { $regex: escaped, $options: "i" } },
              { department: { $regex: escaped, $options: "i" } },
              { expertise: { $regex: escaped, $options: "i" } },
            ],
          }
        : {}),
    };
    const [records, totalCount] = await Promise.all([
      this.reviewers.findAll(
        { ...filter, ...(after ? { _id: { $lt: after } } : {}) },
        null,
        { sort: { _id: -1 }, limit: 101 },
      ),
      this.reviewers.countDocuments(filter),
    ]);
    const rows = records.slice(0, 100);
    return {
      rows,
      totalCount,
      hasNextPage: records.length > 100,
      endCursor: rows.length ? String(rows[rows.length - 1]._id) : null,
    };
  }

  async reviewerList(user: CtxUser, search = "", after?: ObjectId) {
    return (await this.reviewerPage(user, search, after)).rows;
  }

  async saveReviewer(user: CtxUser, data: any, reviewerId?: ObjectId) {
    await this.access.library(user);

    const email = String(data.email ?? "")
      .trim()
      .toLowerCase();

    if (!/^\S+@\S+\.\S+$/.test(email) || !String(data.name || "").trim())
      throw new Error("Name and a valid email are required.");
    if (
      ![data.languages || [], data.expertise || []].every(
        (v) =>
          Array.isArray(v) &&
          v.every((item) => typeof item === "string" && item.length <= 200),
      )
    )
      throw new Error("Languages and expertise must be lists of text values.");
    const values = {
      name: String(data.name).trim().slice(0, 200),
      email,
      institution: String(data.institution || "").slice(0, 300),
      department: String(data.department || "").slice(0, 300),
      languages: (data.languages || []).slice(0, 20),
      expertise: (data.expertise || []).slice(0, 50),
      notes: String(data.notes || "").slice(0, 5000),
      archived: Boolean(data.archived),
    };
    return withOptionalTransaction(undefined, async (session) => {
      const reviewer = reviewerId
        ? await this.reviewers.findOneAndUpdate(
            { _id: reviewerId },
            { $set: values },
            { new: true, runValidators: true, session },
          )
        : await this.reviewers.create(values, { session });
      if (!reviewer) throw new Error("Reviewer not found.");
      await this.activity.record(
        user,
        reviewerId ? "reviewer.updated" : "reviewer.created",
        undefined,
        undefined,
        { reviewer: String(reviewer._id), fields: Object.keys(values) },
        session,
      );
      return reviewer;
    });
  }

  async configure(user: CtxUser, conference: ObjectId, data: any) {
    return withOptionalTransaction(undefined, () =>
      this.configureSettings(user, conference, data),
    );
  }

  private async configureSettings(
    user: CtxUser,
    conference: ObjectId,
    data: any,
  ) {
    await this.access.conference(user, conference, undefined, true);
    if (!(await this.conferences.exists({ _id: conference })))
      throw new Error("Conference not found.");
    const previous = await this.settings.findOne({ conference });
    if (data.templateFile)
      throw new Error("New review rounds use the built-in report layout.");
    const changedFields = Object.keys(data);
    data = { ...(previous ? plain<any>(previous) : {}), ...data };
    let form =
      data.form || previous?.form
        ? await this.forms.getForm(id(data.form || previous!.form))
        : null;

    if (data.useBpfQuestionnaire) {
      if (!form?.fields.some((f) => String(f.id) === conditionsId)) {
        const preset = bpfQuestionnaire();
        const definition = await this.forms.createDefinition(
          "BPF · Scientific paper review",
          "BPF conference questionnaire",
          user.id,
        );
        form = await this.forms.publish(definition.id, preset.fields);
        data.recommendationField = String(preset.recommendation.id);
        data.authorFields = preset.fields
          .filter(
            (f) => f.type === FieldType.Textarea || f === preset.recommendation,
          )
          .map((f) => String(f.id));
      }
    }

    if (!form && data.enabled) {
      const definition = await this.forms.createDefinition(
        "Conference review / Recenzný posudok",
        "Reusable review questionnaire",
        user.id,
      );

      const recommendationId = new ObjectId(),
        commentsId = new ObjectId();

      form = await this.forms.publish(definition.id, [
        {
          id: recommendationId,
          type: FieldType.RadioGroup,
          label: "Overall recommendation / Celkové odporúčanie",
          required: true,
          selectOptions: [
            {
              value: "PUBLISH",
              text: "Recommend publishing / Odporúčam publikovať",
            },
            {
              value: "CONDITIONAL",
              text: "Publish conditionally / Podmienečne publikovať",
            },
            {
              value: "REJECT",
              text: "Do not publish / Neodporúčam publikovať",
            },
          ],
        },
        {
          id: commentsId,
          type: FieldType.Textarea,
          label: "Comments and suggestions / Pripomienky a odporúčania",
          required: false,
        },
      ]);
      data.recommendationField = String(recommendationId);
      data.authorFields = [String(recommendationId), String(commentsId)];
    }

    const recommendationField =
      data.recommendationField ||
      (await this.settings.findOne({ conference }))?.recommendationField;

    if (form) {
      const field = form.fields.find(
        (f) => String(f.id) === recommendationField,
      );
      if (
        !field?.required ||
        ![FieldType.Select, FieldType.RadioGroup].includes(field.type) ||
        !recommendations.every((v) =>
          field.selectOptions?.some((o) => o.value === v),
        )
      )
        throw new Error(
          "Map a required recommendation field with PUBLISH, CONDITIONAL and REJECT choices.",
        );
      for (const fieldId of data.authorFields || [])
        if (!form.fields.some((f) => String(f.id) === fieldId))
          throw new Error("Unknown author-visible field.");
    }

    if (data.replyTo && !/^\S+@\S+\.\S+$/.test(String(data.replyTo)))
      throw new Error("Invalid reply-to email.");
    const sectionRequirements =
      data.sectionRequirements ?? previous?.sectionRequirements ?? {};
    const requirements = Object.entries(sectionRequirements);
    if (
      requirements.some(
        ([key, value]) =>
          !ObjectId.isValid(key) ||
          typeof value !== "string" ||
          value.length > 2000,
      )
    )
      throw new Error("Invalid formal requirements.");

    if (
      (await new Repository(Section).countDocuments({
        conference,
        _id: { $in: requirements.map(([key]) => new ObjectId(key)) },
      })) !== requirements.length
    )
      throw new Error(
        "Formal requirements must reference conference sections.",
      );

    const count = Number(data.requiredReviews ?? 2);
    if (!Number.isInteger(count) || count < 1 || count > 10)
      throw new Error("Required reviews must be between 1 and 10.");
    return withOptionalTransaction(undefined, async (session) => {
      const result = await this.settings.findOneAndUpdate(
        { conference },
        {
          $set: {
            enabled: Boolean(data.enabled),
            sectionRequirements,
            requiredReviews: count,
            ...(form ? { form: form.id } : {}),
            recommendationField,
            authorFields: data.authorFields || [],
            remindersEnabled: Boolean(data.remindersEnabled),
            instructions: String(data.instructions || "").slice(0, 10000),
            signature: String(data.signature || "").slice(0, 5000),
            replyTo: String(data.replyTo || ""),
          },
        },
        { new: true, upsert: true, runValidators: true, session },
      );
      await this.activity.record(
        user,
        "review.settings_updated",
        conference,
        undefined,
        { fields: changedFields },
        session,
      );
      return result;
    });
  }

  async queue(
    user: CtxUser,
    conference: ObjectId,
    section?: ObjectId,
    after?: ObjectId,
    first = 30,
    filters: QueueFilters = {},
  ) {
    const scopes = await this.access.scopes(user);
    const wide =
      user.access.includes("ADMIN" as any) ||
      scopes.some(
        (s) => String(s.conference) === String(conference) && !s.section,
      );
    const sections = scopes
      .filter((s) => String(s.conference) === String(conference) && s.section)
      .map((s) => s.section!);

    if (section) await this.access.conference(user, conference, section);
    else if (!wide && !sections.length)
      throw new Error("Coordinator access required.");

    const [active, config] = await Promise.all([
      this.attendees.findAll(
        { "conference._id": conference, "ticket.withSubmission": true },
        { "user._id": 1 },
      ),
      this.settings.findOne({ conference }),
    ]);
    first = Math.min(100, Math.max(1, first));
    const collections = {
      users: this.users.collectionName,
      cases: this.cases.collectionName,
      rounds: this.rounds.collectionName,
      versions: this.versions.collectionName,
      assignments: this.assignments.collectionName,
      revisions: this.revisions.collectionName,
      notifications: this.notifications.collectionName,
    };
    const actors = [
      new ObjectId(String(user.id)),
      ...(user.originalActorId ? [new ObjectId(user.originalActorId)] : []),
    ];
    const [result] = await this.submissions.aggregate<{
      rows: any[];
      count: { total: number }[];
    }>(
      reviewQueuePipeline(
        {
          conference,
          authors: { $in: active.map((a) => new ObjectId(String(a.user.id))) },
          ...(section
            ? { section }
            : !wide
              ? { section: { $in: sections } }
              : {}),
        },
        collections,
        actors,
        config?.requiredReviews || 2,
        filters,
        after,
        first,
      ),
    );
    const rows = result.rows.slice(0, first);
    await Promise.all(
      rows.map((row) =>
        this.activity.read(
          user,
          "submission.listed",
          conference,
          new ObjectId(row.submissionId),
        ),
      ),
    );
    return {
      rows,
      totalCount: result.count[0]?.total || 0,
      hasNextPage: result.rows.length > first,
      endCursor: rows[rows.length - 1]?.submissionId || null,
    };
  }

  async blockers(paper: any, review: any, config: any) {
    const [round, version, correction, active] = await Promise.all([
      review?.currentRound
        ? this.rounds.findOne({ _id: review.currentRound })
        : null,
      review?.currentVersion
        ? this.versions.findOne({ _id: review.currentVersion })
        : null,
      this.revisions.exists({
        submission: paper._id,
        status: { $in: ["REQUESTED", "RECEIVED"] },
      }),
      this.attendees.exists({
        "conference._id": paper.conference,
        "user._id": { $in: paper.authors },
        "ticket.withSubmission": true,
      }),
    ]);
    const assignments = round
      ? await this.assignments.findAll({ round: round._id, active: true })
      : [];
    return reviewBlockers({
      enabled: Boolean(config?.enabled),
      activeParticipant: Boolean(active),
      closed: Boolean(review && review.decision !== "PENDING"),
      configured: Boolean(config?.form && config?.recommendationField),
      hasOriginal: Boolean(version),
      hasAnonymous: Boolean(version?.anonymousFile),
      approved: Boolean(review?.formalApproved && version?.anonymousApproved),
      frozen: Boolean(
        round?.startedAt && String(round.manuscript) === String(version?._id),
      ),
      started: Boolean(round?.startedAt),
      assigned: assignments.length,
      required: round?.requiredReviews || config?.requiredReviews || 2,
      incomplete: assignments.some(
        (a) =>
          a.status !== "SUBMITTED" ||
          review.authorEmails.includes(a.email.toLowerCase()),
      ),
      correctionOpen: Boolean(correction),
      decisionReady:
        (!round?.bpf || !!review?.participationConfirmed) &&
        !(
          version &&
          (await this.revisions.exists({
            submission: paper._id,
            receivedVersion: version._id,
            status: "NEEDS_CHANGES",
          }))
        ) &&
        !!review?.formalApproved &&
        !!active &&
        !!version &&
        assignments.every(
          (a) =>
            a.recommendation !== "REJECT" &&
            String(a.closedVersion) === String(version._id),
        ),
    });
  }

  async assignmentEligibility(
    user: CtxUser,
    submission: ObjectId,
    reviewerId: ObjectId,
  ) {
    const paper = await this.access.paper(user, submission);
    const review = await this.cases.findOne({ submission });
    return this.checkEligibility(paper, review, reviewerId);
  }

  private async checkEligibility(
    paper: any,
    review: any,
    reviewerId: ObjectId,
  ) {
    const [reviewer, authors, eligibility] = await Promise.all([
      this.reviewers.findOne({ _id: reviewerId, archived: false }),
      this.users.findAll({
        _id: { $in: [...(review?.authorIds || []), ...paper.authors] },
      }),
      this.eligibility.findOne({
        conference: paper.conference,
        reviewer: reviewerId,
      }),
    ]);
    if (!reviewer)
      return { blocked: "REVIEWER_INACTIVE", warnings: [] as string[] };
    if (
      authors.some((a) => a.email.toLowerCase() === reviewer.email) ||
      review?.authorEmails.includes(reviewer.email)
    )
      return { blocked: "SELF_REVIEW", warnings: [] as string[] };
    const warnings: string[] = [];
    if (
      !eligibility ||
      !reviewer.department ||
      !authors.every((a) => a.organization)
    )
      warnings.push("AFFILIATION_INCOMPLETE");
    if (
      authors.some(
        (a) =>
          a.organization &&
          reviewer.department &&
          a.organization
            .toLowerCase()
            .includes(reviewer.department.toLowerCase()),
      )
    )
      warnings.push("DEPARTMENT_MATCH");
    if (
      eligibility?.participatedSections.some(
        (s) => String(s) === String(paper.section),
      )
    )
      warnings.push("SECTION_PARTICIPANT");
    if (
      eligibility?.guarantorSections.some(
        (s) => String(s) === String(paper.section),
      )
    )
      warnings.push("SECTION_GUARANTOR");
    if (eligibility?.conflicts.some((s) => String(s) === String(paper._id)))
      warnings.push("DECLARED_CONFLICT");
    return { blocked: null, warnings };
  }

  async detail(user: CtxUser, submission: ObjectId) {
    const paper = await this.access.paper(user, submission);
    const review = await this.cases.findOne({ submission });
    const [authors, versions, rounds, revisions] = await Promise.all([
      this.users.findAll(
        { _id: { $in: paper.authors } },
        { name: 1, email: 1, organization: 1 },
      ),
      this.versions.findAll({ submission }, null, { sort: { number: -1 } }),
      review
        ? this.rounds.findAll({ review: review._id }, null, {
            sort: { number: -1 },
          })
        : [],
      this.revisions.findAll({ submission }, null, { sort: { createdAt: -1 } }),
    ]);
    const reports = await Promise.all(
      rounds.map(async (round) => ({
        ...plain<any>(round),
        questionnaire: reviewFormView(await this.forms.getForm(round.form)),
        assignments: await Promise.all(
          (
            await this.assignments.findAll({ round: round._id }, null, {
              sort: { slot: 1, createdAt: -1 },
            })
          ).map(async (assignment) => ({
            ...(await this.assignmentView(assignment)),
            answer: await this.forms.answer("REVIEW", assignment._id),
          })),
        ),
      })),
    );
    await this.activity.read(
      user,
      "submission.viewed",
      paper.conference as ObjectId,
      submission,
    );
    const config = await this.settings.findOne({
      conference: paper.conference,
    });
    const versionFiles = new Map(
      (
        await this.files.findAll(
          { _id: { $in: versions.map((v) => v.file) }, submission },
          { kind: 1 },
        )
      ).map((f) => [String(f._id), f.kind]),
    );
    return {
      blockers: await this.blockers(paper, review, config),
      conferenceId: String(paper.conference),
      sectionId: String(paper.section),
      titleSk: paper.translations.sk.name,
      requirements: config?.sectionRequirements?.[String(paper.section)] || "",
      submissionId: String(submission),
      title: paper.translations.en.name,
      authors: authors.map((a) => ({
        id: String(a._id),
        name: a.name,
        email: a.email,
        organization: a.organization,
      })),
      review: review ? plain(review) : null,
      versions: versions.map((v) => ({
        ...plain<object>(v),
        kind: versionFiles.get(String(v.file)),
      })),
      rounds: reports,
      revisions: revisions.map((r) => {
        const { tokenHash, ...safe } = plain<any>(r);
        return safe;
      }),
    };
  }

  async ensureCase(paper: any, session?: ClientSession) {
    let review = await this.cases.findOne(
      { submission: paper._id || paper.id },
      null,
      { session },
    );
    const authors = await this.users.findAll(
      { _id: { $in: paper.authors } },
      { email: 1 },
    );

    if (!review)
      review = await this.cases.create(
        {
          submission: paper._id || paper.id,
          conference: paper.conference,
          section: paper.section,
          authorIds: paper.authors,
          authorEmails: authors.map((a) => a.email.toLowerCase()),
        },
        { session },
      );
    else
      review = (await this.cases.findOneAndUpdate(
        { _id: review._id },
        {
          $set: { section: paper.section },
          $addToSet: {
            authorIds: { $each: paper.authors },
            authorEmails: { $each: authors.map((a) => a.email.toLowerCase()) },
          },
        },
        { new: true, session },
      ))!;

    return review;
  }

  async action(
    user: CtxUser,
    submission: ObjectId,
    action: string,
    data: any,
    hostname: string,
  ) {
    const paper = await this.access.paper(user, submission);

    if (
      action !== "DECIDE" &&
      !(await this.attendees.exists({
        "conference._id": paper.conference,
        "user._id": { $in: paper.authors },
        "ticket.withSubmission": true,
      }))
    )
      throw new Error(
        "Only submissions of active participants can be reviewed.",
      );

    return withOptionalTransaction(undefined, async (session) => {
      const review = await this.ensureCase(paper, session);
      const expected = Number(data.expectedRevision ?? review.revision);
      const locked = await this.cases.findOneAndUpdate(
        { _id: review._id, revision: expected },
        {
          $inc: { revision: 1 },
          $addToSet: { authorIds: { $each: paper.authors } },
        },
        { new: true, session },
      );
      if (!locked)
        reviewError(
          "CONFLICT",
          "This paper changed. Reload before continuing.",
        );
      const config = await this.settings.findOne(
        { conference: review.conference },
        null,
        { session },
      );
      if (!config?.enabled)
        throw new Error("Enable reviews for this conference first.");
      const blocked = (await this.blockers(paper, review, config))[
        action === "DECIDE" && data.decision === "ACCEPTED"
          ? "ACCEPTED"
          : action
      ];
      if (blocked) reviewError(blocked, blockerMessages[blocked]);
      const outcome: { url?: string } = {};
      const open = review.decision === "PENDING";
      const proofAction = [
        "REQUEST_PROOF",
        "NO_PROOF_RESPONSE",
        "RECORD_PROOF_APPROVAL",
      ].includes(action);
      if (proofAction && review.decision !== "ACCEPTED")
        throw new Error("Accept the manuscript before preparing publication.");
      if (!open && action === "DECIDE" && data.decision !== "PENDING")
        throw new Error(
          "Reopen the submission before recording another decision.",
        );
      if (!open && action !== "DECIDE" && !proofAction)
        throw new Error("This submission is closed.");
      let round = review.currentRound
        ? await this.rounds.findOne({ _id: review.currentRound }, null, {
            session,
          })
        : null;

      if (
        ["ASSIGN", "NEXT_ROUND"].includes(action) &&
        (!round || action === "NEXT_ROUND")
      ) {
        if (!config.form || !config.recommendationField)
          throw new Error("Configure the questionnaire first.");
        if (
          round &&
          (
            await this.assignments.findAll(
              { round: round._id, active: true },
              null,
              { session },
            )
          ).some((a) => a.status !== "SUBMITTED")
        )
          throw new Error("Complete or cancel the current round first.");
        round = await this.rounds.create(
          {
            review: review._id,
            number: review.roundNumber + 1,
            requiredReviews: config.requiredReviews,
            form: config.form,
            bpf: (await this.forms.getForm(config.form)).fields.some(
              (f) => String(f.id) === conditionsId,
            ),
            recommendationField: config.recommendationField,
            authorFields: config.authorFields,
          },
          { session },
        );
        await this.forms.bind("REVIEW", round._id, round.form, session);
        await this.cases.findOneAndUpdate(
          { _id: review._id },
          { $set: { currentRound: round._id, roundNumber: round.number } },
          { session },
        );
      }

      const formalForm = round?.form || config.form;
      const checkBpfFormal =
        (action === "PREPARE" || action === "VERIFY_REVISION") &&
        formalForm &&
        (await this.forms.getForm(formalForm)).fields.some(
          (f) => String(f.id) === conditionsId,
        );
      const formalChecks =
        action === "PREPARE" && checkBpfFormal
          ? bpfFormalChecks(data)
          : undefined;

      if (action === "SET_PARTICIPATION") {
        if (!round?.bpf || !["yes", "no"].includes(data.participation))
          throw new Error("Choose the author's participation status.");
        await this.cases.findOneAndUpdate(
          { _id: review._id },
          { $set: { participationConfirmed: data.participation === "yes" } },
          { session },
        );
      } else if (action === "PREPARE") {
        const version = await this.versions.findOne(
          { _id: review.currentVersion, submission },
          null,
          { session },
        );
        if (!version?.anonymousFile)
          throw new Error(
            "Upload the original and anonymized manuscript first.",
          );
        if (
          round?.startedAt &&
          String(round.manuscript) === String(version._id)
        )
          throw new Error(
            "A sent round is frozen. Upload a new revision for changes.",
          );
        await this.versions.findOneAndUpdate(
          { _id: version._id },
          {
            $set: {
              anonymousApproved: true,
              approvedBy: user.id,
              ...(formalChecks ? { formalChecks } : {}),
            },
          },
          { session },
        );
        await this.cases.findOneAndUpdate(
          { _id: review._id },
          {
            $set: {
              formalApproved: true,
              formalNotes: String(data.notes || "").slice(0, 10000),
            },
          },
          { session },
        );
      } else if (action === "ASSIGN") {
        const reviewer = await this.reviewers.findOne(
          { _id: id(data.reviewerId), archived: false },
          null,
          { session },
        );
        if (!reviewer) throw new Error("Select an active reviewer.");
        const eligibility = await this.checkEligibility(
          paper,
          review,
          reviewer._id,
        );
        if (eligibility.blocked)
          reviewError(
            eligibility.blocked,
            "Authors cannot review their own paper.",
          );
        if (eligibility.warnings.length && !String(data.reason || "").trim())
          reviewError(
            "ELIGIBILITY_OVERRIDE_REQUIRED",
            "Confirm eligibility with an override reason.",
            { reason: "An override reason is required." },
          );

        const slot = Number(data.slot),
          deadline = new Date(data.deadline);

        if (
          !Number.isInteger(slot) ||
          slot < 1 ||
          slot > round!.requiredReviews ||
          !Number.isFinite(deadline.getTime())
        )
          throw new Error("Select a valid reviewer slot and deadline.");
        await this.assignments.create(
          {
            round: round!._id,
            review: review._id,
            reviewer: reviewer._id,
            slot,
            name: reviewer.name,
            email: reviewer.email,
            deadline,
            conflictReason: String(data.reason || "").slice(0, 5000),
          },
          { session },
        );
      } else if (["SEND", "REMIND", "PREPARE_LINK"].includes(action)) {
        const assignment = await this.assignments.findOne(
          { _id: id(data.assignmentId), review: review._id, active: true },
          null,
          { session },
        );
        if (
          !assignment ||
          review.authorEmails.includes(assignment.email.toLowerCase()) ||
          String(assignment.round) !== String(review.currentRound) ||
          ["SUBMITTED", "DECLINED"].includes(assignment.status)
        )
          throw new Error("This assignment cannot be sent.");
        round = await this.rounds.findOne({ _id: assignment.round }, null, {
          session,
        });
        const version = await this.versions.findOne(
          { _id: review.currentVersion },
          null,
          { session },
        );

        if (!round?.startedAt) {
          if (
            !review.formalApproved ||
            !version?.anonymousApproved ||
            !version.anonymousFile
          )
            throw new Error(
              "Approve the current manuscript and anonymized copy before sending.",
            );
          await this.rounds.findOneAndUpdate(
            { _id: round!._id },
            {
              $set: {
                startedAt: new Date(),
                manuscript: version._id,
                anonymousFile: version.anonymousFile,
              },
            },
            { session },
          );
          round!.anonymousFile = version.anonymousFile;
        }

        const token = assignment.tokenEncrypted
          ? unseal(assignment.tokenEncrypted)
          : randomBytes(32).toString("base64url");

        if (!assignment.tokenHash)
          await this.assignments.findOneAndUpdate(
            { _id: assignment._id },
            {
              $set: {
                tokenHash: hashToken(token),
                tokenEncrypted: seal(token),
                expiresAt: new Date(
                  assignment.deadline.getTime() + 30 * 86400000,
                ),
                status:
                  action === "PREPARE_LINK" ? assignment.status : "INVITED",
              },
            },
            { session },
          );

        if (action === "PREPARE_LINK")
          outcome.url = `${this.origin(hostname)}/sk/review/${token}`;
        else {
          if (assignment.status === "ASSIGNED")
            await this.assignments.findOneAndUpdate(
              { _id: assignment._id },
              { $set: { status: "INVITED" } },
              { session },
            );
          await this.sendMessage(
            {
              hostname,
              email: assignment.email,
              name: assignment.name,
              subject:
                action === "REMIND"
                  ? "Pripomenutie recenzného posudku"
                  : "Pozvanie na recenzovanie príspevku",
              text: `${config.instructions}\n\nTermín: ${assignment.deadline.toLocaleDateString("sk-SK", { timeZone: "Europe/Bratislava" })}\n\n${config.signature}`,
              url: `${this.origin(hostname)}/sk/review/${token}`,
              conferenceId: review.conference,
              submissionId: submission,
              assignmentId: assignment._id,
              fileIds: round!.anonymousFile
                ? [String(round!.anonymousFile)]
                : [],
              replyTo: config.replyTo,
            },
            session,
          );
        }
      } else if (["CANCEL", "REOPEN"].includes(action)) {
        if (!String(data.reason || "").trim())
          throw new Error("A reason is required.");
        const assignment = await this.assignments.findOne(
          { _id: id(data.assignmentId), review: review._id, active: true },
          null,
          { session },
        );
        if (
          !assignment ||
          String(assignment.round) !== String(review.currentRound)
        )
          throw new Error("Assignment is not in the current round.");

        if (action === "CANCEL")
          await this.assignments.findOneAndUpdate(
            { _id: assignment._id },
            {
              $set: { active: false, status: "CANCELLED" },
              $unset: { tokenHash: 1, tokenEncrypted: 1 },
            },
            { session },
          );
        else {
          const answer = await this.forms.answer(
            "REVIEW",
            assignment._id,
            session,
          );
          if (!answer?.submitted)
            throw new Error("Only a submitted report can be reopened.");
          await this.forms.saveAnswers(
            {
              context: "REVIEW",
              owner: assignment.round,
              subject: assignment._id,
              respondent: String(user.id),
              form: answer.form,
              answers: dataAnswers(answer.answers),
              submitted: false,
              expectedRevision: answer.revision,
              reopen: true,
            },
            session,
          );
          await this.assignments.findOneAndUpdate(
            { _id: assignment._id },
            {
              $set: { status: "STARTED" },
              $unset: {
                recommendation: 1,
                submittedAt: 1,
                closedVersion: 1,
                closedAt: 1,
              },
            },
            { session },
          );
        }
      } else if (action === "REQUEST_REVISION") {
        const instructions = String(data.instructions || "").trim(),
          deadline = new Date(data.deadline);

        if (!Number.isFinite(deadline.getTime()))
          throw new Error("A correction deadline is required.");

        if (
          await this.revisions.exists({
            submission,
            status: { $in: ["REQUESTED", "RECEIVED"] },
          })
        )
          throw new Error("A correction request is already open.");

        if (!review.currentVersion || deadline <= new Date())
          throw new Error(
            "A current manuscript and future deadline are required.",
          );
        const reports = round
          ? await this.assignments.findAll({
              round: round._id,
              active: true,
              status: "SUBMITTED",
            })
          : [];
        const parent = data.parentRequest
          ? await this.revisions.findOne({
              _id: id(data.parentRequest),
              submission,
              status: "NEEDS_CHANGES",
              receivedVersion: review.currentVersion,
              round: round?._id,
            })
          : null;
        if (data.parentRequest && !parent)
          throw new Error("This follow-up is stale.");

        if (
          !parent &&
          (await this.revisions.exists({
            submission,
            round: round?._id,
            receivedVersion: review.currentVersion,
            status: "NEEDS_CHANGES",
          }))
        )
          throw new Error(
            "Use the unresolved correction points to create a follow-up request.",
          );

        const kind =
          parent?.kind || (reports.length ? "POST_REVIEW" : "FORMAL");
        const points: CorrectionPoint[] = parent
          ? (parent.points || [])
              .filter((p) => p.status === "NEEDS_CHANGES")
              .map(({ id, text, assignment }) => ({
                id,
                text,
                assignment,
                status: "PENDING",
              }))
          : instructions
              .split(/\r?\n\s*\r?\n/)
              .filter(Boolean)
              .map((text) => ({
                id: String(new ObjectId()),
                text,
                status: "PENDING",
              }));

        if (!parent)
          for (const report of reports) {
            const text = data.reportPoints?.[String(report._id)];

            if (typeof text === "string" && text.trim()) {
              if (text.length > 25000)
                throw new Error("Correction instructions are too long.");

              points.push(
                ...text
                  .trim()
                  .split(/\r?\n\s*\r?\n/)
                  .map((text) => ({
                    id: String(new ObjectId()),
                    text,
                    assignment: String(report._id),
                    status: "PENDING" as const,
                  })),
              );
            }
          }

        if (data.assignmentId && !parent) {
          if (!reports.some((a) => String(a._id) === String(data.assignmentId)))
            throw new Error("Select a submitted report from this round.");
          for (const point of points)
            point.assignment = String(data.assignmentId);
        }

        const authorInstructions = points.map((p) => p.text).join("\n\n");
        if (
          !points.length ||
          points.length > 80 ||
          authorInstructions.length > 25000
        )
          throw new Error(
            "Use up to 80 correction points and 25000 characters.",
          );
        const token = randomBytes(32).toString("base64url");
        const source = await this.versions.findOne({
          _id: review.currentVersion,
          submission,
        });
        const template =
          source?.template ||
          (await this.conferences.findOne({ _id: review.conference }))
            ?.manuscriptTemplateFile;
        await this.revisions.create(
          {
            submission,
            kind,
            points,
            versionNumber: source?.number,
            templateConference: template ? review.conference : undefined,
            reportDates:
              parent?.reportDates ||
              Object.fromEntries(
                reports.map((a) => [
                  String(a._id),
                  a.submittedAt?.toISOString(),
                ]),
              ),
            carriedAssignments: parent
              ? [
                  ...new Set([
                    ...(parent.carriedAssignments || []),
                    ...(parent.points || [])
                      .filter(
                        (p) =>
                          p.status === "VERIFIED" &&
                          p.assignment &&
                          !points.some(
                            (open) => open.assignment === p.assignment,
                          ),
                      )
                      .map((p) => p.assignment!),
                  ]),
                ]
              : [],
            round: round?._id,
            sourceVersion: review.currentVersion,
            parentRequest: parent?._id,
            instructions: authorInstructions,
            deadline,
            tokenHash: hashToken(token),
            expiresAt: new Date(deadline.getTime() + 30 * 86400000),
          },
          { session },
        );
        const author = await this.users.findOne({ _id: paper.authors[0] });
        if (!author)
          throw new Error("The corresponding author has no account.");
        await this.sendMessage(
          {
            hostname,
            email: author.email,
            name: author.name,
            subject: "Výzva na opravu príspevku",
            text: `${points.map((p) => p.text).join("\n\n")}\n\nTermín / Deadline: ${deadline.toISOString().slice(0, 10)}\n\n${config.signature}`,
            url: `${this.origin(hostname)}/sk/revise/${token}`,
            conferenceId: review.conference,
            submissionId: submission,
            replyTo: config.replyTo,
          },
          session,
        );
      } else if (action === "REQUEST_PROOF") {
        const version = await this.versions.findOne({
          _id: review.currentVersion,
          submission,
        });
        const author = await this.users.findOne({ _id: paper.authors[0] });
        const deadline = new Date(data.deadline);
        if (
          !version ||
          !author ||
          !Number.isFinite(+deadline) ||
          deadline <= new Date()
        )
          throw new Error("Choose a manuscript and future proof deadline.");
        const file = await this.files.findOne({
          _id: version.file,
          submission,
        });
        if (!file?.filename.endsWith(".docx"))
          throw new Error("Upload the final DOCX manuscript first.");
        if (review.proof)
          await this.revisions.findOneAndUpdate(
            { _id: review.proof, status: "REQUESTED" },
            { $set: { status: "CANCELLED" } },
          );
        const token = randomBytes(32).toString("base64url");
        const url = this.origin(hostname) + "/sk/revise/" + token;
        const instructions =
          "Skontrolujte finálny rukopis a potvrďte súhlas s vydaním. / Check the final manuscript and approve it for publication.";
        const notification = await this.sendMessage(
          {
            hostname,
            email: author.email,
            name: author.name,
            subject: "Autorská korektúra / Final author proof",
            text: instructions + " " + deadline.toISOString().slice(0, 10),
            url,
            conferenceId: review.conference,
            submissionId: submission,
            replyTo: config.replyTo,
          },
          session,
        );
        const proof = await this.revisions.create(
          {
            submission,
            kind: "PROOF",
            versionNumber: version.number,
            attribution: await this.proofAttribution(submission),
            round: round?._id,
            sourceVersion: version._id,
            manuscriptFile: file._id,
            proofPdf: version.proofPdf,
            notification: id(notification),
            instructions,
            deadline,
            expiresAt: new Date(+deadline + 30 * 86400000),
            tokenHash: hashToken(token),
          },
          { session },
        );
        await this.cases.findOneAndUpdate(
          { _id: review._id },
          {
            $set: { proof: proof._id },
            $unset: { publication: 1, deliveredAt: 1 },
          },
          { session },
        );
      } else if (
        action === "NO_PROOF_RESPONSE" ||
        action === "RECORD_PROOF_APPROVAL"
      ) {
        const proof = await this.revisions.findOne({
          _id: review.proof,
          submission,
          sourceVersion: review.currentVersion,
          kind: "PROOF",
          status: "REQUESTED",
        });
        if (!proof) throw new Error("No current proof to close.");
        await this.checkProof(proof);
        const sent = await this.notifications.findOne({
          _id: proof.notification,
          state: "SENT",
        });
        if (
          !sent?.sentAt ||
          sent.sentAt > proof.deadline ||
          (action === "NO_PROOF_RESPONSE" && proof.deadline >= new Date())
        )
          throw new Error(
            "Confirm delivery before closing proof. No-response closure also requires an elapsed deadline.",
          );
        if (
          action === "RECORD_PROOF_APPROVAL" &&
          !String(data.reason || "").trim()
        )
          throw new Error("Record the author's confirmation.");
        await this.revisions.findOneAndUpdate(
          { _id: proof._id },
          {
            $set: {
              status:
                action === "NO_PROOF_RESPONSE" ? "NO_RESPONSE" : "APPROVED",
              note: String(data.reason || "").slice(0, 5000),
            },
          },
          { session },
        );
      } else if (action === "VERIFY_REVISION") {
        const request = await this.revisions.findOne({
          _id: id(data.requestId),
          submission,
          status: "RECEIVED",
          receivedVersion: review.currentVersion,
        });
        if (
          !request ||
          (request.round && String(request.round) !== String(round?._id))
        )
          throw new Error("No current received correction to verify.");

        if (
          await this.revisions.exists({
            kind: "CHECK",
            parentRequest: request._id,
            status: "CHECK_PENDING",
            expiresAt: { $gt: new Date() },
          })
        )
          throw new Error("Wait for the reviewer check or revoke it first.");

        const points = (request.points || []).map((p) => {
          const status = data.checks?.[p.id];
          if (status !== "VERIFIED" && status !== "NEEDS_CHANGES")
            throw new Error("Check every correction point.");
          return { ...p, status };
        });

        const status = points.some((p) => p.status === "NEEDS_CHANGES")
          ? "NEEDS_CHANGES"
          : "VERIFIED";
        await this.revisions.findOneAndUpdate(
          { _id: request._id },
          { $set: { points, status } },
          { session },
        );
        if (checkBpfFormal && status === "VERIFIED")
          await this.versions.findOneAndUpdate(
            { _id: review.currentVersion, submission },
            { $set: { formalChecks: bpfFormalChecks(data) } },
            { session },
          );
        if (status === "VERIFIED")
          await this.cases.findOneAndUpdate(
            { _id: review._id },
            { $set: { formalApproved: true } },
            { session },
          );
      } else if (action === "REVOKE_CHECK") {
        if (
          !(await this.revisions.findOneAndUpdate(
            {
              _id: id(data.requestId),
              submission,
              kind: "CHECK",
              status: "CHECK_PENDING",
            },
            { $set: { status: "CANCELLED" } },
            { new: true, session },
          ))
        )
          throw new Error("No active reviewer check.");
      } else if (action === "REQUEST_REVIEWER_CHECK") {
        const request = await this.revisions.findOne({
          _id: id(data.requestId),
          kind: "POST_REVIEW",
          status: "RECEIVED",
          submission,
          receivedVersion: review.currentVersion,
          round: review.currentRound,
        });
        const assignment = await this.assignments.findOne({
          _id: id(data.checkAssignment),
          active: true,
          status: "SUBMITTED",
          round: review.currentRound,
          review: review._id,
        });
        const version = await this.versions.findOne({
          _id: review.currentVersion,
          submission,
          anonymousApproved: true,
        });
        const deadline = new Date(data.deadline);
        if (
          !request ||
          !assignment?.submittedAt ||
          !version?.anonymousFile ||
          !version.anonymousTrackedFile ||
          !Number.isFinite(+deadline) ||
          deadline <= new Date() ||
          review.authorEmails.includes(assignment.email.toLowerCase())
        )
          throw new Error(
            "Select the original reviewer and approve both anonymous revision files first.",
          );
        const eligible = (request.points || []).filter(
          (p) =>
            p.status !== "VERIFIED" &&
            (!p.assignment || p.assignment === String(assignment._id)),
        );
        const ids: unknown = data.pointIds;
        if (
          ids !== undefined &&
          (!Array.isArray(ids) ||
            new Set(ids).size !== ids.length ||
            !ids.every((id) => eligible.some((p) => p.id === id)))
        )
          throw new Error(
            "Select unresolved points for the original reviewer.",
          );
        const points = Array.isArray(ids)
          ? eligible.filter((p) => ids.includes(p.id))
          : eligible;

        if (
          await this.revisions.exists({
            kind: "CHECK",
            parentRequest: request._id,
            assignment: { $ne: assignment._id },
            status: "CHECK_PENDING",
            expiresAt: { $gt: new Date() },
            "points.id": { $in: points.map((p) => p.id) },
          })
        )
          throw new Error(
            "A selected correction point is already being checked.",
          );

        if (
          !points?.length ||
          (request.reportDates &&
            request.reportDates[String(assignment._id)] !==
              assignment.submittedAt.toISOString())
        )
          throw new Error("No current correction points for this reviewer.");
        const token = randomBytes(32).toString("base64url");
        await this.revisions.updateMany(
          {
            kind: "CHECK",
            parentRequest: request._id,
            assignment: assignment._id,
            status: "CHECK_PENDING",
          },
          { $set: { status: "CANCELLED" } },
        );
        const check = await this.revisions.create(
          {
            submission,
            kind: "CHECK",
            versionNumber: version.number,
            status: "CHECK_PENDING",
            instructions: points.map((p) => p.text).join("\n\n"),
            points,
            deadline,
            expiresAt: new Date(+deadline + 14 * 86400000),
            tokenHash: hashToken(token),
            assignment: assignment._id,
            reportSubmittedAt: assignment.submittedAt,
            parentRequest: request._id,
            round: review.currentRound,
            sourceVersion: version._id,
            manuscriptFile: version.anonymousFile,
            trackedFile: version.anonymousTrackedFile,
          },
          { session },
        );
        await this.sendMessage(
          {
            hostname,
            email: assignment.email,
            name: assignment.name,
            subject: "Overenie opráv / Check manuscript corrections",
            text:
              check.instructions + "\n" + deadline.toISOString().slice(0, 10),
            url: this.origin(hostname) + "/sk/revise/" + token,
            conferenceId: review.conference,
            submissionId: submission,
            replyTo: config.replyTo,
          },
          session,
        );
      } else if (action === "CLOSE_REPORT") {
        const a = await this.assignments.findOne({
          _id: id(data.assignmentId),
          round: round?._id,
          review: review._id,
          active: true,
          status: "SUBMITTED",
        });
        if (!round || !a || !review.currentVersion)
          throw new Error("A current submitted report is required.");

        if (
          String(round.manuscript) !== String(review.currentVersion) &&
          !(await this.revisions.exists({
            submission,
            round: round._id,
            status: "VERIFIED",
            receivedVersion: review.currentVersion,
          }))
        )
          throw new Error(
            "The current manuscript has not been reviewed or verified.",
          );

        if (a.recommendation === "CONDITIONAL") {
          const verified = await this.revisions.findAll({
            submission,
            round: round._id,
            status: "VERIFIED",
            receivedVersion: review.currentVersion,
            $or: [
              { "points.assignment": String(a._id) },
              { carriedAssignments: String(a._id) },
            ],
          });
          if (
            !verified.some(
              (r) =>
                r.reportDates?.[String(a._id)] === a.submittedAt?.toISOString(),
            )
          )
            throw new Error(
              "Verify the conditions of this report on the current manuscript first.",
            );
        }

        await this.assignments.findOneAndUpdate(
          { _id: a._id },
          {
            $set: {
              closedVersion: review.currentVersion,
              closedAt: new Date(),
            },
          },
          { session },
        );
      } else if (action === "DECIDE") {
        if (
          !["PENDING", "ACCEPTED", "REJECTED", "WITHDRAWN"].includes(
            data.decision,
          )
        )
          throw new Error("Invalid editorial decision.");
        if (!String(data.reason || "").trim())
          throw new Error("Record the reason for this decision.");

        if (data.decision === "REJECTED") {
          if (
            !round ||
            (await this.assignments.countDocuments({
              round: round._id,
              active: true,
              status: "SUBMITTED",
            })) !== round.requiredReviews
          )
            throw new Error(
              "Complete the required reports before recording rejection.",
            );

          // Rejection closes conditional reports with the coordinator's recorded decision.
          await this.assignments.updateMany(
            { round: round._id, active: true, status: "SUBMITTED" },
            {
              $set: {
                closedVersion: review.currentVersion,
                closedAt: new Date(),
              },
            },
            { session },
          );
        }

        if (data.decision === "ACCEPTED") {
          const completed = round
            ? await this.assignments.countDocuments(
                {
                  round: round._id,
                  active: true,
                  status: "SUBMITTED",
                  email: { $nin: review.authorEmails },
                },
                { session },
              )
            : 0;

          if (
            !round ||
            completed < round.requiredReviews ||
            (await this.revisions.exists({
              submission,
              status: { $in: ["REQUESTED", "RECEIVED"] },
            }))
          )
            throw new Error(
              "Complete the required reports and verify outstanding corrections first.",
            );
        }

        await this.cases.findOneAndUpdate(
          { _id: review._id },
          {
            $set: {
              decision: data.decision,
              decisionReason: String(data.reason).slice(0, 10000),
            },
            $unset: { proof: 1, publication: 1, deliveredAt: 1 },
          },
          { session },
        );

        if (data.decision !== "PENDING") {
          await this.assignments.updateMany(
            { review: review._id },
            { $unset: { tokenHash: 1, tokenEncrypted: 1 } },
            { session },
          );
          await this.revisions.updateMany(
            { submission, status: { $in: ["REQUESTED", "RECEIVED"] } },
            { $set: { status: "CANCELLED", expiresAt: new Date() } },
            { session },
          );
        }

        const author = await this.users.findOne({ _id: paper.authors[0] });

        if (author)
          await this.sendMessage(
            {
              hostname,
              email: author.email,
              name: author.name,
              subject: "Rozhodnutie o príspevku",
              text: `${data.decision}\n${data.reason}\n\n${config.signature}`,
              conferenceId: review.conference,
              submissionId: submission,
              replyTo: config.replyTo,
            },
            session,
          );
      } else if (action !== "NEXT_ROUND")
        throw new Error("Unknown review action.");

      await this.activity.record(
        user,
        `review.${action.toLowerCase()}`,
        review.conference,
        submission,
        {
          fields: Object.keys(data).filter(
            (k) => !["token", "answers"].includes(k),
          ),
          ...(data.reason
            ? { reason: String(data.reason).slice(0, 5000) }
            : {}),
          decision: data.decision,
          assignment: data.assignmentId,
          reviewer: data.reviewerId,
          slot: data.slot,
          deadline: data.deadline,
          request: data.requestId,
          manuscript: review.currentVersion
            ? String(review.currentVersion)
            : undefined,
          round: round ? String(round._id) : undefined,
        },
        session,
      );
      return { success: true, revision: locked.revision, ...outcome };
    });
  }

  async portal(token: string) {
    const assignment = await this.tokenAssignment(token);
    const round = await this.rounds.findOne({ _id: assignment.round });
    if (!round) throw new Error("Review round not found.");
    const review = await this.cases.findOne({ _id: assignment.review });
    const form = await this.forms.getForm(round.form);
    const answer = await this.forms.answer("REVIEW", assignment._id);
    await this.activity.read(
      `review-link:${assignment._id}`,
      "review.portal_viewed",
      review?.conference,
      review?.submission,
    );
    return {
      attachments: (await this.assignmentView(assignment)).attachments,
      assignmentId: String(assignment._id),
      status: assignment.status,
      deadline: assignment.deadline,
      manuscriptFileId: round.anonymousFile
        ? String(round.anonymousFile)
        : null,
      form: reviewFormView(form),
      recommendationField: round.recommendationField,
      authorFields: [
        ...new Set([...round.authorFields, round.recommendationField]),
      ].filter((fieldId) =>
        form.fields.some(
          (f) => String(f.id) === fieldId && f.type !== FieldType.FileUpload,
        ),
      ),
      answer,
    };
  }

  async tokenAssignment(token: string) {
    if (!/^[\w-]{43}$/.test(token))
      reviewError(
        "INVALID_REVIEW_LINK",
        "This review link is invalid or expired.",
      );
    const assignment = await this.assignments.findOne({
      tokenHash: hashToken(token),
      active: true,
      expiresAt: { $gt: new Date() },
    });
    if (!assignment || assignment.status === "DECLINED")
      reviewError(
        "INVALID_REVIEW_LINK",
        "This review link is invalid or expired.",
      );
    const review = await this.cases.findOne({ _id: assignment.review });
    if (
      !review ||
      review.decision !== "PENDING" ||
      review.authorEmails.includes(assignment.email.toLowerCase())
    )
      reviewError(
        "INVALID_REVIEW_LINK",
        "This review link is invalid or expired.",
      );
    return assignment;
  }

  async saveReport(
    token: string,
    answers: Record<string, unknown>,
    expectedRevision: number | undefined,
    submit: boolean,
    hostname: string,
    decline = false,
    onBehalf?: { user: CtxUser; assignmentId: ObjectId },
  ) {
    const assignment = onBehalf
      ? await this.assignments.findOne({
          _id: onBehalf.assignmentId,
          active: true,
        })
      : await this.tokenAssignment(token);
    if (!assignment) throw new Error("Assignment not found.");

    if (onBehalf) {
      const owner = await this.cases.findOne({ _id: assignment.review });
      if (!owner) throw new Error("Submission not found.");
      await this.access.paper(onBehalf.user, owner.submission);
    }

    return withOptionalTransaction(undefined, async (session) => {
      const current = await this.assignments.findOne(
        {
          _id: assignment._id,
          active: true,
          ...(onBehalf
            ? {}
            : { tokenHash: hashToken(token), expiresAt: { $gt: new Date() } }),
        },
        null,
        { session },
      );
      if (!current || current.status === "DECLINED")
        throw new Error("This assignment is closed or revoked.");
      const round = await this.rounds.findOne({ _id: assignment.round }, null, {
        session,
      });
      const review = await this.cases.findOne(
        { _id: assignment.review },
        null,
        { session },
      );
      if (
        !round ||
        !review ||
        review.decision !== "PENDING" ||
        String(review.currentRound) !== String(round._id)
      )
        throw new Error("This round is closed.");
      if (review.authorEmails.includes(assignment.email.toLowerCase()))
        throw new Error("Authors cannot review their own paper.");
      // Serialize report completion and feedback release for the entire round.
      await this.cases.findOneAndUpdate(
        { _id: review._id },
        { $inc: { revision: 1 } },
        { session },
      );
      let savedAnswer:
        Awaited<ReturnType<FormService["saveAnswers"]>> | undefined;

      if (decline) {
        await this.assignments.findOneAndUpdate(
          { _id: assignment._id, status: { $ne: "SUBMITTED" } },
          {
            $set: { status: "DECLINED" },
            $unset: { tokenHash: 1, tokenEncrypted: 1 },
          },
          { session },
        );
      } else {
        const existing = await this.forms.answer(
          "REVIEW",
          assignment._id,
          session,
        );

        if (existing?.submitted)
          return {
            success: true,
            revision: existing.revision,
            answer: existing,
          };

        if (
          submit &&
          answers[round.recommendationField] === "CONDITIONAL" &&
          !String(answers[conditionsId] || "").trim() &&
          (await this.forms.getForm(round.form)).fields.some(
            (f) => String(f.id) === conditionsId,
          )
        )
          reviewError(
            "VALIDATION_FAILED",
            "Describe the changes required for publication.",
            {
              [conditionsId]: "Describe the changes required for publication.",
            },
          );

        const response = await this.forms.saveAnswers(
          {
            context: "REVIEW",
            owner: round._id,
            subject: assignment._id,
            respondent: onBehalf
              ? String(onBehalf.user.id)
              : `review-link:${assignment._id}`,
            form: round.form,
            answers,
            submitted: submit,
            expectedRevision,
          },
          session,
        );
        const recommendation = dataAnswers(response.answers)[
          round.recommendationField
        ];
        savedAnswer = response;
        if (submit && !recommendations.includes(String(recommendation)))
          throw new Error("Choose an overall recommendation.");
        await this.assignments.findOneAndUpdate(
          { _id: assignment._id, active: true },
          {
            $set: {
              status: submit ? "SUBMITTED" : "STARTED",
              ...(submit ? { recommendation, submittedAt: new Date() } : {}),
            },
          },
          { session },
        );
        if (submit)
          await this.releaseFeedback(review, round, hostname, session);
      }

      await this.activity.record(
        onBehalf?.user || `review-link:${assignment._id}`,
        decline
          ? "review.declined"
          : submit
            ? "review.submitted"
            : "review.draft_saved",
        review.conference,
        review.submission,
        { assignment: String(assignment._id) },
        session,
      );
      return {
        success: true,
        ...(savedAnswer
          ? { answer: savedAnswer, revision: savedAnswer.revision }
          : {}),
      };
    });
  }

  private async releaseFeedback(
    review: any,
    round: any,
    hostname: string,
    session: ClientSession | undefined,
  ) {
    const assignments = await this.assignments.findAll(
      { round: round._id, active: true },
      null,
      { session, sort: { slot: 1 } },
    );
    if (
      assignments.length < round.requiredReviews ||
      assignments.some(
        (a) =>
          a.status !== "SUBMITTED" ||
          review.authorEmails.includes(a.email.toLowerCase()),
      )
    )
      return;
    const responses = await Promise.all(
      assignments.map((a) => this.forms.answer("REVIEW", a._id, session)),
    );
    if (responses.some((a) => !a?.submitted)) return;
    const fingerprint = responses
      .map((a) => `${a!.id}:${a!.revision}`)
      .join("|");
    if (await this.releases.exists({ round: round._id, fingerprint })) return;
    const form = await this.forms.getForm(round.form);

    // BPF coordinators select and edit the author-facing points in the correction request.
    if (form.fields.some((field) => String(field.id) === conditionsId)) return;

    const feedback = {
      round: round.number,
      reports: assignments.map((a, index) => ({
        reviewer: `Reviewer ${a.slot}`,
        recommendation: a.recommendation,
        fields: form.fields
          .filter(
            (f) =>
              f.type !== FieldType.FileUpload &&
              round.authorFields.includes(String(f.id)),
          )
          .map((f) => ({
            label: f.label,
            value: dataAnswers(responses[index]!.answers)[String(f.id)] ?? "",
          })),
      })),
    };
    await this.releases.create(
      {
        submission: review.submission,
        round: round._id,
        fingerprint,
        feedback,
      },
      { session },
    );
    const paper = await this.submissions.findOne({ _id: review.submission });
    const author = paper
      ? await this.users.findOne({ _id: paper.authors[0] })
      : null;
    const conference = await this.conferences.findOne({
      _id: review.conference,
    });

    if (author && conference)
      await this.sendMessage(
        {
          hostname,
          email: author.email,
          name: author.name,
          subject: "Recenzné posudky sú dostupné",
          text: "Všetky požadované posudky sú dostupné vo vašom konferenčnom účte. Rozhodnutie o publikovaní oznámi koordinátor.",
          url: `${this.origin(hostname)}/sk/${conference.slug}`,
          conferenceId: review.conference,
          submissionId: review.submission,
        },
        session,
      );

    await this.activity.record(
      "system",
      "review.feedback_released",
      review.conference,
      review.submission,
      { round: String(round._id) },
      session,
    );
  }

  async authorFeedback(user: CtxUser, submission: ObjectId) {
    const paper = await this.submissions.findOne({
      _id: submission,
      authors: user.id,
    });
    if (!paper) throw new Error("Author access required.");
    await this.activity.read(
      user,
      "review.feedback_viewed",
      paper.conference as ObjectId,
      submission,
    );
    return this.releases.findAll({ submission }, null, {
      sort: { createdAt: -1 },
    });
  }

  async authorWorkspace(user: CtxUser, submission: ObjectId) {
    const paper = await this.submissions.findOne({
      _id: submission,
      authors: user.id,
    });
    if (!paper) throw new Error("Author access required.");
    const review = await this.cases.findOne({ submission });
    const requests = await this.revisions.findAll(
      { submission, kind: { $ne: "CHECK" } },
      null,
      {
        sort: { createdAt: -1 },
      },
    );
    await this.activity.read(
      user,
      "review.author_workspace_viewed",
      paper.conference as ObjectId,
      submission,
    );
    return {
      decision: review?.decision || "PENDING",
      reason: review?.decisionReason || "",
      revisions: requests.map(authorCorrection),
    };
  }

  async reviewerProfile(
    user: CtxUser,
    reviewer: ObjectId,
    conference?: ObjectId,
    before?: ObjectId,
  ) {
    if (
      !user.access.includes("ADMIN" as any) &&
      !(await this.access.scopes(user)).length
    )
      throw new Error("Coordinator access required.");
    if (
      conference &&
      !user.access.includes("ADMIN" as any) &&
      !(await this.access.scopes(user)).some(
        (s) => String(s.conference) === String(conference),
      )
    )
      throw new Error("Coordinator access required for this conference.");
    const records = await this.assignments.findAll(
      { reviewer, ...(before ? { _id: { $lt: before } } : {}) },
      null,
      { sort: { _id: -1 }, limit: 100 },
    );
    const history = [];

    for (const assignment of records) {
      const review = await this.cases.findOne({ _id: assignment.review });
      if (
        !review ||
        (conference && String(review.conference) !== String(conference))
      )
        continue;

      try {
        const paper = await this.access.paper(user, review.submission);

        history.push({
          id: String(assignment._id),
          submission: String(review.submission),
          title: paper.translations.en.name || paper.translations.sk.name,
          conference: String(review.conference),
          status: assignment.status,
          active: assignment.active,
          deadline: assignment.deadline,
          round: String(assignment.round),
        });
      } catch {
        /* Own papers and other coordinator scopes stay confidential. */
      }
    }

    const eligibility = conference
      ? await this.eligibility.findOne({ conference, reviewer })
      : null;
    return {
      history,
      hasNextPage: records.length === 100,
      endCursor: records.length
        ? String(records[records.length - 1]._id)
        : null,
      eligibility: eligibility
        ? {
            participatedSections: eligibility.participatedSections.map(String),
            guarantorSections: eligibility.guarantorSections.map(String),
            conflicts: eligibility.conflicts.map(String),
          }
        : { participatedSections: [], guarantorSections: [], conflicts: [] },
    };
  }

  async currentReviewerCheck(check: RevisionRequest) {
    if (
      check.kind !== "CHECK" ||
      !["CHECK_PENDING", "CHECK_SUBMITTED"].includes(check.status)
    )
      throw new Error("This reviewer check is closed.");
    const review = await this.cases.findOne({
      submission: check.submission,
      currentRound: check.round,
      currentVersion: check.sourceVersion,
      decision: "PENDING",
    });
    const assignment =
      review &&
      (await this.assignments.findOne({
        _id: check.assignment,
        round: check.round,
        review: review._id,
        status: "SUBMITTED",
        active: true,
        submittedAt: check.reportSubmittedAt,
      }));

    if (
      !assignment ||
      review!.authorEmails.includes(assignment.email.toLowerCase()) ||
      !(await this.versions.exists({
        _id: check.sourceVersion,
        anonymousFile: check.manuscriptFile,
        anonymousTrackedFile: check.trackedFile,
        anonymousApproved: true,
      })) ||
      !(await this.revisions.exists({
        _id: check.parentRequest,
        status: "RECEIVED",
        receivedVersion: check.sourceVersion,
      }))
    )
      throw new Error("This reviewer check is stale.");

    return review!;
  }

  async submitReviewerCheck(token: string, checks: Record<string, unknown>) {
    return withOptionalTransaction(undefined, async (session) => {
      const check = await this.revisionToken(token);
      const review = await this.currentReviewerCheck(check);
      if (check.status === "CHECK_SUBMITTED") return { success: true };
      await this.cases.findOneAndUpdate(
        { _id: review._id },
        { $inc: { revision: 1 } },
        { session },
      );

      const points = (check.points || []).map((p) => {
        const status = checks?.[p.id];
        if (status !== "VERIFIED" && status !== "NEEDS_CHANGES")
          throw new Error("Check each requested point.");
        return { ...p, status };
      });

      const request = await this.revisions.findOne({
        _id: check.parentRequest,
      });
      await this.revisions.findOneAndUpdate(
        { _id: check.parentRequest },
        {
          $set: {
            points: request!.points?.map(
              (p) => points.find((c) => c.id === p.id) || p,
            ),
          },
        },
        { session },
      );
      await this.revisions.findOneAndUpdate(
        { _id: check._id },
        { $set: { status: "CHECK_SUBMITTED", points } },
        { session },
      );
      await this.activity.record(
        "review-check:" + check.id,
        "review.corrections_checked",
        review.conference,
        check.submission,
        { request: String(request!._id), assignment: String(check.assignment) },
        session,
      );
      return { success: true };
    });
  }

  private async proofAttribution(submission: ObjectId) {
    const paper = await this.submissions.findOne({ _id: submission });
    if (!paper) throw new Error("Manuscript not found.");
    const authors = await this.users.findAll({ _id: { $in: paper.authors } });

    const names = paper.authors.map((id) => {
      const author = authors.find((a) => String(a._id) === String(id));
      return [
        String(id),
        author?.name,
        author?.organization,
        author?.email.toLowerCase(),
      ];
    });

    return createHash("sha256")
      .update(
        JSON.stringify([
          paper.translations.en.name,
          paper.translations.sk.name,
          names,
        ]),
      )
      .digest("hex");
  }

  /** A proof is valid only for the recipient, attribution and files originally offered. */
  async checkProof(proof: RevisionRequest) {
    if (
      !proof.attribution ||
      proof.attribution !== (await this.proofAttribution(proof.submission)) ||
      !(await this.cases.exists({
        submission: proof.submission,
        decision: "ACCEPTED",
        proof: proof.id,
        currentVersion: proof.sourceVersion,
      }))
    )
      throw new Error("This proof has been superseded.");
  }

  async approveAuthorProof(
    requestId: ObjectId,
    user?: CtxUser,
    token?: string,
  ) {
    return withOptionalTransaction(undefined, async (session) => {
      const request = token
        ? await this.revisionToken(token)
        : await this.revisions.findOne({ _id: requestId });

      if (
        !request ||
        !request._id.equals(requestId) ||
        request.kind !== "PROOF" ||
        (!token &&
          (!user ||
            !(await this.submissions.exists({
              _id: request.submission,
              authors: user.id,
            }))))
      )
        throw new Error("Author proof access required.");

      if (!["REQUESTED", "APPROVED"].includes(request.status))
        throw new Error("This proof is closed.");
      await this.checkProof(request);
      if (request.status === "APPROVED") return authorCorrection(request);
      const current = await this.cases.findOneAndUpdate(
        {
          submission: request.submission,
          decision: "ACCEPTED",
          currentVersion: request.sourceVersion,
          proof: request._id,
        },
        { $inc: { revision: 1 } },
        { session },
      );
      if (!current) throw new Error("This proof has been superseded.");

      if (request.status !== "APPROVED") {
        await this.revisions.findOneAndUpdate(
          { _id: request._id },
          { $set: { status: "APPROVED" } },
          { session },
        );
        await this.activity.record(
          token ? "author-proof-link:" + request.id : user!,
          "submission.proof_approved",
          current.conference,
          request.submission,
          { version: String(request.sourceVersion) },
          session,
        );
      }

      return authorCorrection({ ...request.toObject(), status: "APPROVED" });
    });
  }

  async revisionPortal(token: string) {
    const request = await this.revisionToken(token);
    if (request.kind === "PROOF") await this.checkProof(request);

    if (request.kind === "CHECK") {
      await this.currentReviewerCheck(request);
      return { ...authorCorrection(request), trackedFile: request.trackedFile };
    }

    return authorCorrection(request);
  }

  async revisionToken(token: string) {
    if (!/^[\w-]{43}$/.test(token))
      reviewError("INVALID_REVISION_LINK", "Invalid correction link.");
    const request = await this.revisions.findOne({
      tokenHash: hashToken(token),
      expiresAt: { $gt: new Date() },
    });
    if (!request)
      reviewError(
        "INVALID_REVISION_LINK",
        "Invalid or expired correction link.",
      );
    return request;
  }

  async reminders() {
    const configs = await this.settings.findAll({
      enabled: true,
      remindersEnabled: true,
    });

    for (const config of configs) {
      const cases = await this.cases.findAll({
        conference: config.conference,
        decision: "PENDING",
      });

      for (const review of cases) {
        if (!review.currentRound) continue;
        const assignments = await this.assignments.findAll({
          round: review.currentRound,
          active: true,
          status: { $in: ["INVITED", "STARTED"] },
          expiresAt: { $gt: new Date() },
          tokenEncrypted: { $exists: true },
        });
        const conference = await this.conferences.findOne({
          _id: config.conference,
        });

        for (const a of assignments) {
          const delta = a.deadline.getTime() - Date.now();
          const field =
            delta >= 0 && delta <= 2 * 86400000
              ? "reminderBeforeAt"
              : delta <= -2 * 86400000
                ? "reminderAfterAt"
                : null;
          if (!field || (a as any)[field]) continue;
          await withOptionalTransaction(undefined, async (session) => {
            const claim = await this.assignments.findOneAndUpdate(
              { _id: a._id, [field]: { $exists: false } },
              { $set: { [field]: new Date() } },
              { new: true, session },
            );
            if (!claim) return;
            const hostname =
              process.env.CONFERENCES_PUBLIC_HOST ||
              (process.env.NODE_ENV === "development"
                ? "conferences.localhost:3000"
                : `conferences${process.env.NODE_ENV === "staging" ? "-staging" : ""}.flaw.uniba.sk`);
            await this.sendMessage(
              {
                hostname,
                email: a.email,
                name: a.name,
                subject: `Pripomenutie recenzie – ${conference?.slug || ""}`,
                text: `${config.instructions}\n\nTermín: ${a.deadline.toLocaleDateString("sk-SK", { timeZone: "Europe/Bratislava" })}\n\n${config.signature}`,
                replyTo: config.replyTo,
                url: `${this.origin(hostname)}/sk/review/${unseal(a.tokenEncrypted!)}`,
                conferenceId: config.conference,
                submissionId: review.submission,
                assignmentId: a._id,
              },
              session,
            );
          });
        }
      }
    }
  }

  private async assignmentView(a: any) {
    const delivery = await this.notifications.findOne(
      { assignmentId: a._id },
      { state: 1 },
      { sort: { createdAt: -1 } },
    );
    const { tokenHash, tokenEncrypted, ...record } = plain<any>(a);
    const attachments = await this.files.findAll(
      { assignment: a._id, kind: "REPORT" },
      { filename: 1, size: 1 },
      { limit: 50 },
    );
    return {
      ...record,
      attachments: attachments.map((f) => ({
        id: String(f._id),
        filename: f.filename,
        size: f.size,
      })),
      delivery: delivery?.state || null,
    };
  }

  private origin(hostname: string) {
    let host = hostname.replace(/^flawis/, "conferences");

    if (
      process.env.NODE_ENV === "development" &&
      /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)
    ) {
      host =
        process.env.CONFERENCES_PUBLIC_HOST || "conferences.localhost:3000";
    }

    if (!/^[a-z0-9.:-]+$/i.test(host))
      throw new Error("Invalid public hostname.");
    return `${process.env.NODE_ENV === "development" ? "http" : "https"}://${host}`;
  }

  async sendMessage(data: Record<string, unknown>, session?: ClientSession) {
    return this.mail.produceMessage(
      JSON.stringify({ locale: "sk", ...data }),
      "mail.review",
      session,
    );
  }
}
