import {
  getModelForClass,
  index,
  pre,
  prop as Property,
} from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { ArgumentValidationError, Field, ID, ObjectType } from "type-graphql";
import { ObjectId } from "mongodb";

import { Ref } from "../util/types";
import { Conference } from "./Conference";
import { Section } from "./Section";
import { User } from "./User";
import Container from "typedi";
import { I18nService } from "../services/i18nService";

@ObjectType()
export class SubmissionTranslationContent {
  @Field()
  @Property({ lowercase: true })
  name: string;

  @Field()
  @Property()
  abstract: string;

  @Field(() => [String])
  @Property({ type: () => String, lowercase: true })
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

@index({ conference: 1, section: 1, authors: 1 })
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
            name: Container.get(I18nService).translate("nameExists", {
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
            name: Container.get(I18nService).translate("nameExists", {
              ns: "submission",
              name: submissionExists.translations.sk.name,
            }),
          },
          //children?: ValidationError[], // Contains all nested validation errors of the property
        },
      ]);
    }
  }
})
@ObjectType({ description: "Submission entity model type" })
export class Submission extends TimeStamps {
  @Field(() => ID)
  id: ObjectId;

  @Field(() => SubmissionTranslation)
  @Property({ type: () => SubmissionTranslation, _id: false })
  translations: SubmissionTranslation;

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
