import { createHash, randomUUID } from "crypto";
import { ObjectId } from "mongodb";
import { Service } from "typedi";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import {
  ReviewFile,
  ManuscriptVersion,
  SubmissionReview,
  ReviewRound,
  ReviewAssignment,
  RevisionRequest,
} from "../../entitites/Review";
import { StoredObject } from "../../entitites/StoredObject";
import { Submission } from "../../entitites/Submission";
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
  if (!buffer.length || buffer.length > MAX_BYTES)
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
  }) {
    if (
      ![
        "ORIGINAL",
        "ANONYMOUS",
        "REPORT",
        "REVISION",
        "TEMPLATE",
        "MANUSCRIPT_TEMPLATE",
      ].includes(input.kind)
    )
      throw new Error("Invalid file kind.");
    const contentType = validateReviewFile(
      input.buffer,
      input.filename,
      ["REVISION", "TEMPLATE", "MANUSCRIPT_TEMPLATE"].includes(input.kind),
    );
    const isTemplate = ["TEMPLATE", "MANUSCRIPT_TEMPLATE"].includes(input.kind);
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
      if (revisionRequest.status !== "REQUESTED" || input.kind !== "REVISION")
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
        if (input.kind === "TEMPLATE")
          new Docxtemplater(new PizZip(input.buffer), {
            paragraphLoop: true,
            linebreaks: true,
          });
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
    if (paper) {
      conference = paper.conference as ObjectId;
      const existingReview = await this.cases.findOne({
        submission: paper._id,
      });
      if (
        existingReview &&
        existingReview.decision !== "PENDING" &&
        input.kind !== "REPORT"
      )
        throw new Error("This submission is closed.");
      const isAuthor =
        input.user &&
        paper.authors.some((a) => String(a) === String(input.user!.id));
      if (isAuthor && !input.revisionToken && input.kind === "REVISION") {
        revisionRequest = await this.requests.findOne({
          submission: paper._id,
          status: "REQUESTED",
          expiresAt: { $gt: new Date() },
        });
        if (!revisionRequest)
          throw new Error("A current correction request is required.");
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
    try {
      return await withOptionalTransaction(undefined, async (session) => {
        const file = await this.files.create(
          {
            assignment: assignmentId,
            submission,
            conference,
            bucket: "conference-reviews",
            objectName,
            kind: input.kind,
            filename: `${input.kind === "REPORT" ? "report" : input.kind === "TEMPLATE" ? "review-template" : input.kind === "MANUSCRIPT_TEMPLATE" ? "manuscript-template" : "manuscript"}.${extension}`,
            contentType,
            size: input.buffer.length,
            checksum: createHash("sha256").update(input.buffer).digest("hex"),
            actor,
          },
          { session },
        );
        if (paper && submission) {
          const review = await this.reviews.ensureCase(paper, session);
          if (review.decision !== "PENDING")
            throw new Error("This submission is closed.");
          await this.cases.findOneAndUpdate(
            { _id: review._id },
            { $inc: { revision: 1 } },
            { session },
          );
          if (["ORIGINAL", "REVISION"].includes(input.kind)) {
            const last = await this.versions.findOne({ submission }, null, {
              sort: { number: -1 },
              session,
            });
            const version = await this.versions.create(
              {
                submission,
                number: (last?.number || 0) + 1,
                file: file._id,
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
                    note: String(input.note || "").slice(0, 5000),
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
              { $set: { anonymousFile: file._id, anonymousApproved: false } },
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
        .deleteFiles([`http://minio:9000/conference-reviews/${objectName}`])
        .catch(() => undefined);
      throw error;
    }
  }

  async authorizedFile(fileId: ObjectId, user?: CtxUser, token?: string) {
    const file = await this.files.findOne({ _id: fileId });
    if (!file) throw new Error("File not found.");
    let actor: CtxUser | string;
    if (token) {
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
          ["ORIGINAL", "REVISION"].includes(file.kind),
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
      } else if (match[1] === "conference-reviews")
        throw new Error("Use the protected file endpoint.");
      else {
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
