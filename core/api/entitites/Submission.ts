import {
  getModelForClass,
  Index,
  pre,
  prop as Property,
} from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import {
  ArgumentValidationError,
  Field,
  ObjectType,
  registerEnumType,
} from "type-graphql";
import { ObjectId } from "mongodb";

import { Conference } from "./Conference";
import { Section } from "./Section";
import { User } from "./User";
import Container from "typedi";
import { I18nService } from "../services/i18n.service";
import { Ref } from "@typegoose/typegoose/lib/types";

export enum PresentationLng {
  SK = "SK",
  EN = "EN",
  CZ = "CZ",
}

registerEnumType(PresentationLng, {
  name: "PresentationLng",
  description: "Language the speaker will be presenting his submission in",
});

@ObjectType()
export class SubmissionTranslationContent {
  @Field()
  @Property()
  name: string;

  @Field()
  @Property()
  abstract: string;

  @Field(() => [String])
  @Property({ type: () => String })
  keywords: string[];
}

@ObjectType()
export class SubmissionTranslation {
  @Field(() => SubmissionTranslationContent)
  @Property({ _id: false })
  sk: SubmissionTranslationContent;

  @Field(() => SubmissionTranslationContent)
  @Property({ _id: false })
  en: SubmissionTranslationContent;
}

@pre<Submission>("save", async function () {
  if (this.isNew || this.isModified("translations.sk.name")) {
    const submissionExists = await getModelForClass(Submission)
      .findOne({ "translations.sk.name": this.translations.sk.name })
      .exec();
    if (submissionExists && submissionExists.id !== this.id) {
      throw new ArgumentValidationError([
        {
          target: Conference, // Object that was validated.
          property: "translations.sk.name", // Object's property that haven't pass validation.
          value: submissionExists.translations.sk.name, // Value that haven't pass a validation
          constraints: {
            // Constraints that failed validation with error messages.
            name: Container.get(I18nService).translate("skNameExists", {
              ns: "submission",
              name: submissionExists.translations.sk.name,
            }),
          },
          //children?: ValidationError[], // Contains all nested validation errors of the property
        },
      ]);
    }
  }
  if (this.isNew || this.isModified("translations.en.name")) {
    const submissionExists = await getModelForClass(Submission)
      .findOne({ "translations.en.name": this.translations.en.name })
      .exec();
    if (submissionExists && submissionExists.id !== this.id) {
      throw new ArgumentValidationError([
        {
          target: Conference, // Object that was validated.
          property: "translations.en.name", // Object's property that haven't pass validation.
          value: submissionExists.translations.en.name, // Value that haven't pass a validation
          constraints: {
            // Constraints that failed validation with error messages.
            name: Container.get(I18nService).translate("enNameExists", {
              ns: "submission",
              name: submissionExists.translations.en.name,
            }),
          },
          //children?: ValidationError[], // Contains all nested validation errors of the property
        },
      ]);
    }
  }
})
@Index({ conference: 1, section: 1, authors: 1 })
@ObjectType({ description: "Submission entity model type" })
export class Submission extends TimeStamps {
  @Field(() => ObjectId)
  id: ObjectId;

  @Field(() => SubmissionTranslation)
  @Property({ type: () => SubmissionTranslation, _id: false })
  translations: SubmissionTranslation;

  @Field(() => PresentationLng, { nullable: true })
  @Property({ enum: PresentationLng })
  presentationLng?: PresentationLng;

  @Field({ nullable: true })
  @Property()
  fileUrl?: string;

  @Field(() => [User])
  @Property({ ref: () => User })
  authors: Ref<User>[];

  @Field(() => Conference)
  @Property({ ref: () => Conference })
  conference: Ref<Conference>;

  @Field(() => Section)
  @Property({ ref: () => Section })
  section: Ref<Section>;

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
}
