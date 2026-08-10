import { ObjectId } from "mongodb";
import {
  Arg,
  Args,
  Authorized,
  FieldResolver,
  Mutation,
  Resolver,
  Root,
} from "type-graphql";
import { Service } from "typedi";

import { Conference } from "../../entitites/Conference";
import { Section, SectionTranslation } from "../../entitites/Section";
import { SectionService } from "../../services/conferences/section.service";
import { I18nService } from "../../services/i18n.service";
import {
  SectionInput,
  SectionMutationResponse,
} from "../types/conference.types";
import {
  SubmissionArgs,
  SubmissionConnection,
} from "../types/submission.types";

@Service()
@Resolver(() => Section)
export class SectionResolver {
  constructor(
    private readonly sectionService: SectionService,
    private readonly i18nService: I18nService,
  ) {}

  @Authorized(["ADMIN"])
  @Mutation(() => SectionMutationResponse)
  async createSection(
    @Arg("data") data: SectionInput,
  ): Promise<SectionMutationResponse> {
    const section = await this.sectionService.createSection(data);
    return {
      data: section,
      message: this.i18nService.translate("new", {
        ns: "section",
        name: section.translations[
          this.i18nService.language() as keyof SectionTranslation
        ].name,
      }),
    };
  }

  @Authorized(["ADMIN"])
  @Mutation(() => SectionMutationResponse)
  async updateSection(
    @Arg("data") data: SectionInput,
    @Arg("id") id: ObjectId,
  ): Promise<SectionMutationResponse> {
    const section = await this.sectionService.updateSection(id, data);
    return {
      data: section,
      message: this.i18nService.translate("update", {
        ns: "section",
        name: section.translations[
          this.i18nService.language() as keyof SectionTranslation
        ].name,
      }),
    };
  }

  @Authorized(["ADMIN"])
  @Mutation(() => SectionMutationResponse)
  async deleteSection(
    @Arg("id") id: ObjectId,
  ): Promise<SectionMutationResponse> {
    const section = await this.sectionService.deleteSection(id);
    return {
      data: section,
      message: this.i18nService.translate("delete", {
        ns: "section",
        name: section.translations[
          this.i18nService.language() as keyof SectionTranslation
        ].name,
      }),
    };
  }

  @FieldResolver(() => Conference, { nullable: true })
  async conference(@Root() { conference }: Section) {
    return await this.sectionService.getConference(conference?._id);
  }

  @Authorized(["ADMIN"])
  @FieldResolver(() => SubmissionConnection)
  async submissions(
    @Args() args: SubmissionArgs,
    @Root() { id: sectionId, conference }: Section,
  ): Promise<SubmissionConnection> {
    return await this.sectionService.getSubmissions(
      sectionId,
      conference?._id,
      args,
    );
  }
}
