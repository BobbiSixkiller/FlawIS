import { ObjectId } from "mongodb";
import { pre, prop as Property } from "@typegoose/typegoose";
import { Directive, Field, ID, ObjectType } from "type-graphql";
import { Billing } from "./Billing";

@Directive("@extends")
@Directive(`@key(fields: "id")`)
@ObjectType({
  description:
    "User reference type from users microservice with contributed billings field",
})
@pre<User>("save", function () {
  if (this.email.split("@")[1].includes("uniba")) {
    this.organisation = "Univerzita Komenského v Bratislave, Právnická fakulta";
  }
})
export class User {
  @Directive("@external")
  @Field(() => ObjectId)
  id: ObjectId;

  @Field()
  @Property()
  email: string;

  @Field()
  @Property()
  name: string;

  @Field(() => [Billing], { nullable: "items" })
  @Property({ type: () => [Billing], _id: false })
  billings: Billing[];

  @Field()
  @Property({ default: "N/A" })
  telephone: string;

  @Field()
  @Property({ default: "N/A" })
  organisation: string;
}
