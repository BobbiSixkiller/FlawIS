import {
	ArgumentValidationError,
	Directive,
	Field,
	ID,
	ObjectType,
	registerEnumType,
} from "type-graphql";
import { ObjectId } from "mongodb";
import {
	getModelForClass,
	Index,
	pre,
	prop as Property,
} from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { hash } from "bcrypt";
import { signJwt } from "../util/auth";
import CreateConnection from "../resolvers/types/pagination";
import { ModelType } from "@typegoose/typegoose/lib/types";

export enum Role {
	Basic = "BASIC",
	Admin = "ADMIN",
}

registerEnumType(Role, {
	name: "Role", // this one is mandatory
	description: "User role inside the FLAWIS system", // this one is optional
});

@pre<User>("save", async function () {
	if (this.isNew || this.isModified("password")) {
		this.password = await hash(this.password, 12);
	}
	if (this.isNew || this.isModified("email")) {
		const emailExists = await getModelForClass(User)
			.findOne({ email: this.email })
			.exec();
		if (emailExists && emailExists.id !== this.id) {
			throw new ArgumentValidationError([
				{
					target: User, // Object that was validated.
					property: "email", // Object's property that haven't pass validation.
					value: this.email, // Value that haven't pass a validation.
					constraints: {
						// Constraints that failed validation with error messages.
						EmailExists: "Submitted email address is already in use!",
					},
					//children?: ValidationError[], // Contains all nested validation errors of the property
				},
			]);
		}
	}
})
@Index({ name: "text" })
@Directive('@key(fields: "id")')
@ObjectType({ description: "The user model entity" })
export class User extends TimeStamps {
	@Field(() => ID)
	id: ObjectId;

	@Field()
	@Property({ unique: true })
	email: string;

	@Property()
	password: string;

	@Field()
	@Property()
	name: string;

	@Field(() => Role)
	@Property({ default: "BASIC", enum: ["BASIC", "ADMIN"] })
	role: Role;

	@Field()
	@Property({ default: false })
	verified: boolean;

	@Field()
	createdAt: Date;
	@Field()
	updatedAt: Date;

	get token(): string {
		return (
			"Bearer " +
			signJwt(
				{
					id: this.id,
					email: this.email,
					name: this.name,
					role: this.role,
				},
				{ expiresIn: "7d" }
			)
		);
	}

	public static async paginatedUsers(
		this: ModelType<User>,
		first: number,
		after?: ObjectId
	) {
		return await this.aggregate([
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
						{ $sort: { _id: -1 } },
						{ $limit: first || 20 },
						{
							$addFields: {
								id: "$_id", //transform _id to id property as defined in GraphQL object types
							},
						},
					],
					hasNextPage: [
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
						{ $sort: { _id: -1 } },
						{ $skip: first || 20 }, // skip paginated data
						{ $limit: 1 }, // just to check if there's any element
						{ $count: "totalNext" },
					],
				},
			},
			{
				$unwind: { path: "$hasNextPage", preserveNullAndEmptyArrays: true },
			},
			{
				$project: {
					edges: {
						$map: {
							input: "$data",
							as: "edge",
							in: { cursor: "$$edge._id", node: "$$edge" },
						},
					},
					pageInfo: {
						hasNextPage: { $gt: ["$hasNextPage.totalNext", 0] },
						endCursor: { $last: "$data.id" },
					},
				},
			},
		]);
	}
}
