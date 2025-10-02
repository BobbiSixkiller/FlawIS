import { Field, ObjectType } from "type-graphql";
import { prop as Property } from "@typegoose/typegoose";

@ObjectType()
export class Address {
  @Field()
  @Property()
  street: string;

  @Field()
  @Property()
  city: string;

  @Field()
  @Property()
  postal: string;

  @Field()
  @Property()
  country: string;
}

@ObjectType({ description: "Billing information" })
export class Billing {
  @Field()
  @Property()
  name: string;

  @Field(() => Address)
  @Property({ _id: false })
  address: Address;

  @Field({ nullable: true })
  @Property()
  ICO?: string;

  @Field({ nullable: true })
  @Property()
  DIC?: string;

  @Field({ nullable: true })
  @Property()
  ICDPH?: string;
}

@ObjectType({ description: "Flaw billing information" })
export class FlawBilling extends Billing {
  @Field()
  @Property()
  variableSymbol: string;

  @Field()
  @Property()
  ICO: string;

  @Field()
  @Property()
  DIC: string;

  @Field()
  @Property()
  ICDPH: string;

  @Field()
  @Property()
  IBAN: string;

  @Field()
  @Property()
  SWIFT: string;
}
