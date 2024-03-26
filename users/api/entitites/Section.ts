import { prop as Property } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { ObjectId } from "mongodb";
import { Field, ID, ObjectType } from "type-graphql";

import { Ref } from "../util/types";
import { Conference } from "./Conference";
import { Submission } from "./Submission";

@ObjectType()
export class SectionTranslationContent {
  @Field()
  @Property()
  name: string;
}

@ObjectType()
export class SectionTranslation {
  @Field(() => SectionTranslationContent)
  @Property({ _id: false })
  sk: SectionTranslationContent;

  @Field(() => SectionTranslationContent)
  @Property({ _id: false })
  en: SectionTranslationContent;
}

@ObjectType({ description: "Conference's section entity model type" })
export class Section extends TimeStamps {
  @Field(() => ID)
  id: ObjectId;

  @Field(() => String)
  @Property({ ref: () => Conference })
  conference: Ref<Conference>;

  @Field(() => SectionTranslation)
  @Property({ type: () => SectionTranslation, _id: false })
  translations: SectionTranslation;

  @Field(() => [String])
  @Property({ type: () => String })
  languages: string[];

  @Field(() => [Submission])
  submissions: Submission[];

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
}
