import { Field, InputType, Int, ObjectType } from "type-graphql";
import { IsBoolean, IsDate, IsLocale, IsString, Min } from "class-validator";

import {
  Conference,
  ConferenceBilling,
  ImportantDates,
  Ticket,
} from "../../entities/Conference";
import { Address } from "../../entities/Billing";
import { CreateConnection } from "./pagination";
import { FileInput } from "./file";

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

  @Field(() => FileInput)
  logo: FileInput;
}

@InputType()
export class AddressInput implements Address {
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
  @Field(() => FileInput)
  stamp: FileInput;
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
  @Min(1)
  price: number;

  @Field(() => [TicketInputTranslation])
  translations: TicketInputTranslation[];
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

  @Field(() => FileInput)
  logo: FileInput;

  @Field(() => BillingInput)
  billing: BillingInput;

  @Field(() => DatesInput)
  dates: DatesInput;

  @Field(() => [ConferenceInputTranslation])
  translations: ConferenceInputTranslation[];
}

@ObjectType()
export class ConferenceConnection extends CreateConnection(Conference) {
  @Field(() => Int)
  year: number;
}
