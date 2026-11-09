import { ObjectId } from "mongodb";
import { Service } from "typedi";
import { ReviewFileService } from "./file.service";
import { ReviewService } from "./review.service";
import { ActivityService } from "./activity.service";
import { CtxUser } from "../../util/types";
import { Repository } from "../../repositories/base.repository";
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
  ) {
    if (!url || url === previous) return;
    const staged = await new Repository(StoredObject).exists({
      url,
      owner: user.id,
    });
    const privateFile = await this.reviews.files.exists({
      bucket: "conference-reviews",
      objectName: url.replace("http://minio:9000/conference-reviews/", ""),
      actor: String(user.id),
    });
    if (!staged && !privateFile)
      throw new Error("Only a manuscript uploaded by you can be attached.");
  }
  async rememberAuthors(submission: any) {
    await this.reviews.ensureCase(submission);
  }
  async capture(submission: any, user: CtxUser) {
    await this.rememberAuthors(submission);
    if (!submission.fileUrl) return;
    const paperId = new ObjectId(String(submission.id || submission._id));
    const review = await this.reviews.cases.findOne({ submission: paperId });
    const version = review?.currentVersion
      ? await this.reviews.versions.findOne({ _id: review.currentVersion })
      : null;
    const file = version
      ? await this.reviews.files.findOne({ _id: version.file })
      : null;
    if (
      file &&
      submission.fileUrl ===
        `http://minio:9000/${file.bucket}/${file.objectName}`
    )
      return;
    await this.files.adoptOriginal(paperId, user);
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
