import { IsString } from "class-validator";
import { ArgsType, Field, InputType, ObjectType } from "type-graphql";
import { ObjectId } from "mongodb";
import { Announcement } from "../../entitites/Announcement";
import { GrantType } from "../../entitites/Grant";
import { CreateConnection, CreatePaginationArgs } from "./pagination";

@ObjectType()
export class AnnouncementConnection extends CreateConnection(Announcement) {}

@ArgsType()
export class AnnouncementArgs extends CreatePaginationArgs(Announcement) {}

@InputType()
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

	@Field(() => GrantType, { nullable: true })
	grantType?: GrantType;

	@Field(() => ObjectId, { nullable: true })
	grantId?: ObjectId;
}
