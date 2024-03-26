import { index, prop as Property } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { Field, ID, ObjectType } from "type-graphql";
import { ObjectId } from "mongodb";

import { Ref } from "../util/types";
import { Conference } from "./Conference";
import { Section } from "./Section";
import { User } from "./User";

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

@index({ conference: 1, section: 1, authors: 1 })
@ObjectType({ description: "Submission entity model type" })
export class Submission extends TimeStamps {
  @Field(() => ID)
  id: ObjectId;

  @Field(() => SubmissionTranslation)
  @Property({ type: () => SubmissionTranslation, _id: false })
  translations: SubmissionTranslation;

  @Field({ nullable: true })
  @Property()
  file?: string;

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
