import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { prop as Property, Ref, ReturnModelType } from "@typegoose/typegoose";
import { ObjectId } from "mongodb";
import { Field, ID, ObjectType } from "type-graphql";
import { User } from "./User";

@ObjectType()
export class Announcement extends TimeStamps {
	@Field(() => ID)
	id: ObjectId;

	@Field()
	@Property()
	name: string;

	@Field()
	@Property()
	text: string;

	@Field(() => [String], { nullable: true })
	@Property({ type: () => [String] })
	files: string[];

	@Property({ ref: () => User })
	user: Ref<User>;

	@Field()
	createdAt: Date;
	@Field()
	updatedAt: Date;

	public static async paginatedAnnouncements(
		this: ReturnModelType<typeof Announcement>,
		first: number,
		after?: ObjectId
	) {
		return await this.aggregate([
			{ $sort: { _id: -1 } },
			{
				$facet: {
					data: [
						{
							$match: {
								$expr: {
									$cond: [
										{ $eq: [after, null] },
										{ $ne: ["$_id", null] },
										{ $lt: ["$_id", after] },
									],
								},
							},
						},
						{ $limit: first || 20 },
						{ $addFields: { id: "$_id" } },
					],
					hasNextDoc: [
						{
							$match: {
								$expr: {
									$cond: [
										{ $eq: [after, null] },
										{ $ne: ["$_id", null] },
										{ $lt: ["$_id", after] },
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
							in: { cursor: "$$doc._id", node: "$$doc" },
						},
					},
					pageInfo: {
						endCursor: { $last: "$data._id" },
						hasNextPage: { $eq: [{ $size: "$hasNextDoc" }, 1] },
					},
				},
			},
		]);
	}
}
