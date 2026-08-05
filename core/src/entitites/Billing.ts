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

export const INVOICE_VARIABLE_SYMBOL_PREFIX_MAX_LENGTH = 6;

export function getInvoiceVariableSymbolPrefix(
  billing: Billing | null | undefined,
) {
  const prefix = billing?.variableSymbol?.trim();
  if (!prefix) {
    throw new Error("Invoice issuer billing requires a variable symbol.");
  }
  if (!/^\d+$/.test(prefix)) {
    throw new Error("Invoice variable-symbol prefix must be numeric.");
  }
  if (prefix.length > INVOICE_VARIABLE_SYMBOL_PREFIX_MAX_LENGTH) {
    throw new Error(
      `Invoice variable-symbol prefix must contain at most ${INVOICE_VARIABLE_SYMBOL_PREFIX_MAX_LENGTH} digits.`,
    );
  }
  return prefix;
}

export function assertInvoiceIssuerBilling(
  billing: Billing | null | undefined,
): asserts billing is InvoiceIssuerBilling {
  getInvoiceVariableSymbolPrefix(billing);
}
