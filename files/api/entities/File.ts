import { Directive, Field, ObjectType } from "type-graphql";
import { ObjectId } from "mongodb";
import { prop as Property } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { FileType } from "../resolvers.ts/types/file";
import { Ref } from "@typegoose/typegoose/lib/types";

@Directive("@extends")
@Directive(`@key(fields: "id")`)
@ObjectType()
export default class User {
  @Directive("@external")
  @Field(() => ObjectId)
  id: ObjectId;

  @Directive("@external")
  @Field()
  email: string;

  @Directive("@external")
  @Field()
  organisation: string;

  @Directive("@external")
  @Field()
  name: string;
}

export class File extends TimeStamps {
  @Field(() => ObjectId)
  id: ObjectId;

  @Field()
  @Property()
  name: string;

  @Field()
  @Property()
  url: string;

  @Field(() => User)
  @Property({ ref: () => User })
  user: Ref<User>;

  @Field(() => FileType)
  @Property()
  type: FileType;

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
}
