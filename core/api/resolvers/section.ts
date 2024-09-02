import { Service } from "typedi";
import { CRUDservice } from "../services/CRUDservice";
import { Arg, Authorized, Mutation, Resolver } from "type-graphql";
import { SectionInput, SectionMutationResponse } from "./types/conference";
import { Section, SectionTranslation } from "../entitites/Section";
import { I18nService } from "../services/i18nService";
import { LoadResource } from "../util/decorators";
import { ObjectId } from "mongodb";
import { DocumentType } from "@typegoose/typegoose";

@Service()
@Resolver(() => Section)
export class SectionResolver {
  constructor(
    private readonly sectionService = new CRUDservice(Section),
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
  @Mutation(() => String)
  async deleteSection(
    @Arg("id") _id: ObjectId,
    @LoadResource(Section) section: DocumentType<Section>
  ): Promise<string> {
    await this.sectionService.delete({ _id: section.id });

    return this.i18nService.translate("delete", {
      ns: "section",
      name: section.translations[
        this.i18nService.language() as keyof SectionTranslation
      ].name,
    });
  }
}
