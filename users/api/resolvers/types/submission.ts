import { ArrayMinSize, IsEmail, IsString } from "class-validator";
import { ObjectId } from "mongodb";
import { Field, InputType, ObjectType } from "type-graphql";
import { LocalesInput } from "./translation";
import Container from "typedi";
import { I18nService } from "../../services/i18nService";
import { IMutationResponse } from "./interface";
import { Submission } from "../../entitites/Submission";

@ObjectType({ implements: IMutationResponse })
export class SubmissionMutationResponse extends IMutationResponse {
  @Field(() => Submission)
  data: Submission;
}

@InputType()
export class LocalizedSubmissionInputs {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  abstract: string;

  @Field(() => [String])
  @ArrayMinSize(1, {
    message: () =>
      Container.get(I18nService).translate("keywords", {
        ns: "validation",
      }),
  })
  @IsString({ each: true })
  keywords: string[];
}

@InputType()
export class SubmissionTranslationInput extends LocalesInput(
  LocalizedSubmissionInputs
) {}

@InputType()
export class SubmissionInput {
  @Field()
  conference: ObjectId;

  @Field()
  section: ObjectId;

  @Field({ nullable: true })
  @IsString()
  fileUrl?: string;

  @Field(() => [String], { nullable: "items" })
  @IsEmail({}, { each: true })
  authors: string[];

  @Field(() => SubmissionTranslationInput)
  translations: SubmissionTranslationInput;
}
