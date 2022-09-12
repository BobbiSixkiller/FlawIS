import { ArgumentValidationError, Field, Int, ObjectType } from "type-graphql";
import { getModelForClass, pre, prop as Property } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";

import { ObjectId } from "mongodb";
import { Section } from "./Section";

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

@ObjectType()
export class Address {
  @Field()
  @Property()
  street: string;

  @Field()
  @Property()
  city: string;

  @Field()
  @Property()
  postal: string;

  @Field()
  @Property()
  country: string;
}

@ObjectType({ description: "Billing information" })
export class Billing {
  @Field({ nullable: true })
  id?: ObjectId;

  @Field()
  @Property()
  name: string;

  @Field(() => Address)
  @Property({ _id: false })
  address: Address;

  @Field()
  @Property()
  ICO: string;

  @Field()
  @Property()
  DIC: string;

  @Field()
  @Property()
  ICDPH: string;

  @Field({ nullable: true })
  @Property()
  IBAN?: string;

  @Field({ nullable: true })
  @Property()
  SWIFT?: string;
}

@ObjectType({ description: "Conference hosting organization" })
export class Host {
  @Field()
  @Property()
  logoUrl: string;

  @Field()
  @Property()
  stampUrl: string;

  @Field(() => Billing)
  @Property({ _id: false })
  billing: Billing;
}

@ObjectType({ description: "Venue that conference takes place in" })
export class Venue {
  @Field()
  @Property()
  name: string;

  @Field()
  @Property({ _id: false })
  address: Address;
}

@ObjectType({ description: "Conference ticket type" })
export class Ticket {
  @Field()
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
            EmailExists: "Conference with provided name already exists!",
          },
          //children?: ValidationError[], // Contains all nested validation errors of the property
        },
      ]);
    }
  }
})
@ObjectType({ description: "Conference model type" })
export class Conference extends TimeStamps {
  @Field()
  id: ObjectId;

  @Field()
  @Property()
  name: string;

  @Field()
  @Property({ unique: true })
  slug: string;

  @Field()
  @Property()
  logoUrl: string;

  @Field()
  @Property()
  description: string;

  @Field()
  @Property()
  variableSymbol: string;

  @Field(() => Host, { nullable: true })
  @Property({ _id: false })
  host?: Host;

  @Field(() => Venue, { nullable: true })
  @Property({ _id: false })
  venue?: Venue;

  @Field(() => [Section])
  sections: Section[];

  @Field(() => [Ticket])
  @Property({ type: () => Ticket, default: [] })
  tickets: Ticket[];

  @Field({ nullable: true })
  @Property()
  regStart?: Date;

  @Field({ nullable: true })
  @Property()
  start?: Date;

  @Field({ nullable: true })
  @Property()
  end?: Date;

  @Field(() => [ConferenceTranslation])
  @Property({ type: () => ConferenceTranslation, default: [], _id: false })
  translations: ConferenceTranslation[];

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
}
