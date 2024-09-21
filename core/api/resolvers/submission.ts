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

import { CRUDservice } from "../services/CRUDservice";
import { Context } from "../util/auth";
import { LoadResource } from "../util/decorators";
import {
  SubmissionInput,
  SubmissionMutationResponse,
} from "./types/submission";
import Messagebroker from "../util/rmq";
import { DocumentType } from "@typegoose/typegoose";
import { Submission, SubmissionTranslation } from "../entitites/Submission";
import { Conference } from "../entitites/Conference";
import { Section } from "../entitites/Section";
import { User } from "../entitites/User";
import { I18nService } from "../services/i18nService";

@Service()
@Resolver(() => Submission)
export class SubmissionResolver {
  constructor(
    private readonly submissionService = new CRUDservice(Submission),
    private readonly conferenceService = new CRUDservice(Conference),
    private readonly sectionService = new CRUDservice(Section),
    private readonly userService = new CRUDservice(User),
    private readonly i18nService: I18nService
  ) {}

  @Authorized()
  @Query(() => Submission)
  async submission(
    @Arg("id") _id: ObjectId,
    @LoadResource(Submission) submission: DocumentType<Submission>
  ): Promise<Submission> {
    return submission;
  }

  @Authorized()
  @Mutation(() => SubmissionMutationResponse)
  async createSubmission(
    @Arg("data") data: SubmissionInput,
    @Ctx() { user }: Context
  ): Promise<SubmissionMutationResponse> {
    const submission = await this.submissionService.create({
      ...data,
      authors: user?.id,
    });

    if (data.authors.length !== 0) {
      const conference = await this.conferenceService.findOne({
        _id: submission.conference,
      });

      data.authors?.forEach((author) =>
        Messagebroker.produceMessage(
          JSON.stringify({
            locale: this.i18nService.language(),
            name: user?.name,
            email: author,
            conferenceName:
              conference?.translations[
                this.i18nService.language() as "sk" | "en"
              ].name,
            conferenceSlug: conference?.slug,
            submissionId: submission.id,
            submissionName:
              submission.translations[
                this.i18nService.language() as "sk" | "en"
              ].name,
            submissionAbstract:
              submission.translations[
                this.i18nService.language() as "sk" | "en"
              ].abstract,
            submissionKeywords:
              submission.translations[
                this.i18nService.language() as "sk" | "en"
              ].keywords,
          }),
          "mail.conference.coAuthor"
        )
      );
    }

    return {
      data: submission,
      message: this.i18nService.translate("new", {
        ns: "submission",
        name: submission.translations[
          this.i18nService.language() as keyof SubmissionTranslation
        ].name,
      }),
    };
  }

  @Authorized()
  @Mutation(() => SubmissionMutationResponse)
  async updateSubmission(
    @Arg("id") _id: ObjectId,
    @Arg("data") data: SubmissionInput,
    @LoadResource(Submission) submission: DocumentType<Submission>,
    @Ctx() { user }: Context
  ): Promise<SubmissionMutationResponse> {
    for (const [key, value] of Object.entries(data)) {
      if (key !== "authors") {
        submission[key as keyof Submission] = value;
      }
    }

    await this.submissionService.update(
      { _id: submission.id },
      { $addToSet: { authors: user?.id } }
    );

    if (data.authors.length !== 0) {
      const conference = await this.conferenceService.findOne({
        _id: submission.conference,
      });

      data.authors?.forEach((author) =>
        Messagebroker.produceMessage(
          JSON.stringify({
            locale: this.i18nService.language(),
            name: user?.name,
            email: author,
            conferenceName:
              conference?.translations[
                this.i18nService.language() as "sk" | "en"
              ].name,
            conferenceSlug: conference?.slug,
            submissionId: submission.id,
            submissionName:
              submission.translations[
                this.i18nService.language() as "sk" | "en"
              ].name,
            submissionAbstract:
              submission.translations[
                this.i18nService.language() as "sk" | "en"
              ].abstract,
            submissionKeywords:
              submission.translations[
                this.i18nService.language() as "sk" | "en"
              ].keywords,
          }),
          "mail.conference.coAuthor"
        )
      );
    }

    await submission.save();

    return {
      message: this.i18nService.translate("update", {
        ns: "submission",
        name: submission.translations[
          this.i18nService.language() as keyof SubmissionTranslation
        ].name,
      }),
      data: submission,
    };
  }

  @Authorized()
  @Mutation(() => SubmissionMutationResponse)
  async unsetSubmissionFile(
    @Arg("id") _id: ObjectId,
    @LoadResource(Submission) submission: DocumentType<Submission>
  ) {
    await this.submissionService.update(
      { _id: submission.id },
      { $unset: { fileUrl: "" } }
    );

    return {
      message: this.i18nService.translate("update", {
        ns: "submission",
        name: submission.translations[
          this.i18nService.language() as keyof SubmissionTranslation
        ].name,
      }),
      data: submission,
    };
  }

  @Authorized()
  @Mutation(() => SubmissionMutationResponse)
  async deleteSubmission(
    @Arg("id") _id: ObjectId,
    @LoadResource(Submission) submission: DocumentType<Submission>
  ): Promise<SubmissionMutationResponse> {
    await this.submissionService.delete({ _id: submission.id });

    return {
      message: this.i18nService.translate("delete", {
        ns: "submission",
        name: submission.translations[
          this.i18nService.language() as keyof SubmissionTranslation
        ].name,
      }),
      data: submission,
    };
  }

  @Authorized(["ADMIN"])
  @Mutation(() => SubmissionMutationResponse)
  async removeAuthor(
    @Arg("id") _id: ObjectId,
    @Arg("authorId") authorId: ObjectId,
    @LoadResource(Submission) submission: DocumentType<Submission>
  ): Promise<SubmissionMutationResponse> {
    submission.authors = submission.authors.filter(
      (a) => a.toString() !== authorId.toString()
    );

    await submission.save();

    return {
      message: this.i18nService.translate("authorRemoved", {
        ns: "submission",
        name: submission.translations[
          this.i18nService.language() as keyof SubmissionTranslation
        ].name,
      }),
      data: submission,
    };
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
