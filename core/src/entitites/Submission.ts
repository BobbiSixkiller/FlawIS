import { Index, prop as Property } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { Field, ObjectType, registerEnumType } from "type-graphql";
import { ObjectId } from "mongodb";

import { Conference } from "./Conference";
import { Section } from "./Section";
import { User } from "./User";
import { Ref } from "@typegoose/typegoose/lib/types";

export enum PresentationLng {
  SK = "SK",
  EN = "EN",
  CZ = "CZ",
}

registerEnumType(PresentationLng, {
  name: "PresentationLng",
  description: "Language the speaker will be presenting his submission in",
});

@ObjectType()
export class SubmissionTranslationContent {
  @Field()
  @Property()
  name: string;

  @Field()
  @Property()
  abstract: string;

  @Field(() => [String])
  @Property({ type: () => String })
  keywords: string[];
}

@ObjectType()
export class SubmissionTranslation {
  @Field(() => SubmissionTranslationContent)
  @Property({ _id: false })
  sk: SubmissionTranslationContent;

  @Field(() => SubmissionTranslationContent)
  @Property({ _id: false })
  en: SubmissionTranslationContent;
}

@Index({ conference: 1, section: 1, authors: 1 })
@ObjectType({ description: "Submission entity model type" })
export class Submission extends TimeStamps {
  @Field(() => ObjectId)
  id: ObjectId;

  @Field(() => SubmissionTranslation)
  @Property({ type: () => SubmissionTranslation, _id: false })
  translations: SubmissionTranslation;

  @Field(() => PresentationLng, { nullable: true })
  @Property({ enum: PresentationLng })
  presentationLng?: PresentationLng;

  @Field({ nullable: true })
  @Property()
  fileUrl?: string;

  @Field(() => [User])
  @Property({ ref: () => User })
  authors: Ref<User>[];

  @Field(() => Conference)
  @Property({ ref: () => Conference })
  conference: Ref<Conference>;

  @Field(() => Section)
  @Property({ ref: () => Section })
  section: Ref<Section>;

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
}
