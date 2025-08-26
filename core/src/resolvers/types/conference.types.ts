import {
  ArgsType,
  Field,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from "type-graphql";
import { CreateArgs, CreateConnection } from "./pagination.types";
import { IMutationResponse } from "./interface.types";
import { Conference, ImportantDates, Ticket } from "../../entitites/Conference";
import { IsBoolean, IsDate, IsString, Min } from "class-validator";
import { Address, Billing, FlawBilling } from "../../entitites/Billing";
import { Section } from "../../entitites/Section";
import { ObjectId } from "mongodb";
import { LocalesInput } from "./translation.types";

@ObjectType({
  description: "ConferenceConnection type enabling cursor based pagination",
})
export class ConferenceConnection extends CreateConnection(Conference) {}

export enum ConferenceSortableField {
  ID = "_id",
}

registerEnumType(ConferenceSortableField, {
  name: "ConferenceSortableField",
  description: "Sortable enum definition for conferences query",
});

@ArgsType()
export class ConferenceArgs extends CreateArgs(
  Conference,
  ConferenceSortableField
) {}

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
export class FlawBillingInput implements FlawBilling {
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
export class ConferenceInput {
  @Field()
  @IsString()
  slug: string;

  @Field(() => FlawBillingInput)
  billing: FlawBillingInput;

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
