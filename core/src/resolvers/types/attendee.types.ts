import { ObjectId } from "mongodb";
import {
  ArgsType,
  Field,
  Float,
  InputType,
  ObjectType,
  registerEnumType,
} from "type-graphql";
import { IsDate, IsString } from "class-validator";
import { BillingInput } from "./billing.types";
import { CreateArgs, CreateConnection } from "./pagination.types";
import { Attendee } from "../../entitites/Attendee";
import { Invoice, InvoiceData } from "../../entitites/Invoice";
import { IMutationResponse } from "./interface.types";
import { SubmissionInput } from "./submission.types";

@ObjectType({
  description: "AttendeeConnection type enabling cursor based pagination",
})
export class AttendeeConnection extends CreateConnection(Attendee) {}

export enum AttendeeSortableField {
  NAME = "user.name",
  ID = "_id",
}

export enum InvoiceOwnerType {
  CONFERENCE_ATTENDEE = "CONFERENCE_ATTENDEE",
  COURSE_ATTENDEE = "COURSE_ATTENDEE",
}

registerEnumType(InvoiceOwnerType, {
  name: "InvoiceOwnerType",
  description: "The registration type that owns an invoice.",
});

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

@InputType({ description: "Conference registration input type" })
export class AttendeeInput {
  @Field()
  conferenceId: ObjectId;

  @Field()
  ticketId: ObjectId;

  @Field(() => BillingInput)
  billing: BillingInput;

  @Field(() => SubmissionInput, { nullable: true })
  initialSubmission?: SubmissionInput;
}

@InputType()
export class InvoiceDataInput implements InvoiceData {
  @Field()
  body: string;

  @Field()
  comment: string;

  @Field()
  @IsDate()
  dueDate: Date;

  @Field()
  @IsDate()
  issueDate: Date;

  @Field(() => Float)
  price: number;

  @Field()
  type: string;

  @Field(() => Float)
  vat: number;

  @Field()
  @IsDate()
  vatDate: Date;
}

@InputType()
export class InvoiceInput implements Invoice {
  @Field(() => InvoiceDataInput)
  body: InvoiceDataInput;

  @Field(() => BillingInput)
  issuer: BillingInput;

  @Field(() => BillingInput)
  payer: BillingInput;
}
