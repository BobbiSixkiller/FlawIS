import { createHash, randomUUID } from "crypto";
import { ObjectId } from "mongodb";
import { Service } from "typedi";
import PizZip from "pizzip";
import { validateAttachment } from "./documents/attachment-validation";
import { makeAnonymousDraft } from "./documents/docx-anonymous-draft";
import { compareManuscripts } from "./documents/compare";
import {
  assertManuscriptLayout,
  manuscriptLayouts,
  manuscriptText,
} from "./manuscript-document";
import {
  type CorrectionPoint,
  ReviewFile,
  ManuscriptVersion,
  SubmissionReview,
  ReviewRound,
  ReviewAssignment,
  RevisionRequest,
} from "../../entitites/Review";
import { Access } from "../../entitites/User";
import { StoredObject } from "../../entitites/StoredObject";
import { Submission } from "../../entitites/Submission";
import { Attendee } from "../../entitites/Attendee";
import { Conference } from "../../entitites/Conference";
import { Repository } from "../../repositories/base.repository";
import { CtxUser } from "../../util/types";
import { withOptionalTransaction } from "../../util/helpers";
import { MinioService } from "../minio.service";
import { ReviewService } from "./review.service";
import { ReviewAccessService } from "./access.service";
import { ActivityService } from "./activity.service";

const MAX_BYTES = 20 * 1024 * 1024;

export function validateReviewFile(
  buffer: Buffer,
  filename: string,
  docxOnly = false,
) {
  if (!Buffer.isBuffer(buffer) || !buffer.length || buffer.length > MAX_BYTES)
    throw new Error("Files must be between 1 byte and 20 MiB.");
  const docx = filename.toLowerCase().endsWith(".docx");

  if (docx) {
    const zip = new PizZip(buffer);
    if (!zip.file("word/document.xml") || !zip.file("[Content_Types].xml"))
      throw new Error("Invalid DOCX document.");
    if (zip.file(/vbaProject|\.bin$/i).length)
      throw new Error("Macro-enabled documents are not supported.");
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }

  if (
    !docxOnly &&
    filename.toLowerCase().endsWith(".pdf") &&
    buffer.subarray(0, 5).toString() === "%PDF-"
  )
    return "application/pdf";
  throw new Error(
    docxOnly ? "Upload a DOCX file." : "Upload a DOCX or PDF file.",
  );
}

function authorResponses(
  points: CorrectionPoint[],
  responses: Record<
    string,
    { authorStatus?: string; response?: string; location?: string }
  > = {},
) {
  if (!responses || Array.isArray(responses) || typeof responses !== "object")
    throw new Error("Invalid correction responses.");
  if (!Object.keys(responses).length)
    return points.map(
      ({ authorStatus, response, location, ...point }) => point,
    );
  if (Object.keys(responses).length !== points.length)
    throw new Error(
      "Complete every correction response or leave them all empty.",
    );
  return points.map((point) => {
    const answer = responses[point.id],
      status = answer?.authorStatus;
    const response =
        typeof answer?.response === "string" ? answer.response.trim() : "",
      location =
        typeof answer?.location === "string" ? answer.location.trim() : "";
    if (
      (status !== "addressed" && status !== "notAddressed") ||
      !response ||
      response.length > 4000 ||
      (status === "addressed" && !location) ||
      location.length > 500
    )
      throw new Error(
        "Provide an outcome and response for each correction, and the location of addressed points.",
      );
    return { ...point, authorStatus: status, response, location };
  });
}

@Service()
export class ReviewFileService {
  private readonly files = new Repository(ReviewFile);
  private readonly versions = new Repository(ManuscriptVersion);
  private readonly cases = new Repository(SubmissionReview);
  private readonly submissions = new Repository(Submission);
  private readonly conferences = new Repository(Conference);
  private readonly rounds = new Repository(ReviewRound);
  private readonly assignments = new Repository(ReviewAssignment);
  private readonly requests = new Repository(RevisionRequest);

  constructor(
    private readonly storage: MinioService,
    private readonly reviews: ReviewService,
    private readonly access: ReviewAccessService,
    private readonly activity: ActivityService,
  ) {}

  async upload(input: {
    user?: CtxUser;
    reviewerToken?: string;
    revisionToken?: string;
    assignment?: ObjectId;
    submission?: ObjectId;
    conference?: ObjectId;
    kind: string;
    filename: string;
    buffer: Buffer;
    note?: string;
    tracked?: { filename: string; buffer: Buffer };
    requestId?: ObjectId;
    sourceVersion?: ObjectId;
    responses?: Record<
      string,
      { authorStatus?: string; response?: string; location?: string }
    >;
  }) {
    if (
      ![
        "ORIGINAL",
        "ANONYMOUS",
        "FINAL",
        "PROOF_PDF",
        "REPORT",
        "REVISION",
        "MANUSCRIPT_TEMPLATE",
      ].includes(input.kind)
    )
      throw new Error("Invalid file kind.");
    const contentType = validateReviewFile(
      input.buffer,
      input.filename,
      ["REVISION", "FINAL", "MANUSCRIPT_TEMPLATE"].includes(input.kind),
    );
    const publicationFile = ["FINAL", "PROOF_PDF"].includes(input.kind);
    if (input.kind === "PROOF_PDF" && contentType !== "application/pdf")
      throw new Error("Upload the final proof as PDF.");
    const isTemplate = input.kind === "MANUSCRIPT_TEMPLATE";
    if (
      isTemplate &&
      (input.submission ||
        input.assignment ||
        input.reviewerToken ||
        input.revisionToken)
    )
      throw new Error("Templates require conference-level access.");
    let submission = input.submission,
      conference = input.conference,
      actor = input.user ? String(input.user.id) : "";
    let revisionRequest: any;
    let assignmentId = input.assignment;

    if (input.revisionToken) {
      revisionRequest = await this.reviews.revisionToken(input.revisionToken);
      if (
        ["PROOF", "CHECK"].includes(revisionRequest.kind) ||
        !["REQUESTED", "RECEIVED", "VERIFIED"].includes(
          revisionRequest.status,
        ) ||
        input.kind !== "REVISION"
      )
        throw new Error("This correction request is closed.");
      submission = revisionRequest.submission;
      actor = `revision-link:${revisionRequest._id}`;
    } else if (input.reviewerToken) {
      const assignment = await this.reviews.tokenAssignment(
        input.reviewerToken,
      );
      const review = await this.cases.findOne({ _id: assignment.review });
      if (
        !review ||
        input.kind !== "REPORT" ||
        assignment.status === "SUBMITTED"
      )
        throw new Error("Report upload is not permitted.");
      assignmentId = assignment._id;
      submission = review.submission;
      actor = `review-link:${assignment._id}`;
    } else if (input.user) {
      if (isTemplate) {
        if (!conference) throw new Error("Conference is required.");
        await this.access.conference(input.user, conference, undefined, true);
        if (!(await this.conferences.exists({ _id: conference })))
          throw new Error("Conference not found.");
      } else {
        if (!submission) throw new Error("Submission is required.");
        await this.access.paper(
          input.user,
          submission,
          ["ORIGINAL", "REVISION"].includes(input.kind),
        );
      }
    } else throw new Error("Authentication required.");

    const paper = submission
      ? await this.submissions.findOne({ _id: submission })
      : null;
    let templateId: ObjectId | undefined;

    if (paper) {
      conference = paper.conference as ObjectId;
      const existingReview = await this.cases.findOne({
        submission: paper._id,
      });
      if (
        existingReview &&
        !publicationFile &&
        existingReview.decision !== "PENDING" &&
        input.kind !== "REPORT"
      )
        throw new Error("This submission is closed.");
      const isAuthor =
        input.user &&
        paper.authors.some((a) => String(a) === String(input.user!.id));

      if (!input.revisionToken && input.kind === "REVISION") {
        if (
          !isAuthor &&
          (input.note?.trim() || Object.keys(input.responses || {}).length)
        )
          throw new Error(
            "A staff deposit cannot record statements on the author's behalf.",
          );
        revisionRequest = await this.requests.findOne({
          submission: paper._id,
          kind: { $nin: ["PROOF", "CHECK"] },
          ...(input.requestId
            ? { _id: input.requestId }
            : { status: "REQUESTED" }),
          expiresAt: { $gt: new Date() },
        });
        if (!revisionRequest)
          throw new Error("A current correction request is required.");
      }

      if (["REVISION", "ORIGINAL", "FINAL"].includes(input.kind)) {
        const previous = existingReview?.currentVersion
          ? await this.versions.findOne({ _id: existingReview.currentVersion })
          : null;
        templateId =
          previous?.template ||
          (await this.conferences.findOne({ _id: conference }))
            ?.manuscriptTemplateFile;

        if (templateId) {
          await this.validateTemplate(
            templateId,
            conference,
            input.buffer,
            input.filename,
          );
          if (input.tracked)
            await this.validateTemplate(
              templateId,
              conference,
              input.tracked.buffer,
              input.tracked.filename,
            );
        }
      }

      if (isAuthor && input.kind === "ORIGINAL") {
        const config = await this.conferences.findOne({ _id: conference });
        if (
          config?.dates.submissionDeadline &&
          config.dates.submissionDeadline < new Date()
        )
          throw new Error(
            "The manuscript deadline has passed. Use a correction request.",
          );
      }
    }

    if (input.kind === "REPORT") {
      const assignment = assignmentId
        ? await this.assignments.findOne({
            _id: assignmentId,
            active: true,
            status: { $nin: ["SUBMITTED", "DECLINED"] },
          })
        : null;
      const owner = assignment
        ? await this.cases.findOne({ _id: assignment.review, submission })
        : null;
      if (!owner || owner.decision !== "PENDING")
        throw new Error("Select an active assignment for this report.");
    }

    if (!conference) throw new Error("Conference is required.");
    if (input.kind === "MANUSCRIPT_TEMPLATE") manuscriptLayouts(input.buffer);
    if (revisionRequest?.kind === "POST_REVIEW" && !input.tracked)
      throw new Error("Upload both the clean and tracked-change DOCX files.");

    if (input.tracked) {
      if (
        input.kind !== "ANONYMOUS" &&
        (input.kind !== "REVISION" || revisionRequest?.kind !== "POST_REVIEW")
      )
        throw new Error(
          "Tracked files require a post-review correction request.",
        );
      validateReviewFile(input.tracked.buffer, input.tracked.filename, true);
      if (input.buffer.equals(input.tracked.buffer))
        throw new Error(
          "Clean and tracked-change manuscripts must be different files.",
        );
    }

    const note = input.note?.trim() || "";
    if (revisionRequest && note.length > 500)
      throw new Error("The correction note exceeds 500 characters.");
    const points: CorrectionPoint[] | undefined =
      revisionRequest?.points &&
      authorResponses(revisionRequest.points, input.responses);

    if (revisionRequest && revisionRequest.status !== "REQUESTED") {
      if (
        note !== (revisionRequest.note || "") ||
        points?.some(
          (p, i) =>
            p.authorStatus !== revisionRequest.points[i].authorStatus ||
            (p.response || "") !== (revisionRequest.points[i].response || "") ||
            (p.location || "") !== (revisionRequest.points[i].location || ""),
        )
      )
        throw new Error("A different correction was already received.");
      const version = await this.versions.findOne({
        _id: revisionRequest.receivedVersion,
        submission,
      });
      const clean =
        version && (await this.files.findOne({ _id: version.file }));
      const tracked =
        version?.trackedFile &&
        (await this.files.findOne({ _id: version.trackedFile }));
      if (
        clean &&
        clean.checksum ===
          createHash("sha256").update(input.buffer).digest("hex") &&
        (!tracked ||
          (input.tracked &&
            tracked.checksum ===
              createHash("sha256").update(input.tracked.buffer).digest("hex")))
      )
        return { id: String(clean._id) };
      throw new Error("A correction was already received.");
    }

    const extension = input.filename.toLowerCase().endsWith(".docx")
      ? "docx"
      : "pdf";
    const objectName = `${conference}/${submission || "templates"}/${randomUUID()}.${extension}`;
    await this.storage.upload(
      "conference-reviews",
      objectName,
      input.buffer,
      contentType,
    );
    const trackedName = input.tracked
      ? objectName.replace(".docx", "-tracked.docx")
      : undefined;

    try {
      if (trackedName && input.tracked)
        await this.storage.upload(
          "conference-reviews",
          trackedName,
          input.tracked.buffer,
          contentType,
        );
      return await withOptionalTransaction(undefined, async (session) => {
        const file = await this.files.create(
          {
            assignment: assignmentId,
            submission,
            conference,
            bucket: "conference-reviews",
            objectName,
            kind: input.kind,
            filename: `${input.kind === "REPORT" ? "report" : input.kind === "MANUSCRIPT_TEMPLATE" ? "manuscript-template" : "manuscript"}.${extension}`,
            contentType,
            size: input.buffer.length,
            checksum: createHash("sha256").update(input.buffer).digest("hex"),
            actor,
          },
          { session },
        );

        if (paper && submission) {
          const review = await this.reviews.ensureCase(paper, session);
          if (
            input.sourceVersion &&
            String(review.currentVersion) !== String(input.sourceVersion)
          )
            throw new Error("The source manuscript changed.");
          if (
            publicationFile
              ? review.decision !== "ACCEPTED"
              : review.decision !== "PENDING"
          )
            throw new Error("This submission is closed.");
          await this.cases.findOneAndUpdate(
            { _id: review._id },
            { $inc: { revision: 1 } },
            { session },
          );
          const tracked =
            input.tracked && trackedName
              ? await this.files.create(
                  {
                    conference,
                    submission,
                    bucket: file.bucket,
                    objectName: trackedName,
                    kind:
                      input.kind === "ANONYMOUS"
                        ? "ANONYMOUS_TRACKED"
                        : "TRACKED",
                    filename: "manuscript-tracked.docx",
                    size: input.tracked.buffer.length,
                    contentType,
                    checksum: createHash("sha256")
                      .update(input.tracked.buffer)
                      .digest("hex"),
                    actor,
                  },
                  { session },
                )
              : null;

          if (publicationFile) {
            if (review.proof)
              await this.requests.findOneAndUpdate(
                { _id: review.proof, status: "REQUESTED" },
                { $set: { status: "CANCELLED" } },
                { session },
              );
            await this.cases.findOneAndUpdate(
              { _id: review._id },
              { $unset: { proof: 1, publication: 1, deliveredAt: 1 } },
              { session },
            );
          }

          if (input.kind === "PROOF_PDF") {
            if (!review.currentVersion)
              throw new Error("Select a final manuscript first.");
            await this.versions.findOneAndUpdate(
              { _id: review.currentVersion },
              { $set: { proofPdf: file._id } },
              { session },
            );
          } else if (["ORIGINAL", "REVISION", "FINAL"].includes(input.kind)) {
            const last = await this.versions.findOne({ submission }, null, {
              sort: { number: -1 },
              session,
            });
            if (
              revisionRequest?.sourceVersion &&
              String(revisionRequest.sourceVersion) !==
                String(review.currentVersion)
            )
              throw new Error(
                "The correction request is for an older manuscript.",
              );

            if (
              !publicationFile &&
              !revisionRequest &&
              (await this.requests.exists({
                submission,
                status: { $in: ["REQUESTED", "RECEIVED"] },
              }))
            )
              throw new Error("Use the current correction request.");

            const version = await this.versions.create(
              {
                submission,
                number: (last?.number || 0) + 1,
                file: file._id,
                trackedFile: tracked?._id,
                template: templateId,
                parentVersion: review.currentVersion,
                uploadedBy: actor,
              },
              { session },
            );
            await this.cases.findOneAndUpdate(
              { _id: review._id },
              { $set: { currentVersion: version._id, formalApproved: false } },
              { session },
            );
            await this.submissions.findOneAndUpdate(
              { _id: submission },
              {
                $set: {
                  fileUrl: `http://minio:9000/${file.bucket}/${file.objectName}`,
                },
              },
              { session },
            );

            if (revisionRequest) {
              const updated = await this.requests.findOneAndUpdate(
                { _id: revisionRequest._id, status: "REQUESTED" },
                {
                  $set: {
                    status: "RECEIVED",
                    points,
                    note,
                    receivedVersion: version._id,
                  },
                },
                { new: true, session },
              );
              if (!updated)
                throw new Error("A correction was already received.");
            }
          } else if (input.kind === "ANONYMOUS") {
            if (!review.currentVersion)
              throw new Error(
                "Upload or register an original manuscript first.",
              );
            const sent = await this.rounds.exists({
              manuscript: review.currentVersion,
              startedAt: { $exists: true },
            });
            if (sent)
              throw new Error(
                "The manuscript in a sent round is frozen. Upload a new original first.",
              );
            await this.versions.findOneAndUpdate(
              { _id: review.currentVersion },
              {
                $set: {
                  anonymousFile: file._id,
                  anonymousApproved: false,
                  ...(tracked ? { anonymousTrackedFile: tracked._id } : {}),
                },
                ...(!tracked ? { $unset: { anonymousTrackedFile: 1 } } : {}),
              },
              { session },
            );
            await this.cases.findOneAndUpdate(
              { _id: review._id },
              { $set: { formalApproved: false } },
              { session },
            );
          }
        }

        await this.activity.record(
          input.user || actor,
          isTemplate
            ? "conference.template_uploaded"
            : "submission.file_uploaded",
          conference,
          submission,
          { file: String(file._id), kind: input.kind },
          session,
        );
        return { id: String(file._id) };
      });
    } catch (error) {
      await this.storage
        .deleteFiles(
          [objectName, trackedName]
            .filter(Boolean)
            .map((name) => "http://minio:9000/conference-reviews/" + name),
        )
        .catch(() => undefined);
      throw error;
    }
  }

  async authorizedFile(
    fileId: ObjectId,
    user?: CtxUser,
    token?: string,
    proofToken?: string,
  ) {
    const file = await this.files.findOne({ _id: fileId });
    if (!file) throw new Error("File not found.");
    let actor: CtxUser | string;

    if (proofToken) {
      const proof = await this.reviews.revisionToken(proofToken);

      if (proof.kind === "CHECK") {
        await this.reviews.currentReviewerCheck(proof);
        if (
          ![String(proof.manuscriptFile), String(proof.trackedFile)].includes(
            String(fileId),
          )
        )
          throw new Error("File access denied.");
      } else {
        if (
          proof.kind !== "PROOF" ||
          ![String(proof.manuscriptFile), String(proof.proofPdf)].includes(
            String(fileId),
          )
        )
          throw new Error("File access denied.");
        await this.reviews.checkProof(proof);
      }

      actor = "proof-link:" + proof.id;
    } else if (token) {
      const assignment = await this.reviews.tokenAssignment(token);
      const round = await this.rounds.findOne({ _id: assignment.round });
      if (
        String(round?.anonymousFile) !== String(fileId) &&
        file.actor !== `review-link:${assignment._id}`
      )
        throw new Error("File access denied.");
      actor = `review-link:${assignment._id}`;
    } else if (user) {
      if (file.submission)
        await this.access.paper(
          user,
          file.submission,
          ["ORIGINAL", "REVISION", "TRACKED", "FINAL", "PROOF_PDF"].includes(
            file.kind,
          ),
        );
      else await this.access.conference(user, file.conference, undefined, true);

      actor = user;
    } else throw new Error("Authentication required.");

    await this.activity.read(
      actor,
      "submission.file_downloaded",
      file.conference,
      file.submission,
    );
    return file;
  }

  async draftAnonymous(user: CtxUser, submission: ObjectId, source: ObjectId) {
    await this.access.paper(user, submission);
    const detail = await this.reviews.detail(user, submission);
    const version = await this.versions.findOne({ _id: source, submission });
    if (
      !version ||
      String(source) !==
        String((await this.cases.findOne({ submission }))?.currentVersion)
    )
      throw new Error("Select the current manuscript.");

    const draft = async (id: ObjectId, preserveChanges: boolean) => {
      const file = await this.authorizedFile(id, user);
      return makeAnonymousDraft(
        await this.bytes(file),
        detail.authors.map((a) => a.name).join("; "),
        { preserveChanges },
      );
    };

    const clean = await draft(version.file, false);
    const tracked =
      version.trackedFile && (await draft(version.trackedFile, true));
    await this.upload({
      user,
      submission,
      sourceVersion: source,
      kind: "ANONYMOUS",
      filename: "anonymous.docx",
      buffer: Buffer.from(clean.bytes),
      tracked: tracked
        ? { filename: "tracked.docx", buffer: Buffer.from(tracked.bytes) }
        : undefined,
    });
    return {
      warnings: [...new Set([...clean.warnings, ...(tracked?.warnings || [])])],
    };
  }

  async compare(user: CtxUser, submission: ObjectId, versionId?: ObjectId) {
    await this.access.paper(user, submission);
    if (!versionId) throw new Error("Choose a manuscript version.");
    const after = await this.versions.findOne({ _id: versionId, submission });
    const before =
      after?.parentVersion &&
      (await this.versions.findOne({ _id: after.parentVersion, submission }));
    if (!before || !after)
      throw new Error("A previous manuscript version is required.");

    const read = async (id: ObjectId) => {
      const file = await this.authorizedFile(id, user);
      if (!file.filename.endsWith(".docx"))
        throw new Error("Comparison requires Word manuscripts.");
      const paragraphs = manuscriptText(await this.bytes(file));
      if (paragraphs.length > 5000 || paragraphs.join("").length > 400000)
        throw new Error("The manuscript is too long to compare.");
      return paragraphs;
    };

    return compareManuscripts(await read(before.file), await read(after.file));
  }

  /** Resolve the form offered to this paper, including older template versions. */
  async paperTemplate(
    conference: ObjectId,
    submission: ObjectId,
    user?: CtxUser,
    token?: string,
  ) {
    let source: ObjectId | undefined;

    if (token) {
      const request = await this.reviews.revisionToken(token);
      if (
        !["FORMAL", "POST_REVIEW"].includes(request.kind || "") ||
        !request.submission.equals(submission) ||
        request.status !== "REQUESTED"
      )
        throw new Error("This correction request is closed.");
      source = request.sourceVersion;
    } else {
      if (!user) throw new Error("Authentication required.");
      await this.access.paper(user, submission, true);
    }

    const review = await this.cases.findOne({ conference, submission });
    if (!(await this.submissions.exists({ _id: submission, conference })))
      throw new Error("Manuscript not found.");
    const version = await this.versions.findOne({
      _id: source || review?.currentVersion || null,
      submission,
    });
    const template =
      version?.template ||
      (await this.conferences.findOne({ _id: conference }))
        ?.manuscriptTemplateFile;
    return template
      ? this.files.findOne({
          _id: template,
          conference,
          kind: "MANUSCRIPT_TEMPLATE",
        })
      : null;
  }

  async stageManuscript(
    user: CtxUser,
    conference: ObjectId,
    submission: ObjectId | undefined,
    filename: string,
    bytes: Buffer,
  ) {
    const config = await this.conferences.findOne({ _id: conference });
    const admin = user.access.includes(Access.Admin);

    if (
      !config ||
      (!admin &&
        !(await new Repository(Attendee).exists({
          "conference._id": conference,
          "user._id": user.id,
          "ticket.withSubmission": true,
        })))
    )
      throw new Error("A submission registration is required.");

    const review =
      submission && (await this.cases.findOne({ submission, conference }));
    if (
      !admin &&
      config.dates.submissionDeadline &&
      config.dates.submissionDeadline < new Date()
    )
      throw new Error("The manuscript deadline has passed.");

    if (
      submission &&
      !(await this.submissions.exists({
        _id: submission,
        conference,
        ...(!admin ? { authors: user.id } : {}),
      }))
    )
      throw new Error("Author access required.");

    const previous =
      review?.currentVersion &&
      (await this.versions.findOne({ _id: review.currentVersion }));
    const template = previous?.template || config.manuscriptTemplateFile;
    const type =
      !template && filename.toLowerCase().endsWith(".doc")
        ? validateAttachment(filename, bytes).mimeType
        : validateReviewFile(bytes, filename, !!template);
    if (template)
      await this.validateTemplate(template, conference, bytes, filename);
    const bucket = "conference-reviews";
    const objectName =
      String(conference) +
      "/author-uploads/" +
      randomUUID() +
      "." +
      filename.split(".").pop()!.toLowerCase();
    const url = "http://minio:9000/" + bucket + "/" + objectName;
    await this.storage.upload(bucket, objectName, bytes, type);

    try {
      await new Repository(StoredObject).create({
        url,
        owner: user.id,
        conference,
      });
      return { url };
    } catch (e) {
      await this.storage.deleteFiles([url]);
      throw e;
    }
  }

  async validateTemplate(
    id: ObjectId,
    conference: ObjectId,
    bytes: Buffer,
    filename: string,
  ) {
    const template = await this.files.findOne({
      _id: id,
      conference,
      kind: "MANUSCRIPT_TEMPLATE",
    });
    if (!template) throw new Error("Manuscript template not found.");
    validateReviewFile(bytes, filename, true);
    assertManuscriptLayout(await this.bytes(template), bytes);
  }

  async bytes(file: { bucket: string; objectName: string }) {
    return this.storage.buffer(file.bucket, file.objectName);
  }

  async adoptOriginal(submission: ObjectId, user: CtxUser) {
    const paper = await this.access.paper(user, submission, true);
    if (!paper.fileUrl) throw new Error("No manuscript has been uploaded.");
    const match = /^http:\/\/minio:9000\/([^/]+)\/(.+)$/.exec(paper.fileUrl);
    if (!match) throw new Error("Unsupported manuscript location.");
    const bytes = await this.storage.buffer(match[1], match[2]);
    const existing = await this.files.findOne({
      bucket: match[1],
      objectName: match[2],
    });
    if (existing) return { id: String(existing._id) };
    return this.upload({
      user,
      submission,
      kind: "ORIGINAL",
      filename: match[2].toLowerCase().endsWith(".pdf")
        ? "manuscript.pdf"
        : "manuscript.docx",
      buffer: bytes,
    });
  }

  async legacyPermission(user: CtxUser, urls: string[], operation: string) {
    for (const url of urls) {
      const match = /^http:\/\/minio:9000\/([^/]+)\/(.+)$/.exec(url);
      if (!match) throw new Error("Invalid storage URL.");
      const file = await this.files.findOne({
        bucket: match[1],
        objectName: match[2],
      });

      if (file) {
        if (operation !== "READ")
          throw new Error(
            "Versioned files cannot be deleted through generic storage actions.",
          );
        await this.authorizedFile(file._id, user);
      } else if (match[1] === "conference-reviews") {
        const uploads = new Repository(StoredObject);
        const owned = { url, owner: user.id, conference: { $exists: true } };
        const staged =
          operation === "READ"
            ? await uploads.exists(owned)
            : operation === "DELETE" && (await uploads.findOneAndDelete(owned));
        if (!staged) throw new Error("Use the protected file endpoint.");
      } else {
        const currentPaper = await this.submissions.findOne({ fileUrl: url });

        if (currentPaper) {
          if (operation !== "READ")
            throw new Error("Submission files are retained as history.");
          await this.access.paper(user, currentPaper._id, true);
          await this.activity.read(
            user,
            "submission.file_downloaded",
            currentPaper.conference as ObjectId,
            currentPaper._id,
          );
          continue;
        }

        const conference = await this.conferences.findOne({ slug: match[1] });

        if (!conference) {
          if (
            operation === "DELETE" &&
            !user.access.includes("ADMIN" as any) &&
            !(await new Repository(StoredObject).exists({
              url,
              owner: user.id,
            }))
          )
            throw new Error("Only the uploader may remove this file.");

          continue;
        }

        const paper = await this.submissions.findOne({
          conference: conference._id,
          fileUrl: url,
        });

        if (!paper) {
          const staged = await new Repository(StoredObject).findOne({
            url,
            owner: user.id,
          });
          if (!staged) throw new Error("Unregistered conference file.");
          continue;
        }

        if (operation !== "READ")
          throw new Error("Submission files are retained as history.");
        await this.access.paper(user, paper._id, true);
        await this.activity.read(
          user,
          "submission.file_downloaded",
          conference._id,
          paper._id,
        );
      }
    }

    return true;
  }
}
