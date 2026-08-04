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

  @Field({ nullable: true })
  @Property()
  IBAN?: string;

  @Field({ nullable: true })
  @Property()
  SWIFT?: string;

  @Field({ nullable: true })
  @Property()
  variableSymbol?: string;
}

export type InvoiceIssuerBilling = Billing & { variableSymbol: string };

export function assertInvoiceIssuerBilling(
  billing: Billing | null | undefined,
): asserts billing is InvoiceIssuerBilling {
  if (!billing?.variableSymbol?.trim()) {
    throw new Error("Invoice issuer billing requires a variable symbol.");
  }
}
