import { ArrayMinSize, IsEmail, IsString } from "class-validator";
import { ObjectId } from "mongodb";
import {
  ArgsType,
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from "type-graphql";
import { LocalesInput } from "./translation.types";
import Container from "typedi";
import { I18nService } from "../../services/i18n.service";
import { IMutationResponse } from "./interface.types";
import { PresentationLng, Submission } from "../../entitites/Submission";
import { CreateArgs, CreateConnection } from "./pagination.types";

@ObjectType({ implements: IMutationResponse })
export class SubmissionMutationResponse extends IMutationResponse {
  @Field(() => Submission)
  data: Submission;
}

@ObjectType()
export class SubmissionConnection extends CreateConnection(Submission) {}

@InputType()
export class SubmissionFilterInput {
  @Field({ nullable: true })
  conferenceId?: ObjectId;

  @Field(() => [ObjectId], { nullable: true })
  sectionIds?: ObjectId[];
}

export enum SubmissionSortableField {
  ID = "_id",
}

registerEnumType(SubmissionSortableField, {
  name: "SubmissionSortableField",
  description: "Sortable enum definition for submissions query",
});

@ArgsType()
export class SubmissionArgs extends CreateArgs(
  Submission,
  SubmissionSortableField
) {
  @Field(() => SubmissionFilterInput, { nullable: true })
  filter?: SubmissionFilterInput;
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
  fileUrl: string;

  @Field(() => [String], { nullable: "items" })
  @IsEmail({}, { each: true })
  authors: string[];

  @Field(() => PresentationLng)
  presentationLng: PresentationLng;

  @Field(() => SubmissionTranslationInput)
  translations: SubmissionTranslationInput;
}
