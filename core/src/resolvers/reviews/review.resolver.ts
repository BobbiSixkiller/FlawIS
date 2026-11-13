import {
  Arg,
  Authorized,
  Ctx,
  Int,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import { ObjectId } from "mongodb";
import { Service } from "typedi";
import { Form, FormDefinition } from "../../entitites/Form";
import {
  ActivityEvent,
  FeedbackRelease,
  Reviewer,
  ReviewSettings,
} from "../../entitites/Review";
import { Conference } from "../../entitites/Conference";
import { User } from "../../entitites/User";
import { Submission } from "../../entitites/Submission";
import { Section } from "../../entitites/Section";
import { Repository } from "../../repositories/base.repository";
import { Context } from "../../util/auth";
import { withOptionalTransaction } from "../../util/helpers";
import { JSONObject } from "../../util/scalars";
import { FormFieldInput } from "../types/form/form.types";
import { FormService } from "../../services/form.service";
import { ReviewService } from "../../services/reviews/review.service";
import { ReviewAccessService } from "../../services/reviews/access.service";
import { ActivityService } from "../../services/reviews/activity.service";
import { toDTO } from "../../util/helpers";
import { RateLimit } from "../../middlewares/ratelimit.middleware";
import { UseMiddleware } from "type-graphql";

@Service()
@Resolver()
export class ReviewResolver {
  constructor(
    private readonly reviews: ReviewService,
    private readonly access: ReviewAccessService,
    private readonly forms: FormService,
    private readonly activity: ActivityService,
  ) {}

  @Authorized()
  @Query(() => JSONObject)
  async reviewAdminContext(@Ctx() { user }: Context) {
    const scopes = await this.access.scopes(user!);
    const conferences = await new Repository(Conference).findAll(
      { _id: { $in: scopes.map((s) => s.conference) } },
      { slug: 1, translations: 1 },
    );
    return {
      isAdmin: user!.access.includes("ADMIN" as any),
      scopes: scopes.map((s) => {
        const conference = conferences.find(
          (c) => String(c._id) === String(s.conference),
        );
        return {
          id: String(s._id),
          conference: String(s.conference),
          conferenceSlug: conference?.slug,
          conferenceName: {
            sk: conference?.translations.sk.name,
            en: conference?.translations.en.name,
          },
          user: String(s.user),
          section: s.section ? String(s.section) : null,
        };
      }),
    };
  }

  @Authorized()
  @Query(() => [Reviewer])
  reviewers(
    @Ctx() { user }: Context,
    @Arg("search", { defaultValue: "" }) search: string,
    @Arg("after", () => ObjectId, { nullable: true }) after?: ObjectId,
  ) {
    return this.reviews.reviewerList(user!, search, after);
  }

  @Authorized()
  @Query(() => JSONObject)
  reviewerProfile(
    @Ctx() { user }: Context,
    @Arg("reviewer") reviewer: ObjectId,
    @Arg("conference", () => ObjectId, { nullable: true })
    conference?: ObjectId,
    @Arg("before", () => ObjectId, { nullable: true }) before?: ObjectId,
  ) {
    return this.reviews.reviewerProfile(user!, reviewer, conference, before);
  }

  @Authorized()
  @Mutation(() => Reviewer)
  saveReviewer(
    @Ctx() { user }: Context,
    @Arg("data", () => JSONObject) data: Record<string, unknown>,
    @Arg("id", () => ObjectId, { nullable: true }) id?: ObjectId,
  ) {
    return this.reviews.saveReviewer(user!, data, id);
  }

  @Authorized()
  @Query(() => ReviewSettings, { nullable: true })
  async conferenceReviewSettings(
    @Ctx() { user }: Context,
    @Arg("conference") conference: ObjectId,
  ) {
    const scopes = await this.access.scopes(user!);
    if (
      !user!.access.includes("ADMIN" as any) &&
      !scopes.some((s) => String(s.conference) === String(conference))
    )
      throw new Error("Coordinator access required.");
    const settings = await this.reviews.settings.findOne({ conference });
    return settings
      ? {
          ...toDTO(settings),
          sectionRequirements: settings.sectionRequirements || {},
          questionnaire: settings.form
            ? await this.forms.getForm(settings.form)
            : null,
        }
      : null;
  }

  @Authorized()
  @Mutation(() => ReviewSettings)
  configureConferenceReviews(
    @Ctx() { user }: Context,
    @Arg("conference") conference: ObjectId,
    @Arg("data", () => JSONObject) data: Record<string, unknown>,
  ) {
    return this.reviews.configure(user!, conference, data);
  }

  @Authorized()
  @Query(() => JSONObject)
  conferenceReviewQueue(
    @Ctx() { user }: Context,
    @Arg("conference") conference: ObjectId,
    @Arg("section", () => ObjectId, { nullable: true }) section?: ObjectId,
    @Arg("after", () => ObjectId, { nullable: true }) after?: ObjectId,
    @Arg("first", () => Int, { defaultValue: 30 }) first = 30,
    @Arg("search", () => String, { nullable: true }) search?: string,
    @Arg("stage", () => String, { nullable: true }) stage?: string,
    @Arg("reviewer", () => String, { nullable: true }) reviewer?: string,
    @Arg("delivery", () => String, { nullable: true }) delivery?: string,
  ) {
    return this.reviews.queue(user!, conference, section, after, first, {
      search,
      stage,
      reviewer,
      delivery,
    });
  }

  @Authorized()
  @Query(() => JSONObject)
  async reviewerDirectory(
    @Ctx() { user }: Context,
    @Arg("search", { defaultValue: "" }) search: string,
    @Arg("after", () => ObjectId, { nullable: true }) after?: ObjectId,
    @Arg("archived", () => Boolean, { nullable: true }) archived?: boolean,
  ) {
    const result = await this.reviews.reviewerPage(
      user!,
      search,
      after,
      archived,
    );
    return { ...result, rows: result.rows.map((row) => toDTO(row)) };
  }

  @Authorized()
  @Query(() => JSONObject)
  assignmentEligibility(
    @Ctx() { user }: Context,
    @Arg("submission") submission: ObjectId,
    @Arg("reviewer") reviewer: ObjectId,
  ) {
    return this.reviews.assignmentEligibility(user!, submission, reviewer);
  }

  @Authorized()
  @Query(() => JSONObject)
  submissionReview(
    @Ctx() { user }: Context,
    @Arg("submission") submission: ObjectId,
  ) {
    return this.reviews.detail(user!, submission);
  }

  @Authorized()
  @Mutation(() => JSONObject)
  conferenceReviewAction(
    @Ctx() { user, req }: Context,
    @Arg("submission") submission: ObjectId,
    @Arg("action") action: string,
    @Arg("data", () => JSONObject) data: Record<string, unknown>,
  ) {
    return this.reviews.action(
      user!,
      submission,
      action,
      data,
      String(req.headers["tenant-domain"] || "conferences.flaw.uniba.sk"),
    );
  }

  @Authorized()
  @Mutation(() => Boolean)
  async setReviewCoordinator(
    @Ctx() { user }: Context,
    @Arg("conference") conference: ObjectId,
    @Arg("email") email: string,
    @Arg("section", () => ObjectId, { nullable: true }) section?: ObjectId,
  ) {
    return withOptionalTransaction(undefined, async () => {
      const target = await new Repository(User).findOne({
        email: email.trim().toLowerCase(),
        verified: true,
      });
      if (!target)
        throw new Error(
          "A verified FlawIS account with this email is required.",
        );
      await this.access.grant(user!, conference, target._id, section);
      await this.activity.record(
        user!,
        "review.coordinator_granted",
        conference,
        undefined,
        { user: String(target._id), section: section ? String(section) : null },
      );
      return true;
    });
  }

  @Authorized()
  @Query(() => JSONObject)
  async reviewCoordinators(
    @Ctx() { user }: Context,
    @Arg("conference") conference: ObjectId,
  ) {
    await this.access.conference(user!, conference, undefined, true);
    const grants = await this.access.grants.findAll({ conference });
    const people = await new Repository(User).findAll(
      { _id: { $in: grants.map((g) => g.user) } },
      { name: 1, email: 1 },
    );
    return {
      grants: grants.map((g) => ({
        id: String(g._id),
        user: String(g.user),
        section: g.section ? String(g.section) : null,
        person:
          people.find((p) => String(p._id) === String(g.user))?.name ||
          "Deleted account",
      })),
    };
  }

  @Authorized()
  @Mutation(() => Boolean)
  async revokeReviewCoordinator(
    @Ctx() { user }: Context,
    @Arg("id") id: ObjectId,
  ) {
    return withOptionalTransaction(undefined, async () => {
      const grant = await this.access.grants.findOne({ _id: id });
      if (!grant) throw new Error("Grant not found.");
      if (grant.section)
        await this.access.conference(user!, grant.conference, undefined, true);
      else if (!user!.access.includes("ADMIN" as any))
        throw new Error("Administrator access required.");
      await this.access.grants.deleteOne({ _id: id });
      await this.activity.record(
        user!,
        "review.coordinator_revoked",
        grant.conference,
        undefined,
        { grant: String(id) },
      );
      return true;
    });
  }

  @Authorized()
  @Mutation(() => Boolean)
  async setReviewerEligibility(
    @Ctx() { user }: Context,
    @Arg("conference") conference: ObjectId,
    @Arg("reviewer") reviewer: ObjectId,
    @Arg("data", () => JSONObject) data: Record<string, unknown>,
  ) {
    return withOptionalTransaction(undefined, async () => {
      await this.access.conference(user!, conference, undefined, true);
      const convert = (key: string) =>
        ((data[key] || []) as string[]).map((v) => new ObjectId(v));
      const participatedSections = convert("participatedSections"),
        guarantorSections = convert("guarantorSections"),
        conflicts = convert("conflicts");
      if (!(await this.reviews.reviewers.exists({ _id: reviewer })))
        throw new Error("Reviewer not found.");
      if (
        (await new Repository(Submission).countDocuments({
          _id: { $in: conflicts },
          conference,
        })) !== new Set(conflicts.map(String)).size
      )
        throw new Error("Conflicts must reference this conference.");
      const sections = [...participatedSections, ...guarantorSections];
      if (
        (await new Repository(Section).countDocuments({
          _id: { $in: sections },
          conference,
        })) !== new Set(sections.map(String)).size
      )
        throw new Error("Sections must belong to this conference.");
      await this.reviews.eligibility.findOneAndUpdate(
        { conference, reviewer },
        { $set: { participatedSections, guarantorSections, conflicts } },
        { upsert: true },
      );
      await this.activity.record(
        user!,
        "reviewer.eligibility_updated",
        conference,
        undefined,
        { reviewer: String(reviewer) },
      );
      return true;
    });
  }

  @Authorized()
  @Query(() => [FormDefinition])
  async formLibrary(
    @Ctx() { user }: Context,
    @Arg("search", { defaultValue: "" }) search: string,
  ) {
    await this.access.library(user!);
    return this.forms.list(search);
  }

  @Authorized()
  @Query(() => [Form])
  async formVersions(
    @Ctx() { user }: Context,
    @Arg("definition") definition: ObjectId,
  ) {
    await this.access.library(user!);
    return this.forms.versions(definition);
  }

  @Authorized()
  @Mutation(() => FormDefinition)
  async createLibraryForm(
    @Ctx() { user }: Context,
    @Arg("name") name: string,
    @Arg("description", { defaultValue: "" }) description: string,
  ) {
    await this.access.library(user!);
    return this.forms.createDefinition(name, description, user!.id);
  }

  @Authorized()
  @Mutation(() => Form)
  async publishLibraryForm(
    @Ctx() { user }: Context,
    @Arg("definition") definition: ObjectId,
    @Arg("fields", () => [FormFieldInput]) fields: FormFieldInput[],
    @Arg("name", { nullable: true }) name?: string,
    @Arg("description", { nullable: true }) description?: string,
  ) {
    await this.access.library(user!);
    if (name !== undefined)
      await this.forms.updateDefinition(definition, name, description || "");
    return this.forms.publish(definition, fields);
  }

  @Authorized()
  @Mutation(() => Boolean)
  async archiveLibraryForm(
    @Ctx() { user }: Context,
    @Arg("definition") definition: ObjectId,
  ) {
    await this.access.library(user!);
    return this.forms.archive(definition);
  }

  @Authorized()
  @Mutation(() => Form)
  async bindCourseRegistrationForm(
    @Ctx() { user }: Context,
    @Arg("course") course: ObjectId,
    @Arg("form") form: ObjectId,
  ) {
    if (!user!.access.includes("ADMIN" as any))
      throw new Error("Administrator access required.");
    return this.forms.bind("COURSE", course, form);
  }

  @Authorized()
  @Query(() => [ActivityEvent])
  async conferenceActivity(
    @Ctx() { user }: Context,
    @Arg("conference") conference: ObjectId,
    @Arg("submission", () => ObjectId, { nullable: true })
    submission?: ObjectId,
    @Arg("before", () => ObjectId, { nullable: true }) before?: ObjectId,
  ) {
    if (submission) await this.access.paper(user!, submission);
    else await this.access.conference(user!, conference, undefined, true);
    const events = await this.activity.list(conference, submission, before);
    const safe = [];
    for (const event of events) {
      try {
        if (event.submission) await this.access.paper(user!, event.submission);
        // MongoDB document serialization omits empty objects; GraphQL requires changes.
        safe.push({ ...toDTO(event), changes: event.changes || {} });
      } catch {
        /* Author conflicts remain hidden in conference timelines. */
      }
    }
    return safe;
  }

  @Query(() => JSONObject)
  @UseMiddleware(RateLimit(200))
  reviewerPortal(@Arg("token") token: string) {
    return this.reviews.portal(token);
  }

  @Mutation(() => JSONObject)
  @UseMiddleware(RateLimit(100))
  saveReviewReport(
    @Ctx() { req }: Context,
    @Arg("token") token: string,
    @Arg("answers", () => JSONObject) answers: Record<string, unknown>,
    @Arg("submit", { defaultValue: false }) submit: boolean,
    @Arg("expectedRevision", () => Int, { nullable: true })
    expectedRevision?: number,
  ) {
    return this.reviews.saveReport(
      token,
      answers,
      expectedRevision,
      submit,
      String(req.headers["tenant-domain"] || "conferences.flaw.uniba.sk"),
    );
  }

  @Mutation(() => JSONObject)
  @UseMiddleware(RateLimit(50))
  declineReview(@Ctx() { req }: Context, @Arg("token") token: string) {
    return this.reviews.saveReport(
      token,
      {},
      undefined,
      false,
      String(req.headers["tenant-domain"] || "conferences.flaw.uniba.sk"),
      true,
    );
  }

  @Authorized()
  @Mutation(() => JSONObject)
  enterReviewReport(
    @Ctx() { user, req }: Context,
    @Arg("assignment") assignment: ObjectId,
    @Arg("answers", () => JSONObject) answers: Record<string, unknown>,
    @Arg("expectedRevision", () => Int, { nullable: true })
    expectedRevision?: number,
  ) {
    return this.reviews.saveReport(
      "",
      answers,
      expectedRevision,
      true,
      String(req.headers["tenant-domain"] || "conferences.flaw.uniba.sk"),
      false,
      { user: user!, assignmentId: assignment },
    );
  }

  @Query(() => JSONObject)
  @UseMiddleware(RateLimit(100))
  revisionPortal(@Arg("token") token: string) {
    return this.reviews.revisionPortal(token);
  }

  @Authorized()
  @Query(() => JSONObject)
  authorReviewWorkspace(
    @Ctx() { user }: Context,
    @Arg("submission") submission: ObjectId,
  ) {
    return this.reviews.authorWorkspace(user!, submission);
  }

  @Authorized()
  @Query(() => [FeedbackRelease])
  authorReviewFeedback(
    @Ctx() { user }: Context,
    @Arg("submission") submission: ObjectId,
  ) {
    return this.reviews.authorFeedback(user!, submission);
  }
}
