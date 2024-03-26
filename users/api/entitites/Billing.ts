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

  @Field()
  @Property()
  ICO?: string;

  @Field({ nullable: true })
  @Property()
  DIC?: string;

  @Field({ nullable: true })
  @Property()
  ICDPH?: string;

  @Field({ nullable: true })
  @Property()
  variableSymbol?: string;

  @Field({ nullable: true })
  @Property()
  IBAN?: string;

  @Field({ nullable: true })
  @Property()
  SWIFT?: string;

  @Field({ nullable: true })
  @Property()
  stampUrl?: string;
}
