import { Field, ArgsType, Int, InputType } from "type-graphql";
import { Min, Max, IsString } from "class-validator";
import { ObjectId } from "mongodb";

import { Attendee } from "../../entities/Attendee";
import { RefDocExists } from "../../util/decorators";
import { AddressInput, BillingInput } from "./conference";
import { Billing } from "../../entities/Billing";

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

  @Field()
  billing: AttendeeBillingInput;
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

  @Field()
  variableSymbol: String;

  @Field(() => Int)
  ticketPrice: Number;

  @Field(() => Int)
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
  @Field(() => BillingInput, { nullable: true })
  issuer: BillingInput;

  @Field(() => BillingInput, { nullable: true })
  payer: BillingInput;

  @Field(() => InvoiceDataInput, { nullable: true })
  body: InvoiceDataInput;
}

@ArgsType()
export class AttendeeArgs {
  @Field(() => String, { nullable: true })
  @RefDocExists(Attendee, {
    message: "Cursor's document not found!",
  })
  after?: ObjectId;

  @Field(() => Int, { defaultValue: 20, nullable: true })
  @Min(1)
  @Max(50)
  first?: number;
}
