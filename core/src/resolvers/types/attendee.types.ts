import { ObjectId } from "mongodb";
import { ArgsType, Field, Float, InputType, ObjectType } from "type-graphql";
import { Billing } from "../../entitites/Billing";
import { IsString } from "class-validator";
import { AddressInput, FlawBillingInput } from "./conference.types";
import { CreateArgs, CreateConnection } from "./pagination.types";
import { Attendee, Invoice, InvoiceData } from "../../entitites/Attendee";
import { IMutationResponse } from "./interface.types";

@ObjectType({
  description: "AttendeeConnection type enabling cursor based pagination",
})
export class AttendeeConnection extends CreateConnection(Attendee) {}

@ArgsType()
export class AttendeeArgs extends CreateArgs(Attendee) {
  @Field()
  conferenceSlug: string;

  @Field(() => [ObjectId], { nullable: "items", defaultValue: [] })
  sectionIds: ObjectId[];

  @Field(() => Boolean, { nullable: true })
  passive?: boolean;
}

@ObjectType({ implements: IMutationResponse })
export class AttendeeMutationResponse extends IMutationResponse {
  @Field(() => Attendee)
  data: Attendee;
}

@InputType()
export class AttendeeBillingInput implements Billing {
  @Field()
  @IsString()
  name: string;

  @Field(() => AddressInput)
  address: AddressInput;

  @Field({ nullable: true })
  @IsString()
  DIC?: string;

  @Field({ nullable: true })
  @IsString()
  ICDPH?: string;

  @Field({ nullable: true })
  @IsString()
  ICO?: string;
}

@InputType({ description: "Conference registration input type" })
export class AttendeeInput {
  @Field()
  conferenceId: ObjectId;

  @Field()
  ticketId: ObjectId;

  @Field(() => AttendeeBillingInput)
  billing: AttendeeBillingInput;
}

@InputType()
export class InvoiceDataInput implements InvoiceData {
  @Field()
  body: String;

  @Field()
  comment: String;

  @Field()
  dueDate: Date;

  @Field()
  issueDate: Date;

  @Field(() => Float)
  price: Number;

  @Field()
  type: String;

  @Field(() => Float)
  vat: Number;

  @Field()
  vatDate: Date;
}

@InputType()
export class InvoiceInput implements Invoice {
  @Field(() => InvoiceDataInput)
  body: InvoiceDataInput;

  @Field(() => FlawBillingInput)
  issuer: FlawBillingInput;

  @Field(() => AttendeeBillingInput)
  payer: AttendeeBillingInput;
}
