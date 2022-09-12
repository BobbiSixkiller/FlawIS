import { Field, InputType, Int } from "type-graphql";
import {
  IsBoolean,
  IsDate,
  IsLocale,
  IsNumberString,
  IsString,
} from "class-validator";

import {
  Address,
  Billing,
  Host,
  Ticket,
  Venue,
} from "../../entitites/Conference";

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
export class BillingInput implements Billing {
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

  @Field({ nullable: true })
  @IsString()
  IBAN?: string;

  @Field({ nullable: true })
  @IsString()
  SWIFT?: string;
}

@InputType()
export class HostInput implements Partial<Host> {
  @Field()
  @IsString()
  logoUrl: string;

  @Field()
  @IsString()
  stampUrl: string;

  @Field(() => BillingInput)
  billing: BillingInput;
}

@InputType()
export class VenueInput implements Partial<Venue> {
  @Field()
  @IsString()
  name: string;

  @Field(() => AddressInput)
  address: AddressInput;
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
export class ConferenceInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  description: string;

  @Field()
  @IsString()
  logoUrl: string;

  @Field()
  @IsString()
  variableSymbol: string;

  @Field({ nullable: true })
  @IsDate()
  regStart?: Date;

  @Field({ nullable: true })
  @IsDate()
  start?: Date;

  @Field({ nullable: true })
  @IsDate()
  end?: Date;

  @Field(() => HostInput, { nullable: true })
  host?: HostInput;

  @Field(() => VenueInput, { nullable: true })
  venue?: VenueInput;

  @Field(() => [TicketInput], { nullable: true })
  tickets?: TicketInput[];

  @Field(() => [ConferenceInputTranslation], { nullable: true })
  translations?: ConferenceInputTranslation[];
}
