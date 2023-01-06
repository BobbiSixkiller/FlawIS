import { Arg, Args, Authorized, Mutation, Query, Resolver } from "type-graphql";
import { ObjectId } from "mongodb";
import { Service } from "typedi";
import { CRUDservice } from "../services/CRUDservice";

import { User } from "../entitites/User";
import { Announcement, Grant } from "../entitites/Grant";

import env from "dotenv";
import {
	AnnouncementInput,
	GrantArgs,
	GrantConnection,
	GrantInput,
} from "./types/grant";
import { LoadGrant } from "../util/decorators";
import { DocumentType } from "@typegoose/typegoose/lib/types";

env.config();

@Service()
@Resolver(() => Grant)
export class GrantResolver {
	constructor(
		private readonly grantService = new CRUDservice(Grant),
		private readonly userService = new CRUDservice(User)
	) {}

	@Authorized()
	@Query(() => GrantConnection)
	async grants(@Args() { after, first }: GrantArgs): Promise<GrantConnection> {
		const grants = await this.grantService.aggregate([
			{
				$facet: {
					$data: [
						{
							$match: {
								$expr: {
									$cond: [
										{ $eq: [after, null] },
										{ $ne: ["$_id", null] },
										{ $lt: ["_id", after] },
									],
								},
							},
						},
						{ $limit: first || 20 },
						{ $sort: { _id: -1 } },
						{ $addFields: { id: "$_id" } },
					],
					$hasNextDoc: [
						{
							$match: {
								$expr: {
									$cond: [
										{ $eq: [after, null] },
										{ $ne: ["$_id", null] },
										{ $lt: ["_id", after] },
									],
								},
							},
						},
						{ $skip: first || 20 },
						{ $limit: 1 },
					],
				},
			},
			{
				$project: {
					edges: {
						$map: {
							input: "$data",
							as: "doc",
							in: { $project: { cursor: "$$doc._id", node: "$$doc" } },
						},
					},
					pageInfo: {
						endCursor: { $last: "$data._id" },
						hasNextPage: { $ne: [{ $first: "$hasNextDoc" }, null] },
					},
				},
			},
		]);

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

	// @Authorized()
	// @Mutation(() => Grant)
	// async addAnnouncement(
	// 	@Arg("data") input: AnnouncementInput,
	// 	@LoadGrant() grant: DocumentType<Grant>
	// ) {
	// 	grant.announcements.push(input as Announcement);

	// 	return await grant.save();
	// }

	// async updateAnnouncement();

	@Authorized()
	@Mutation(() => Boolean)
	async deleteGrant(@Arg("id") id: ObjectId): Promise<boolean> {
		const { deletedCount } = await this.grantService.delete({ _id: id });
		return deletedCount > 0;
	}
}
