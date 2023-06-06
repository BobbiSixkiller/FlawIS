import { ObjectId } from "mongodb";
import { index, pre, prop as Property } from "@typegoose/typegoose";
import { Directive, Field, ObjectType } from "type-graphql";
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
  if (this.isNew && this.email.split("@")[1].includes("uniba")) {
    this.billings.push({
      name: "Univerzita Komenského v Bratislave, Právnická fakulta",
      address: {
        street: "Šafárikovo nám. č. 6",
        city: "Bratislava",
        postal: "810 00",
        country: "Slovensko",
      },
      ICO: "00397865",
      DIC: "2020845332",
      ICDPH: "SK2020845332 ",
    });
  }
})
@index({ name: "text", email: "text" })
export class User {
  @Directive("@external")
  @Field(() => ObjectId)
  id: ObjectId;

  @Field()
  @Property()
  email: string;

  @Field({ nullable: true })
  @Property()
  titlesBefore?: string;

  @Field()
  @Property()
  name: string;

  @Field({ nullable: true })
  @Property()
  titlesAfter?: string;

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
