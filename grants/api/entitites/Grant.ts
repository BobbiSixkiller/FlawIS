import { prop as Property } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { ObjectId } from "mongodb";
import { Field, ID, ObjectType, registerEnumType } from "type-graphql";
import { Ref } from "../util/types";
import { User } from "./User";

export enum GrantType {
	APVV = "APVV",
	VEGA = "VEGA",
	KEGA = "KEGA",
}

registerEnumType(GrantType, {
	name: "GrantType", // this one is mandatory
	description: "Type of grants inside the FLAWIS system", // this one is optional
});

@ObjectType({ description: "Member schema type" })
export class Member extends TimeStamps {
	@Field(() => User)
	@Property({ ref: () => User })
	user: Ref<User>;

	@Field()
	@Property()
	hours: Number;

	@Field()
	createdAt: Date;
	@Field()
	updatedAt: Date;
}

@ObjectType({ description: "Budget schema type" })
export class Budget extends TimeStamps {
	@Field()
	@Property()
	year: Date;

	@Field()
	@Property()
	travel: Number;

	@Field()
	@Property()
	material: Number;

	@Field()
	@Property()
	services: Number;

	@Field()
	@Property()
	indirect: Number;

	@Field()
	@Property()
	salaries: Number;

	@Field(() => [Member], { nullable: "items" })
	@Property({ type: () => Member, _id: false, default: [] })
	members: Member[];

	@Field()
	createdAt: Date;
	@Field()
	updatedAt: Date;
}

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
	@Property()
	files: string[];

	@Field()
	createdAt: Date;
	@Field()
	updatedAt: Date;
}

@ObjectType({ description: "Grant model type" })
export class Grant extends TimeStamps {
	@Field(() => ID)
	id: ObjectId;

	@Field()
	@Property()
	name: string;

	@Field(() => GrantType)
	@Property({ enum: GrantType })
	type: GrantType;

	@Field()
	@Property()
	start: Date;

	@Field()
	@Property()
	end: Date;

	@Field(() => [Announcement], { nullable: true })
	@Property({ type: () => [Announcement] })
	announcements: Announcement[];

	@Field(() => [Budget], { nullable: "items" })
	@Property({ type: () => [Budget], _id: false, default: [] })
	budget: Budget[];

	@Field()
	createdAt: Date;
	@Field()
	updatedAt: Date;
}
