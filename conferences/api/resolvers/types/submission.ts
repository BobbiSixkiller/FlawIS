import { ArrayMinSize, IsEmail, IsLocale, IsString } from "class-validator";
import { ObjectId } from "mongodb";
import { Authorized, Field, InputType } from "type-graphql";

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

  @Authorized(["ADMIN"])
  @Field({
    nullable: true,
    description: "field for admin to create a submission for a given user",
  })
  userId?: ObjectId;

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
