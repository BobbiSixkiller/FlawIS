import { ObjectId } from "mongodb";
import { Service } from "typedi";
import { Access } from "../../entitites/User";
import { ReviewGrant, SubmissionReview } from "../../entitites/Review";
import { Submission } from "../../entitites/Submission";
import { Section } from "../../entitites/Section";
import { Repository } from "../../repositories/base.repository";
import { CtxUser } from "../../util/types";

export function isReviewAuthor(user: CtxUser, authorIds: unknown[]) {
  return authorIds.some(
    (id) =>
      String(id) === String(user.id) || String(id) === user.originalActorId,
  );
}

@Service()
export class ReviewAccessService {
  readonly grants = new Repository(ReviewGrant);
  private readonly cases = new Repository(SubmissionReview);
  private readonly submissions = new Repository(Submission);
  private readonly sections = new Repository(Section);

  async scopes(user: CtxUser) {
    return this.grants.findAll({ user: user.id });
  }
  async library(user: CtxUser) {
    if (
      user.access.includes(Access.Admin) ||
      (await this.grants.exists({ user: user.id, section: { $exists: false } }))
    )
      return;
    throw new Error("Conference coordinator access required.");
  }
  async conference(
    user: CtxUser,
    conference: ObjectId,
    section?: ObjectId,
    lead = false,
  ) {
    if (user.access.includes(Access.Admin)) return;
    const grant = await this.grants.findOne({
      user: user.id,
      conference,
      ...(lead || !section
        ? { section: { $exists: false } }
        : { $or: [{ section: { $exists: false } }, { section }] }),
    });
    if (!grant)
      throw new Error("You do not coordinate this conference or section.");
  }
  async paper(user: CtxUser, submission: ObjectId, allowAuthor = false) {
    const paper = await this.submissions.findOne({ _id: submission });
    if (!paper) throw new Error("Submission not found.");
    const review = await this.cases.findOne({ submission });
    const author = isReviewAuthor(user, [
      ...paper.authors,
      ...(review?.authorIds ?? []),
    ]);
    if (author && allowAuthor) return paper;
    if (author)
      throw new Error(
        "An independent coordinator must handle your own submission.",
      );
    await this.conference(
      user,
      paper.conference as ObjectId,
      paper.section as ObjectId,
    );
    return paper;
  }
  async grant(
    user: CtxUser,
    conference: ObjectId,
    target: ObjectId,
    section?: ObjectId,
  ) {
    if (section) {
      await this.conference(user, conference, undefined, true);
      if (!(await this.sections.exists({ _id: section, conference })))
        throw new Error("Section does not belong to the conference.");
    } else if (!user.access.includes(Access.Admin))
      throw new Error("Only administrators appoint conference coordinators.");
    return this.grants.findOneAndUpdate(
      {
        conference,
        user: target,
        ...(section ? { section } : { section: { $exists: false } }),
      },
      { $set: { conference, user: target, ...(section ? { section } : {}) } },
      { new: true, upsert: true },
    );
  }
}
