import { DocumentType } from "@typegoose/typegoose";
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
import { LoadResource } from "../util/decorators";
import { localizeInput } from "../util/locale";
import { ObjectIdScalar } from "../util/scalars";
import { SectionInput } from "./types/section";

@Service()
@Resolver(() => Section)
export class SectionResolver {
  constructor(
    private readonly sectionService = new CRUDservice(Section),
    private readonly submissionService = new CRUDservice(Submission)
  ) {}

  @Authorized(["ADMIN"])
  @Query(() => Section)
  async section(
    @Arg("id", () => ObjectIdScalar) _id: ObjectId,
    @LoadResource(Section) section: DocumentType<Section>
  ) {
    return section;
  }

  @Authorized(["ADMIN"])
  @Mutation(() => Section)
  async createSection(
    @Arg("id") _id: ObjectId,
    @Arg("data") sectionInput: SectionInput,
    @LoadResource(Conference) conference: DocumentType<Conference>,
    @Ctx() { locale }: Context
  ) {
    const section = await this.sectionService.create(
      localizeInput(sectionInput, sectionInput.translations, locale)
    );

    conference.sections.push(section.id);
    await conference.save();

    return section;
  }

  @Authorized(["ADMIN"])
  @Mutation(() => Section)
  async updateSection(
    @Arg("id") _id: ObjectId,
    @Arg("data") sectionInput: SectionInput,
    @LoadResource(Section) section: DocumentType<Section>,
    @Ctx() { locale }: Context
  ) {
    for (const [key, value] of Object.entries(
      localizeInput(sectionInput, sectionInput.translations, locale)
    )) {
      section[key as keyof Section] = value;
    }

    return await section.save();
  }

  @Authorized(["ADMIN"])
  @Mutation(() => Boolean)
  async deleteSection(
    @Arg("id", () => ObjectIdScalar) id: ObjectId
  ): Promise<boolean> {
    const { deletedCount } = await this.sectionService.deleteOne({ _id: id });

    return deletedCount > 0;
  }

  // @Authorized(["ADMIN"])
  @FieldResolver(() => [Submission])
  async submissions(@Root() { id }: Section): Promise<Submission[]> {
    return await this.submissionService.findAll({ section: id });
  }
}
