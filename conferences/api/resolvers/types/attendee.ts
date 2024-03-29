import {
  Field,
  ArgsType,
  InputType,
  Float,
  ObjectType,
  ID,
} from "type-graphql";
import { IsString } from "class-validator";
import { ObjectId } from "mongodb";

import { Attendee } from "../../entities/Attendee";
import { AddressInput, BillingInput } from "./conference";
import { Billing } from "../../entities/Billing";
import { SubmissionInput } from "./submission";
import { CreateConnection, CreateConnectionArgs } from "./pagination";

@InputType()
export class AttendeeBillingInput implements Billing {
  @Field()
  @IsString()
  name: string;

  @Field()
  address: AddressInput;

  @Field()
  @IsString()
  ICO: string;

  @Field()
  @IsString()
  DIC: string;

  @Field()
  @IsString()
  ICDPH: string;
}

@InputType()
export class AttendeeInput {
  @Field()
  conferenceId: ObjectId;

  @Field()
  ticketId: ObjectId;

  @Field({ nullable: true })
  submissionId?: ObjectId;

  @Field()
  billing: AttendeeBillingInput;

  @Field({ nullable: true })
  submission?: SubmissionInput;
}

@InputType()
class InvoiceDataInput {
  @Field()
  type: String;

  @Field()
  issueDate: Date;

  @Field()
  vatDate: Date;

  @Field()
  dueDate: Date;

  @Field(() => Float)
  price: Number;

  @Field(() => Float)
  vat: Number;

  @Field()
  body: String;

  @Field()
  comment: String;
}

@InputType({
  description: "Invoice data input type facilitating attendee's invoice update",
})
export class InvoiceInput {
  @Field(() => BillingInput)
  issuer: BillingInput;

  @Field(() => AttendeeBillingInput)
  payer: AttendeeBillingInput;

  @Field(() => InvoiceDataInput)
  body: InvoiceDataInput;
}

@ObjectType({
  description: "AttendeeConnection type enabling cursor based pagination",
})
export class AttendeeConnection extends CreateConnection(Attendee) {}

@ArgsType()
export class AttendeeArgs extends CreateConnectionArgs(Attendee) {
  @Field(() => [ObjectId], { defaultValue: [] })
  sectionIds: ObjectId[];

  @Field(() => Boolean)
  passive: boolean;
}
