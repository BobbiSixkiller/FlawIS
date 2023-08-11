import { ObjectId } from "mongodb";
import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { Service } from "typedi";
import { Conference } from "../entities/Conference";
import { Section } from "../entities/Section";
import { Submission } from "../entities/Submission";
import { CRUDservice } from "../services/CRUDservice";
import { Context } from "../util/auth";
import { CheckConferenceSection, LoadResource } from "../util/decorators";
import { localizeInput } from "../util/locale";
import { ConferenceSection } from "../util/types";
import { SubmissionInput } from "./types/submission";
import { User } from "../entities/User";
import Messagebroker from "../util/rmq";
import { convertDocument } from "../middlewares/typegoose-middleware";
import { DocumentType } from "@typegoose/typegoose";
import { FileInput } from "./types/file";

@Service()
@Resolver(() => Submission)
export class SubmissionResolver {
  constructor(
    private readonly submissionService = new CRUDservice(Submission),
    private readonly conferenceService = new CRUDservice(Conference),
    private readonly sectionService = new CRUDservice(Section),
    private readonly userService = new CRUDservice(User)
  ) {}

  @Authorized()
  @Query(() => Submission)
  async submission(@Arg("id") id: ObjectId): Promise<Submission> {
    const submission = await this.submissionService.findOne({ _id: id });
    if (!submission) throw new Error("Submission not found!");

    return submission;
  }

  @Authorized()
  @Mutation(() => Submission)
  async addSubmission(
    @Arg("data") data: SubmissionInput,
    @CheckConferenceSection() { conference, section }: ConferenceSection,
    @Ctx() { user, locale }: Context
  ): Promise<Submission> {
    const submission = await this.submissionService.create({
      ...localizeInput(data, data.translations, locale),
      conference: conference.id,
      section: section.id,
      authors: [data.userId ? data.userId : user?.id],
    });

    return submission;
  }

  @Authorized()
  @Mutation(() => Submission)
  async updateSubmission(
    @Arg("id") _id: ObjectId,
    @Arg("data") data: SubmissionInput,
    @LoadResource(Submission) submission: DocumentType<Submission>,
    @CheckConferenceSection() { conference }: ConferenceSection,
    @Ctx() { locale, user, req }: Context
  ) {
    for (const [key, value] of Object.entries(
      localizeInput(data, data.translations, locale)
    )) {
      if (key !== "authors") {
        submission[key as keyof Submission] = value;
      }
    }

    const localizedSubmission = convertDocument(submission, locale);

    data.authors?.forEach((author) =>
      Messagebroker.produceMessage(
        JSON.stringify({
          locale,
          clientUrl: req.headers.origin,
          name: user?.name,
          email: author,
          conferenceName: conference.name,
          conferenceSlug: conference.slug,
          submissionId: localizedSubmission.id,
          submissionName: localizedSubmission.name,
          submissionAbstract: localizedSubmission.abstract,
          submissionKeywords: localizedSubmission.keywords,
        }),
        "mail.conference.coAuthor"
      )
    );

    return await submission.save();
  }

  @Authorized()
  @Mutation(() => Submission)
  async deleteSubmission(
    @Arg("id") _id: ObjectId,
    @Arg("file", { nullable: true }) file: FileInput,
    @LoadResource(Submission) submission: DocumentType<Submission>
  ) {
    if (submission.file) {
      Messagebroker.produceMessage(JSON.stringify(file), "file.delete");
    }
    return await submission.remove();
  }

  @Authorized()
  @Mutation(() => Submission)
  async addSubmissionFile(
    @Arg("id") _id: ObjectId,
    @Arg("file") file: FileInput,
    @LoadResource(Submission) submission: DocumentType<Submission>
  ) {
    submission.file = file;
    return await submission.save();
  }

  @Authorized()
  @Mutation(() => Submission)
  async deleteSubmissionFile(
    @Arg("id") _id: ObjectId,
    @Arg("file") file: FileInput,
    @LoadResource(Submission) submission: DocumentType<Submission>
  ) {
    Messagebroker.produceMessage(JSON.stringify(file), "file.delete");
    submission.file = undefined;
    return await submission.save();
  }

  @Authorized()
  @FieldResolver(() => Conference, { nullable: true })
  async conference(@Root() { conference }: Submission) {
    return await this.conferenceService.findOne({ _id: conference });
  }

  @Authorized()
  @FieldResolver(() => Section, { nullable: true })
  async section(@Root() { section }: Submission) {
    return await this.sectionService.findOne({ _id: section });
  }

  @Authorized()
  @FieldResolver(() => [User])
  async authors(@Root() { authors }: Submission) {
    return await this.userService.findAll({ _id: { $in: authors } });
  }
}
