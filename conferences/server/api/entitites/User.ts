import { ObjectId } from "mongoose";
import { prop as Property } from "@typegoose/typegoose";
import { Directive, Field, ID, ObjectType } from "type-graphql";
import { Billing } from "./Conference";

@Directive("@extends")
@Directive(`@key(fields: "id")`)
@ObjectType({ description: "User reference type from users microservice" })
export class User {
  @Directive("@external")
  @Field(() => ID)
  @Property()
  id: ObjectId;

  @Field()
  @Property()
  email: string;

  @Field(() => [Billing], { nullable: true })
  @Property({ type: () => [Billing], default: [], _id: false })
  billings?: Billing[];
}
