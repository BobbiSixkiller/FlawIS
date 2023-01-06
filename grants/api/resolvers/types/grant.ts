import { Field, ArgsType, InputType, ObjectType } from "type-graphql";
import { IsInt, IsDate, IsString } from "class-validator";
import { ObjectId } from "mongodb";

import { NameExists, RefDocExists } from "../../util/validation";
import {
	Announcement,
	Budget,
	Grant,
	GrantType,
	Member,
} from "../../entitites/Grant";
import { CreateConnection, CreatePaginationArgs } from "./pagination";
import { User } from "../../entitites/User";

@InputType()
export class GrantInput implements Partial<Grant> {
	@Field()
	@NameExists(Grant, { message: "Grant with provided name already exists!" })
	name: string;

	@Field(() => GrantType)
	type: GrantType;

	@Field()
	@IsDate()
	start: Date;

	@Field()
	@IsDate()
	end: Date;
}

@InputType()
export class MemberInput implements Partial<Member> {
	@Field()
	@RefDocExists(User)
	member: ObjectId;

	@Field()
	@IsInt()
	hours: number;
}

export class AnnouncementInput implements Partial<Announcement> {
	@Field()
	@IsString()
	name: string;

	@Field()
	@IsString()
	text: string;

	@Field(() => [String], { nullable: true })
	@IsString({ each: true })
	files: string[];
}

@InputType()
export class BudgetInput
	implements Omit<Budget, "id" | "members" | "createdAt" | "updatedAt">
{
	@Field()
	@IsDate()
	year: Date;

	@Field(() => [MemberInput], { nullable: true })
	members: MemberInput[];

	@Field()
	@IsInt()
	travel: number;

	@Field()
	@IsInt()
	material: number;

	@Field()
	@IsInt()
	services: number;

	@Field()
	@IsInt()
	indirect: number;

	@Field()
	@IsInt()
	salaries: number;
}

@ArgsType()
export class GrantArgs extends CreatePaginationArgs(Grant) {}

@ObjectType({
	description: "GrantConnection type enabling cursor based pagination",
})
export class GrantConnection extends CreateConnection(Grant) {}
