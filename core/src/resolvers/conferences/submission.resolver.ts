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

import { Context } from "../../util/auth";
import {
  SubmissionInput,
  SubmissionMutationResponse,
} from "../types/submission.types";
import { Submission, SubmissionTranslation } from "../../entitites/Submission";
import { Conference } from "../../entitites/Conference";
import { Section } from "../../entitites/Section";
import { User } from "../../entitites/User";
import { I18nService } from "../../services/i18n.service";
import { Repository } from "../../repositories/base.repository";
import { ConferenceRepository } from "../../repositories/conference.repository";
import { UserRepository } from "../../repositories/user.repository";
import { SubmissionService } from "../../services/submission.service";

// Refactor section, conference and authors field with The Extended Reference Pattern to include name and ID
@Service()
@Resolver(() => Submission)
export class SubmissionResolver {
  constructor(
    private readonly submissionService: SubmissionService,
    private readonly conferenceRepository: ConferenceRepository,
    private readonly sectionRepository = new Repository(Section),
    private readonly userRepository: UserRepository,
    private readonly i18nService: I18nService
  ) {}

  @Authorized()
  @Query(() => Submission)
  async submission(@Arg("id") id: ObjectId) {
    return await this.submissionService.getSubmission(id);
  }

  @Authorized()
  @Mutation(() => SubmissionMutationResponse)
  async createSubmission(
    @Arg("data") data: SubmissionInput,
    @Ctx() { user, req }: Context
  ) {
    const hostname = req.headers["tenant-domain"] as string;
    const submission = await this.submissionService.createSubmission(
      hostname,
      user!,
      data
    );

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
    @Arg("id") id: ObjectId,
    @Arg("data") data: SubmissionInput,
    @Ctx() { user, req }: Context
  ) {
    const hostname = req.headers["tenant-domain"] as string;
    const submission = await this.submissionService.updateSubmission(
      id,
      hostname,
      user!,
      data
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
  async deleteSubmission(@Arg("id") id: ObjectId, @Ctx() { user }: Context) {
    const submission = await this.submissionService.deleteSubmission(id, user!);

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

  @Authorized()
  @Mutation(() => SubmissionMutationResponse, {
    description:
      "Adds currently logged in user as the co-author of a submission",
  })
  async acceptAuthorInvite(@Ctx() { req, user }: Context) {
    const token = req.headers["token"] as string;
    const submission = await this.submissionService.addCoAuthor(token, user!);

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

  @Authorized(["ADMIN"])
  @Mutation(() => SubmissionMutationResponse)
  async removeAuthor(
    @Arg("id") id: ObjectId,
    @Arg("authorId") authorId: ObjectId
  ): Promise<SubmissionMutationResponse> {
    const submission = await this.submissionService.removeAuthor(id, authorId);

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
  @FieldResolver(() => Conference, { nullable: true })
  async conference(@Root() { conference }: Submission) {
    return await this.conferenceRepository.findOne({ _id: conference });
  }

  @Authorized()
  @FieldResolver(() => Section, { nullable: true })
  async section(@Root() { section }: Submission) {
    return await this.sectionRepository.findOne({ _id: section });
  }

  @Authorized()
  @FieldResolver(() => [User])
  async authors(@Root() { authors }: Submission) {
    return await this.userRepository.findAll({ _id: { $in: authors } });
  }
}
