import { UserInputError } from "apollo-server";
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
import { Section } from "../entitites/Section";
import { Submission } from "../entitites/Submission";
import { CRUDservice } from "../services/CRUDservice";
import { Context } from "../util/auth";
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
		@Arg("id", () => ObjectIdScalar) id: ObjectId
	): Promise<Section> {
		const section = await this.sectionService.findOne({ _id: id });
		if (!section) throw new UserInputError("Conference section not found!");

		return section;
	}

	@Authorized(["ADMIN"])
	@Mutation(() => Section)
	async createSection(
		@Arg("data") sectionInput: SectionInput,
		@Ctx() { locale }: Context
	): Promise<Section> {
		return await this.sectionService.create(
			localizeInput(sectionInput, sectionInput.translations, locale)
		);
	}

	@Authorized(["ADMIN"])
	@Mutation(() => Section)
	async updateSection(
		@Arg("id") id: ObjectId,
		@Arg("data") sectionInput: SectionInput,
		@Ctx() { locale }: Context
	) {
		const section = await this.sectionService.findOne({ _id: id });
		if (!section) throw new UserInputError("Conference section not found!");

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
		const { deletedCount } = await this.sectionService.delete({ _id: id });

		return deletedCount > 0;
	}

	@Authorized(["ADMIN"])
	@FieldResolver(() => [Submission])
	async submissions(@Root() { id }: Section): Promise<Submission[]> {
		return await this.submissionService.findAll({ section: id });
	}
}
