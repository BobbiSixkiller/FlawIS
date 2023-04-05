import {
  ArgumentValidationError,
  Field,
  ID,
  Int,
  ObjectType,
} from "type-graphql";
import {
  getModelForClass,
  pre,
  prop as Property,
  Ref,
} from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";

import { ObjectId } from "mongodb";
import { Section } from "./Section";
import { Address, Billing } from "./Billing";

@ObjectType({ isAbstract: true })
class Translation {
  @Field()
  @Property()
  language: string;
}

@ObjectType()
class TicketTranslation extends Translation implements Partial<Ticket> {
  @Field()
  @Property()
  name: string;

  @Field()
  @Property()
  description: string;
}

@ObjectType()
class ConferenceTranslation extends Translation {
  @Field()
  @Property()
  name: string;

  @Field()
  @Property()
  description: string;

  @Field()
  @Property()
  logoUrl: string;

  @Field(() => [TicketTranslation])
  @Property({ type: () => TicketTranslation, default: [], _id: false })
  tickets: TicketTranslation[];
}

@ObjectType({ description: "Conference billing organization" })
export class ConferenceBilling extends Billing {
  @Field()
  @Property()
  variableSymbol: string;

  @Field()
  @Property()
  IBAN: string;

  @Field()
  @Property()
  SWIFT: string;

  @Field()
  @Property()
  stampUrl: string;
}

@ObjectType({ description: "Important dates regarding conference" })
export class ImportantDates {
  @Field()
  @Property()
  start: Date;

  @Field()
  @Property()
  end: Date;

  @Field({ nullable: true })
  @Property()
  regEnd?: Date;

  @Field({ nullable: true })
  @Property()
  submissionDeadline?: Date;
}

@ObjectType({ description: "Conference contact information" })
export class Contact {
  @Field()
  @Property()
  name: string;

  @Field()
  @Property({ _id: false })
  address: Address;

  @Field(() => [String])
  @Property({ type: () => [String] })
  conferenceTeam: string[];

  @Field(() => [String])
  @Property({ type: () => [String] })
  scientificTeam: string[];

  @Field()
  @Property()
  email: string;
}

@ObjectType({ description: "Conference ticket" })
export class Ticket {
  @Field(() => ID)
  id: ObjectId;

  @Field()
  @Property()
  name: string;

  @Field()
  @Property()
  description: string;

  @Field(() => Int)
  @Property()
  price: number;

  @Field()
  @Property()
  withSubmission: boolean;

  @Field()
  @Property()
  online: boolean;
}

@pre<Conference>("save", async function () {
  if (this.isNew || this.isModified("name")) {
    const conferenceExists = await getModelForClass(Conference)
      .findOne({ name: this.name })
      .exec();
    if (conferenceExists && conferenceExists.id !== this.id) {
      throw new ArgumentValidationError([
        {
          target: Conference, // Object that was validated.
          property: "name", // Object's property that haven't pass validation.
          value: this.name, // Value that haven't pass a validation.
          constraints: {
            // Constraints that failed validation with error messages.
            name: "Conference with provided name already exists!",
          },
          //children?: ValidationError[], // Contains all nested validation errors of the property
        },
      ]);
    }
  }

  if (this.isNew || this.isModified("slug")) {
    const conferenceExists = await getModelForClass(Conference)
      .findOne({ slug: this.slug })
      .exec();
    if (conferenceExists) {
      throw new ArgumentValidationError([
        {
          target: Conference, // Object that was validated.
          property: "slug", // Object's property that haven't pass validation.
          value: this.slug, // Value that haven't pass a validation.
          constraints: {
            // Constraints that failed validation with error messages.
            slug: "Conference with provided slug already exists!",
          },
          //children?: ValidationError[], // Contains all nested validation errors of the property
        },
      ]);
    }
  }
})
@ObjectType({ description: "Conference model type" })
export class Conference extends TimeStamps {
  @Field(() => ObjectId)
  id: ObjectId;

  @Field()
  @Property()
  name: string;

  @Field()
  @Property()
  slug: string;

  @Field()
  @Property()
  logoUrl: string;

  @Field()
  @Property()
  description: string;

  @Field(() => ConferenceBilling)
  @Property({ type: () => ConferenceBilling, _id: false })
  billing: ConferenceBilling;

  @Field(() => ImportantDates)
  @Property({ type: () => ImportantDates, _id: false })
  dates: ImportantDates;

  @Field(() => Contact, { nullable: true })
  @Property({ _id: false })
  contact?: Contact;

  @Field(() => [Ticket])
  @Property({ type: () => Ticket, default: [] })
  tickets: Ticket[];

  @Field(() => [Section])
  @Property({ ref: () => Section })
  sections: Ref<Section>[];

  @Field(() => [ConferenceTranslation])
  @Property({ type: () => ConferenceTranslation, default: [], _id: false })
  translations: ConferenceTranslation[];

  @Field(() => Int)
  @Property({ default: 0 })
  attendeesCount: number;

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
}
