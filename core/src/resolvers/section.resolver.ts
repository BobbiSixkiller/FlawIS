import { Service } from "typedi";
import {
  Arg,
  Args,
  Authorized,
  FieldResolver,
  Mutation,
  Resolver,
  Root,
} from "type-graphql";
import {
  SectionInput,
  SectionMutationResponse,
} from "./types/conference.types";
import { Section, SectionTranslation } from "../entitites/Section";
import { I18nService } from "../services/i18n.service";
import { LoadResource } from "../util/decorators";
import { ObjectId } from "mongodb";
import { DocumentType } from "@typegoose/typegoose";
import { SubmissionArgs, SubmissionConnection } from "./types/submission.types";
import { Conference } from "../entitites/Conference";
import { ConferenceRepository } from "../repositories/conference.repository";
import { Repository } from "../repositories/base.repository";
import { SubmissionRepository } from "../repositories/submission.repository";

@Service()
@Resolver(() => Section)
export class SectionResolver {
  constructor(
    private readonly conferenceRepository: ConferenceRepository,
    private readonly sectionRepository = new Repository(Section),
    private readonly submissionRepository: SubmissionRepository,
    private readonly i18nService: I18nService
  ) {}

  @Authorized(["ADMIN"])
  @Mutation(() => SectionMutationResponse)
  async createSection(
    @Arg("data") data: SectionInput
  ): Promise<SectionMutationResponse> {
    const section = await this.sectionRepository.create(data);

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
    @Arg("id") _id: ObjectId,
    @LoadResource(Section) section: DocumentType<Section>
  ): Promise<SectionMutationResponse> {
    for (const [key, value] of Object.entries(data)) {
      section[key as keyof SectionInput] = value;
    }

    await section.save();

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
    @Arg("id") _id: ObjectId,
    @LoadResource(Section) section: DocumentType<Section>
  ): Promise<SectionMutationResponse> {
    await this.sectionRepository.delete({ _id: section.id });

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

  @Authorized()
  @FieldResolver(() => Conference, { nullable: true })
  async conference(
    @Root() { conference }: Section
  ): Promise<Conference | null> {
    return this.conferenceRepository.findOne({ _id: conference });
  }

  @Authorized(["ADMIN"])
  @FieldResolver(() => SubmissionConnection)
  async submissions(
    @Args() { first, after }: SubmissionArgs,
    @Root() { id: sectionId, conference }: Section
  ): Promise<SubmissionConnection> {
    return await this.submissionRepository.paginatedSubmissions({
      first,
      after,
      filter: {
        sectionIds: [sectionId],
        conferenceId: conference?._id,
      },
      sort: [],
    });
  }
}
