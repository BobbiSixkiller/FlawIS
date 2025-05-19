import { ArgumentValidationError, Field, Int, ObjectType } from "type-graphql";
import {
  getModelForClass,
  Index,
  pre,
  prop as Property,
} from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";

import { ObjectId } from "mongodb";
import Container from "typedi";
import { I18nService } from "../services/i18n.service";
import { LocalesType } from "../resolvers/types/translation";
import { Attendee } from "./Attendee";
import { FlawBilling } from "./Billing";

@ObjectType()
export class ConferenceTranslations {
  @Field()
  @Property()
  name: string;

  @Property()
  logoUrl: string;

  @Field({
    description: "Logourl transformed with regards to staging/production env",
  })
  get logoUrlEnv(): string {
    if (process.env.NODE_ENV === "staging") {
      return this.logoUrl.replace("minio", "minio-staging");
    }
    return this.logoUrl;
  }
}

@ObjectType()
export class ConferenceTranslation extends LocalesType(
  ConferenceTranslations
) {}

@ObjectType()
export class TicketTranslations {
  @Field()
  @Property()
  name: string;

  @Field()
  @Property()
  description: string;
}

@ObjectType()
export class TicketTranslation extends LocalesType(TicketTranslations) {}

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

@ObjectType({ description: "Conference ticket" })
export class Ticket {
  @Field()
  id: ObjectId;

  @Field(() => TicketTranslation)
  @Property({ _id: false })
  translations: TicketTranslation;

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
  if (this.isNew || this.isModified("translations.sk.name")) {
    const conferenceExists = await getModelForClass(Conference)
      .findOne({ "translations.sk.name": this.translations.sk.name })
      .exec();
    if (conferenceExists && conferenceExists.id !== this.id) {
      throw new ArgumentValidationError([
        {
          target: Conference, // Object that was validated.
          property: "translations.sk.name", // Object's property that haven't pass validation.
          value: conferenceExists.translations.sk.name, // Value that haven't pass a validation
          constraints: {
            // Constraints that failed validation with error messages.
            name: Container.get(I18nService).translate("nameExists", {
              ns: "conference",
              name: conferenceExists.translations.sk.name,
            }),
          },
          //children?: ValidationError[], // Contains all nested validation errors of the property
        },
      ]);
    }
  }
  if (this.isNew || this.isModified("translations.en.name")) {
    const conferenceExists = await getModelForClass(Conference)
      .findOne({ "translations.en.name": this.translations.en.name })
      .exec();
    if (conferenceExists && conferenceExists.id !== this.id) {
      throw new ArgumentValidationError([
        {
          target: Conference, // Object that was validated.
          property: "translations.en.name", // Object's property that haven't pass validation.
          value: conferenceExists.translations.en.name, // Value that haven't pass a validation
          constraints: {
            // Constraints that failed validation with error messages.
            name: Container.get(I18nService).translate("nameExists", {
              ns: "conference",
              name: conferenceExists.translations.sk.name,
            }),
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
            slug: Container.get(I18nService).translate("slugExists", {
              ns: "conference",
              slug: this.slug,
            }),
          },
          //children?: ValidationError[], // Contains all nested validation errors of the property
        },
      ]);
    }
  }
})
@Index({
  slug: "text",
  "translations.sk.name": "text",
  "translations.en.name": "text",
})
@ObjectType({ description: "Conference model type" })
export class Conference extends TimeStamps {
  @Field(() => ObjectId)
  id: ObjectId;

  @Field()
  @Property({ unique: true })
  slug: string;

  @Field(() => ConferenceTranslation)
  @Property({ _id: false })
  translations: ConferenceTranslation;

  @Field(() => FlawBilling)
  @Property({ type: () => FlawBilling, _id: false })
  billing: FlawBilling;

  @Field(() => ImportantDates)
  @Property({ type: () => ImportantDates, _id: false })
  dates: ImportantDates;

  @Field(() => [Ticket])
  @Property({ type: () => Ticket, default: [] })
  tickets: Ticket[];

  @Field(() => Int)
  @Property({ default: 0 })
  attendeesCount: number;

  @Field(() => Attendee, { nullable: true })
  attending?: Attendee;

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
}
