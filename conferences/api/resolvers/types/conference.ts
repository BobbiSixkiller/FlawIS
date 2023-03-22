import { Field, InputType, Int, ObjectType } from "type-graphql";
import {
  IsBoolean,
  IsDate,
  IsLocale,
  IsNumberString,
  IsString,
} from "class-validator";

import {
  Conference,
  ConferenceBilling,
  ImportantDates,
  Ticket,
} from "../../entities/Conference";
import { Address } from "../../entities/Billing";
import CreateConnection from "./pagination";

@InputType()
class TicketInputTranslation {
  @Field()
  @IsLocale()
  language: string;

  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  description: string;
}

@InputType()
class ConferenceInputTranslation {
  @Field()
  @IsLocale()
  language: string;

  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  description: string;

  @Field()
  @IsString()
  logoUrl: string;

  @Field(() => [TicketInputTranslation], { nullable: true })
  tickets?: TicketInputTranslation[];
}

@InputType()
class AddressInput implements Address {
  @Field()
  @IsString()
  street: string;

  @Field()
  @IsString()
  city: string;

  @Field()
  @IsString()
  postal: string;

  @Field()
  @IsString()
  country: string;
}

@InputType()
export class BillingInput implements ConferenceBilling {
  @Field()
  @IsString()
  name: string;

  @Field(() => AddressInput)
  address: AddressInput;

  @Field()
  @IsString()
  DIC: string;

  @Field()
  @IsString()
  ICDPH: string;

  @Field()
  @IsString()
  ICO: string;

  @Field()
  @IsString()
  IBAN: string;

  @Field()
  @IsString()
  SWIFT: string;

  @Field()
  @IsString()
  variableSymbol: string;

  @Field()
  @IsString()
  stampUrl: string;
}

@InputType()
export class TicketInput implements Partial<Ticket> {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  description: string;

  @Field()
  @IsBoolean()
  online: boolean;

  @Field()
  @IsBoolean()
  withSubmission: boolean;

  @Field(() => Int)
  @IsNumberString()
  price: number;
}

@InputType()
export class DatesInput implements ImportantDates {
  @Field()
  @IsDate()
  start: Date;

  @Field()
  @IsDate()
  end: Date;

  @Field({ nullable: true })
  @IsDate()
  regEnd?: Date;

  @Field({ nullable: true })
  @IsDate()
  submissionDeadline?: Date;
}

@InputType({ description: "Conference input type" })
export class ConferenceInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  slug: string;

  @Field()
  @IsString()
  description: string;

  @Field()
  @IsString()
  logoUrl: string;

  @Field(() => BillingInput)
  billing: BillingInput;

  @Field(() => DatesInput)
  dates: DatesInput;

  // @Field()
  // @IsString()
  // variableSymbol: string;

  // @Field({ nullable: true })
  // @IsDate()
  // regStart?: Date;

  // @Field({ nullable: true })
  // @IsDate()
  // start?: Date;

  // @Field({ nullable: true })
  // @IsDate()
  // end?: Date;

  // @Field(() => [TicketInput], { nullable: true })
  // tickets?: TicketInput[];

  @Field(() => [ConferenceInputTranslation], { nullable: true })
  translations?: ConferenceInputTranslation[];
}

@ObjectType()
export class ConferenceConnection extends CreateConnection(Conference) {
  @Field(() => Int)
  year: number;
}
