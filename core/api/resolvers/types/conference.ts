import { ArgsType, Field, InputType, Int, ObjectType } from "type-graphql";
import { CreateArgs, CreateConnection } from "./pagination";
import { IMutationResponse } from "./interface";
import { Conference, ImportantDates, Ticket } from "../../entitites/Conference";
import { IsBoolean, IsDate, IsString, Min } from "class-validator";
import { Address, Billing } from "../../entitites/Billing";
import { Section } from "../../entitites/Section";
import { ObjectId } from "mongodb";
import { LocalesInput } from "./translation";

@ObjectType({
  description: "ConferenceConnection type enabling cursor based pagination",
})
export class ConferenceConnection extends CreateConnection(Conference) {}

@ArgsType()
export class ConferenceArgs extends CreateArgs(Conference) {}

@ObjectType({ implements: IMutationResponse })
export class ConferenceMutationResponse extends IMutationResponse {
  @Field(() => Conference)
  data: Conference;
}

@ObjectType({ implements: IMutationResponse })
export class SectionMutationResponse extends IMutationResponse {
  @Field(() => Section)
  data: Section;
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
export class ConferenceBillingInput implements Billing {
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
export class LocalizedConferenceInputs {
  @Field()
  @IsString()
  name: string;

  @Field()
  logoUrl: string;
}

@InputType()
export class ConferenceTranslationInput extends LocalesInput(
  LocalizedConferenceInputs
) {}

@InputType()
export class LocalizedTicketInputs {
  @Field()
  name: string;

  @Field()
  description: string;
}

@InputType()
export class TicketTranslationInput extends LocalesInput(
  LocalizedTicketInputs
) {}

@InputType()
export class TicketInput implements Partial<Ticket> {
  @Field()
  @IsBoolean()
  online: boolean;

  @Field()
  @IsBoolean()
  withSubmission: boolean;

  @Field(() => Int)
  @Min(1)
  price: number;

  @Field(() => TicketTranslationInput)
  translations: TicketTranslationInput;
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
export class ConferenceInput implements Partial<Conference> {
  @Field()
  @IsString()
  slug: string;

  @Field(() => ConferenceBillingInput)
  billing: ConferenceBillingInput;

  @Field(() => DatesInput)
  dates: DatesInput;

  @Field(() => ConferenceTranslationInput)
  translations: ConferenceTranslationInput;
}

@InputType()
export class LocalizedSectionInputs {
  @Field()
  name: string;

  @Field()
  topic: string;
}

@InputType()
export class SectionTranslationInput extends LocalesInput(
  LocalizedSectionInputs
) {}

@InputType({ description: "Section input type" })
export class SectionInput implements Partial<Section> {
  @Field()
  conference: ObjectId;

  @Field(() => SectionTranslationInput)
  translations: SectionTranslationInput;
}
