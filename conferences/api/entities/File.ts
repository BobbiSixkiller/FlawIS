import { prop as Property } from "@typegoose/typegoose";
import { Directive, Field, ObjectType } from "type-graphql";
import { ObjectId } from "mongodb";

@Directive("@extends")
@Directive(`@key(fields: "id")`)
@ObjectType()
export default class File {
  @Directive("@external")
  @Property()
  @Field(() => ObjectId)
  id: ObjectId;

  @Property()
  @Field(() => String)
  path: string;
}
