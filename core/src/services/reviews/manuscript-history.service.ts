import { ObjectId } from "mongodb";
import { Service } from "typedi";
import { validateAttachment } from "./documents/attachment-validation";
import { createHash } from "node:crypto";
import { ReviewFileService, validateReviewFile } from "./file.service";
import { ReviewService } from "./review.service";
import { ActivityService } from "./activity.service";
import { CtxUser } from "../../util/types";
import { Repository } from "../../repositories/base.repository";
import { Conference } from "../../entitites/Conference";
import { Submission } from "../../entitites/Submission";
import { StoredObject } from "../../entitites/StoredObject";
import { withOptionalTransaction } from "../../util/helpers";

@Service()
export class ManuscriptHistoryService {
  constructor(
    private readonly files: ReviewFileService,
    private readonly reviews: ReviewService,
    private readonly activity: ActivityService,
  ) {}

  async validateUpload(
    url: string | undefined,
    previous: string | undefined,
    user: CtxUser,
    conferenceId: ObjectId,
    submission?: ObjectId,
  ) {
    if (url === previous || (!url && !previous)) return;
    const review =
      submission && (await this.reviews.cases.findOne({ submission }));

    if (
      review &&
      (review.decision !== "PENDING" ||
        (await this.reviews.revisions.exists({
          submission,
          status: { $in: ["REQUESTED", "RECEIVED"] },
        })))
    )
      throw new Error(
        "Manuscript replacement is closed. Use the current correction request.",
      );

    if (!url) return;
    const uploads = new Repository(StoredObject);
    const staged = await uploads.findOne({
      url,
      owner: user.id,
    });
    if (!staged)
      throw new Error("Only a manuscript uploaded by you can be attached.");
    const conference = await new Repository(Conference).findOne({
      _id: conferenceId,
    });
    const match = /^http:\/\/minio:9000\/([^/]+)\/(.+)$/.exec(url);
    if (
      !match ||
      !conference ||
      (staged.conference
        ? String(staged.conference) !== String(conferenceId) ||
          match[1] !== "conference-reviews"
        : match[1] !== conference.slug.toLowerCase())
    )
      throw new Error("Upload the manuscript to this conference.");
    const source = { bucket: match[1], objectName: match[2] };
    if (await this.reviews.files.exists(source))
      throw new Error("Upload a new manuscript file.");
    const version =
      review?.currentVersion &&
      (await this.reviews.versions.findOne({ _id: review.currentVersion }));
    const template = version?.template || conference.manuscriptTemplateFile;

    if (template) {
      await this.files.validateTemplate(
        template,
        conferenceId,
        await this.files.bytes(source),
        source.objectName,
      );
    }

    // Cleanup and attachment compete for the same staging record. A rolled-back submission leaves it available for retry.
    if (
      staged.conference &&
      !(await uploads.findOneAndDelete({ _id: staged._id, owner: user.id }))
    )
      throw new Error("This manuscript upload has already been used.");
  }

  async rememberAuthors(submission: any) {
    await this.reviews.ensureCase(submission);
  }

  /** Attach a stored object as an immutable version in the submission transaction. */
  async capture(submission: Submission, user: CtxUser, historical = false) {
    const review = await this.reviews.ensureCase(submission);
    if (!submission.fileUrl) return;
    const match = /^http:\/\/minio:9000\/([^/]+)\/(.+)$/.exec(
      submission.fileUrl,
    );
    if (!match) throw new Error("Unsupported manuscript location.");
    const [, bucket, objectName] = match;
    const retained = await this.reviews.files.findOne({ bucket, objectName });
    if (retained && String(retained.submission) !== String(submission.id))
      throw new Error("Manuscript belongs to another submission.");

    if (
      retained &&
      (await this.reviews.versions.exists({
        submission: submission.id,
        file: retained._id,
      }))
    )
      return;

    const previous = await this.reviews.versions.findOne(
      { submission: submission.id },
      null,
      { sort: { number: -1 } },
    );
    const bytes = await this.files.bytes({ bucket, objectName });
    const extension = objectName.split(".").pop()?.toLowerCase();
    const contentType =
      !historical && extension === "doc"
        ? validateAttachment("manuscript.doc", bytes).mimeType
        : historical
          ? extension === "docx"
            ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            : extension === "pdf"
              ? "application/pdf"
              : "application/octet-stream"
          : validateReviewFile(bytes, objectName);
    const file =
      retained ||
      (await this.reviews.files.create({
        conference: submission.conference,
        submission: submission.id,
        bucket,
        objectName,
        kind: "ORIGINAL",
        filename: "manuscript." + extension,
        contentType,
        size: bytes.length,
        checksum: createHash("sha256").update(bytes).digest("hex"),
        actor: String(user.id),
      }));
    const conference = await new Repository(Conference).findOne({
      _id: submission.conference,
    });
    const version = await this.reviews.versions.create({
      submission: submission.id,
      number: (previous?.number || 0) + 1,
      parentVersion: previous?._id,
      template:
        previous?.template ||
        (!historical ? conference?.manuscriptTemplateFile : undefined),
      file: file._id,
      uploadedBy: String(user.id),
    });
    await this.reviews.cases.findOneAndUpdate(
      { _id: review._id },
      {
        $set: { currentVersion: version._id, formalApproved: false },
        $inc: { revision: 1 },
      },
    );
    await this.activity.record(
      user,
      "submission.file_uploaded",
      review.conference,
      submission.id,
      { file: String(file._id), version: String(version._id) },
    );
  }

  async withdraw(submission: any, user: CtxUser) {
    return withOptionalTransaction(undefined, async (session) => {
      const review = await this.reviews.ensureCase(submission, session);
      await this.reviews.cases.findOneAndUpdate(
        { _id: review._id },
        {
          $set: {
            decision: "WITHDRAWN",
            decisionReason: "Withdrawn by an author or administrator.",
          },
          $inc: { revision: 1 },
        },
        { session },
      );
      await this.reviews.assignments.updateMany(
        { review: review._id },
        { $unset: { tokenHash: 1, tokenEncrypted: 1 } },
        { session },
      );
      await this.reviews.revisions.updateMany(
        {
          submission: submission.id || submission._id,
          status: { $in: ["REQUESTED", "RECEIVED"] },
        },
        { $set: { status: "CANCELLED", expiresAt: new Date() } },
        { session },
      );
      await new Repository(Submission).findOneAndUpdate(
        { _id: submission.id || submission._id },
        { $set: { withdrawn: true } },
        { session },
      );
      await this.activity.record(
        user,
        "submission.withdrawn",
        submission.conference,
        submission.id || submission._id,
        {},
        session,
      );
      return { ...submission, withdrawn: true };
    });
  }
}
