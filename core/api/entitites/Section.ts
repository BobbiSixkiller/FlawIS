import { prop as Property } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { ObjectId } from "mongodb";
import { Field, ID, ObjectType } from "type-graphql";

import { Ref } from "../util/types";
import { Conference } from "./Conference";
import { LocalesType } from "../resolvers/types/translation";

@ObjectType()
export class SectionTranslations {
  @Field()
  @Property()
  name: string;

  @Field()
  @Property()
  topic: string;
}

@ObjectType()
export class SectionTranslation extends LocalesType(SectionTranslations) {}

@ObjectType({ description: "Conference's section entity model type" })
export class Section extends TimeStamps {
  @Field(() => ID)
  id: ObjectId;

  @Field(() => Conference, { nullable: true })
  @Property({ ref: () => Conference })
  conference?: Ref<Conference>;

  @Field(() => SectionTranslation)
  @Property({ type: () => SectionTranslation, _id: false })
  translations: SectionTranslation;

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
}
