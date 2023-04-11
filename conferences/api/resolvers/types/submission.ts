import {
	ArrayMinSize,
	IsEmail,
	IsLocale,
	IsUrl,
	MaxLength,
} from "class-validator";
import { ObjectId } from "mongodb";
import { Field, InputType } from "type-graphql";

@InputType()
class SubmissionInputTranslation {
	@Field()
	@IsLocale()
	language: string;

	@Field()
	@MaxLength(250, { message: "Submission name can have max 250 characters!" })
	name: string;

	@Field()
	@MaxLength(1000, { message: "Submission name can have max 1000 characters!" })
	abstract: string;

	@Field(() => [String])
	@ArrayMinSize(1, { message: "You must include at least one keyword!" })
	@MaxLength(250, {
		message: "Keyword can have max 250 characters!",
		each: true,
	})
	keywords: string[];
}

@InputType()
export class SubmissionInput {
	@Field()
	@MaxLength(250, { message: "Submission name can have max 250 characters!" })
	name: string;

	@Field()
	@MaxLength(1000, { message: "Submission name can have max 1000 characters!" })
	abstract: string;

	@Field(() => [String])
	@ArrayMinSize(1, { message: "You must include at least one keyword!" })
	@MaxLength(250, {
		message: "Keyword can have max 250 characters!",
		each: true,
	})
	keywords: string[];

	@Field()
	conferenceId: ObjectId;

	@Field()
	sectionId: ObjectId;

	@Field({ nullable: true })
	@IsUrl()
	submissionUrl?: string;

	@Field(() => [String], { nullable: true })
	@IsEmail({}, { each: true })
	authors?: string[];

	@Field(() => [SubmissionInputTranslation])
	@ArrayMinSize(1, { message: "You must include a translation!" })
	translations: SubmissionInputTranslation[];
}
