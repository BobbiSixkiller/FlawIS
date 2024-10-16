import { Service } from "typedi";
import { CRUDservice } from "../services/CRUDservice";
import {
  Arg,
  Args,
  Authorized,
  FieldResolver,
  Mutation,
  Resolver,
  Root,
} from "type-graphql";
import { SectionInput, SectionMutationResponse } from "./types/conference";
import { Section, SectionTranslation } from "../entitites/Section";
import { I18nService } from "../services/i18nService";
import { LoadResource } from "../util/decorators";
import { ObjectId } from "mongodb";
import { DocumentType } from "@typegoose/typegoose";
import { SubmissionArgs, SubmissionConnection } from "./types/submission";
import { Submission } from "../entitites/Submission";
import { transformIds } from "../middlewares/typegoose-middleware";
import { Conference } from "../entitites/Conference";

@Service()
@Resolver(() => Section)
export class SectionResolver {
  constructor(
    private readonly conferenceService = new CRUDservice(Conference),
    private readonly sectionService = new CRUDservice(Section),
    private readonly submissionService = new CRUDservice(Submission),
    private readonly i18nService: I18nService
  ) {}

  @Authorized(["ADMIN"])
  @Mutation(() => SectionMutationResponse)
  async createSection(
    @Arg("data") data: SectionInput
  ): Promise<SectionMutationResponse> {
    const section = await this.sectionService.create(data);

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
    await this.sectionService.delete({ _id: section.id });

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
    return this.conferenceService.findOne({ _id: conference });
  }

  @Authorized(["ADMIN"])
  @FieldResolver(() => SubmissionConnection)
  async submissions(
    @Args() { first, after }: SubmissionArgs,
    @Root() { id, conference }: Section
  ): Promise<SubmissionConnection> {
    const res = await this.submissionService.dataModel.paginatedSubmissions({
      first,
      after,
      sectionIds: [id],
      conferenceId: conference as ObjectId,
    });

    const connection: SubmissionConnection = res[0];

    return {
      totalCount: connection.totalCount || 0,
      edges:
        connection.edges.map((e) => ({
          cursor: e.cursor,
          node: transformIds(e.node),
        })) || [],
      pageInfo: connection.pageInfo || { hasNextPage: false },
    };
  }
}
