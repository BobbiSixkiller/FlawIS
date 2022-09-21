import { ObjectId } from "mongodb";
import { prop as Property } from "@typegoose/typegoose";
import { Directive, Field, ID, ObjectType } from "type-graphql";
import { GrantConnection } from "./Grant";

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

  @Property()
  email: string;

  //aggregate all my hours in a given year
  @Field()
  hours: number;
  //aggregate and return all grants that the user has been assigned to
  @Field(() => GrantConnection)
  grants: GrantConnection;
}
