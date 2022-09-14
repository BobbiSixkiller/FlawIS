import { ObjectId } from "mongodb";
import { prop as Property } from "@typegoose/typegoose";
import { Directive, Field, ID, ObjectType } from "type-graphql";
import { Billing } from "./Billing";

@Directive("@extends")
@Directive(`@key(fields: "id")`)
@ObjectType({
  description:
    "User reference type from users microservice with contributed billings field",
})
export class User {
  @Directive("@external")
  @Field(() => ID)
  id: ObjectId;

  @Field()
  @Property()
  email: string;

  @Field(() => [Billing])
  @Property({ type: () => [Billing], default: [], _id: false })
  billings: Billing[];
}
