import {
	Arg,
	Authorized,
	Ctx,
	FieldResolver,
	Int,
	Resolver,
} from "type-graphql";
import { Service } from "typedi";
import { CRUDservice } from "../services/CRUDservice";

import { User } from "../entitites/User";
import { Grant } from "../entitites/Grant";

import { Context } from "../util/auth";

import env from "dotenv";
import { GrantConnection } from "./types/grant";

env.config();

@Service()
@Resolver(() => User)
export class UserResolver {
	constructor(private readonly grantService = new CRUDservice(Grant)) {}

	@Authorized()
	@FieldResolver(() => Int)
	async hours(
		@Arg("year") year: Date,
		@Ctx() { user }: Context
	): Promise<number> {
		//return count of numbers spent as a grant member based on selected year
		const countHours = await this.grantService.aggregate([]);
		return 0;
	}

	@Authorized()
	@FieldResolver(() => Int, { nullable: true })
	async grants(
		@Arg("year") year: Date,
		@Ctx() { user }: Context
	): Promise<GrantConnection | null> {
		//return count of numbers spent as a grant member based on selected year
		const grants = await this.grantService.aggregate([]);
		return null;
	}
}
