import { ObjectId } from "mongodb";
import { prop as Property } from "@typegoose/typegoose";
import { Directive, Field, ID, Int, ObjectType } from "type-graphql";
import { Grant } from "./Grant";

@ObjectType()
export class GrantInfo {
  @Field(() => Int)
  hours: number;

  @Field(() => [Date], { nullable: "items" })
  availableYears: Date[];

  @Field(() => [Grant], { nullable: "items" })
  grants: Grant[];
}

@ObjectType()
@Directive("@extends")
@Directive(`@key(fields: "id")`)
export class User {
  @Directive("@external")
  @Field(() => ID)
  id: ObjectId;

  @Property()
  email: string;

  @Field(() => GrantInfo)
  grants: GrantInfo;
}
