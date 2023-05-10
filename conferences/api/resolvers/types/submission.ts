import { ArrayMinSize, IsEmail, IsLocale, IsString } from "class-validator";
import { ObjectId } from "mongodb";
import { Field, InputType } from "type-graphql";

@InputType()
class SubmissionInputTranslation {
  @Field()
  @IsLocale()
  language: string;

  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  abstract: string;

  @Field(() => [String])
  @ArrayMinSize(1, { message: "You must include at least one keyword!" })
  @IsString({ each: true })
  keywords: string[];
}

@InputType()
export class SubmissionInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  abstract: string;

  @Field(() => [String])
  @ArrayMinSize(1, { message: "You must include at least one keyword!" })
  @IsString({ each: true })
  keywords: string[];

  @Field()
  conferenceId: ObjectId;

  @Field()
  sectionId: ObjectId;

  @Field({ nullable: true })
  @IsString()
  submissionUrl?: string;

  @Field(() => [String], { nullable: "items" })
  @IsEmail({}, { each: true })
  authors: string[];

  @Field(() => [SubmissionInputTranslation])
  @ArrayMinSize(1, { message: "You must include a translation!" })
  translations: SubmissionInputTranslation[];
}
