import { ObjectId } from "mongodb";
import {
  ArgsType,
  Field,
  Float,
  InputType,
  ObjectType,
  registerEnumType,
} from "type-graphql";
import { Billing } from "../../entitites/Billing";
import { IsDate, IsString } from "class-validator";
import { AddressInput, FlawBillingInput } from "./conference.types";
import { CreateArgs, CreateConnection } from "./pagination.types";
import { Attendee, Invoice, InvoiceData } from "../../entitites/Attendee";
import { IMutationResponse } from "./interface.types";

@ObjectType({
  description: "AttendeeConnection type enabling cursor based pagination",
})
export class AttendeeConnection extends CreateConnection(Attendee) {}

export enum AttendeeSortableField {
  NAME = "user.name",
  ID = "_id",
}

registerEnumType(AttendeeSortableField, {
  name: "AttendeeSortableField",
  description: "Sortable enum definition for attendees query",
});

@InputType()
export class AttendeeFilterInput {
  @Field()
  conferenceSlug: string;

  @Field(() => [ObjectId], { nullable: "items", defaultValue: [] })
  sectionIds: ObjectId[];

  @Field(() => Boolean, { nullable: true })
  passive?: boolean;
}

@ArgsType()
export class AttendeeArgs extends CreateArgs(Attendee, AttendeeSortableField) {
  @Field(() => AttendeeFilterInput, { nullable: true })
  filter?: AttendeeFilterInput;
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
  @IsDate()
  dueDate: Date;

  @Field()
  @IsDate()
  issueDate: Date;

  @Field(() => Float)
  price: Number;

  @Field()
  type: String;

  @Field(() => Float)
  vat: Number;

  @Field()
  @IsDate()
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
