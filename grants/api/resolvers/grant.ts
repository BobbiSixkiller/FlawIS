import {
	Arg,
	Args,
	ArgumentValidationError,
	Authorized,
	FieldResolver,
	Mutation,
	Query,
	Resolver,
	Root,
} from "type-graphql";
import { ObjectId } from "mongodb";
import { DocumentType } from "@typegoose/typegoose/lib/types";
import { Service } from "typedi";
import { CRUDservice } from "../services/CRUDservice";

import { Budget, Grant, Member } from "../entitites/Grant";
import { Announcement } from "../entitites/Announcement";

import env from "dotenv";
import {
	BudgetInput,
	GrantArgs,
	GrantConnection,
	GrantInput,
	MemberInput,
} from "./types/grant";
import { LoadGrant } from "../util/decorators";

env.config();

@Service()
@Resolver(() => Grant)
export class GrantResolver {
	constructor(
		private readonly grantService = new CRUDservice(Grant),
		private readonly announcementService = new CRUDservice(Announcement)
	) {}

	@Authorized()
	@Query(() => GrantConnection)
	async grants(@Args() { after, first }: GrantArgs): Promise<GrantConnection> {
		const grants = await this.grantService.dataModel.paginatedGrants(
			first,
			after
		);

		return grants[0] as GrantConnection;
	}

	@Authorized()
	@Query(() => Grant)
	async grant(
		@Arg("id") _id: ObjectId,
		@LoadGrant() grant: DocumentType<Grant>
	) {
		return grant;
	}

	@Authorized()
	@Query(() => [Grant])
	async grantTextSearch(@Arg("text") text: string) {
		return await this.grantService.findAll({ $text: { $search: text } });
	}

	@Authorized()
	@Mutation(() => Grant)
	async createGrant(@Arg("data") grantInput: GrantInput): Promise<Grant> {
		return await this.grantService.create(grantInput);
	}

	@Authorized()
	@Mutation(() => Grant)
	async updategrant(
		@Arg("data") grantInput: GrantInput,
		@Arg("id") _id: ObjectId,
		@LoadGrant() grant: DocumentType<Grant>
	): Promise<Grant> {
		for (const [key, value] of Object.entries(grantInput)) {
			grant[key as keyof GrantInput] = value;
		}

		return await grant.save();
	}

	@Authorized()
	@Mutation(() => Boolean)
	async deleteGrant(@Arg("id") id: ObjectId): Promise<boolean> {
		const { deletedCount } = await this.grantService.delete({ _id: id });
		return deletedCount > 0;
	}

	@Authorized()
	@Mutation(() => Grant)
	async addBudget(
		@Arg("id") _id: ObjectId,
		@Arg("data") data: BudgetInput,
		@LoadGrant() grant: DocumentType<Grant>
	) {
		if (
			grant.budgets.some(
				(b) => b.year.getFullYear() === data.year.getFullYear()
			)
		) {
			throw new ArgumentValidationError([
				{
					target: Grant, // Object that was validated.
					property: "year", // Object's property that haven't pass validation.
					value: data.year, // Value that haven't pass a validation.
					constraints: {
						// Constraints that failed validation with error messages.
						EmailExists: "Budget is already set for submitted year!",
					},
					//children?: ValidationError[], // Contains all nested validation errors of the property
				},
			]);
		}

		grant.budgets.push(data as unknown as Budget);

		return await grant.save();
	}

	@Authorized()
	@Mutation(() => Grant)
	async addMember(
		@Arg("id") _id: ObjectId,
		@Arg("year") year: Date,
		@Arg("data") data: MemberInput,
		@LoadGrant() grant: DocumentType<Grant>
	) {
		const budget = grant.budgets.find(
			(b) => b.year.getFullYear() === year.getFullYear()
		);
		if (!budget) {
			throw new Error("Budget for submitted year not found!");
		}

		if (budget.members.some((m) => m.user === data.user)) {
			throw new Error("User already assigned!");
		}

		budget.members.push(data as unknown as Member);

		return await grant.save();
	}

	@FieldResolver(() => [Announcement])
	async announcements(@Root() { announcements }: Grant) {
		return await this.announcementService.findAll({ _id: announcements });
	}
}
