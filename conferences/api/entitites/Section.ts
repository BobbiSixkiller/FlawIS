import { prop as Property } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { ObjectId } from "mongodb";
import { Authorized, Field, ID, ObjectType } from "type-graphql";

import { Ref } from "../util/types";
import { Conference } from "./Conference";
import { Submission } from "./Submission";

@ObjectType({ isAbstract: true })
class Translation {
  @Field()
  @Property()
  language: string;
}

@ObjectType()
class SectionTranslation extends Translation {
  @Field()
  @Property()
  name: string;

  @Field()
  @Property()
  description: string;
}

@ObjectType({ description: "Conference's section entity model type" })
export class Section extends TimeStamps {
  @Field(() => ID)
  id: ObjectId;

  @Field(() => String)
  @Property({ ref: () => Conference })
  conference: Ref<Conference>;

  @Field()
  @Property()
  name: string;

  @Field()
  @Property()
  description: string;

  @Field(() => [SectionTranslation])
  @Property({ type: () => SectionTranslation, _id: false })
  translations: SectionTranslation[];

  @Field(() => [String])
  @Property({ type: () => String })
  languages: string[];

  @Authorized(["ADMIN"])
  @Field(() => [Submission])
  submissions: Submission[];

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
}
