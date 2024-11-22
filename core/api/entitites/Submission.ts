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
  ID,
  ObjectType,
  registerEnumType,
} from "type-graphql";
import { ObjectId } from "mongodb";

import { Ref } from "../util/types";
import { Conference } from "./Conference";
import { Section } from "./Section";
import { User } from "./User";
import Container from "typedi";
import { I18nService } from "../services/i18nService";
import { ModelType } from "@typegoose/typegoose/lib/types";
import { SubmissionArgs } from "../resolvers/types/submission";

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
  @Field(() => ID)
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

  public static async paginatedSubmissions(
    this: ModelType<Submission>,
    { after, first, conferenceId, sectionIds }: SubmissionArgs
  ) {
    return await this.aggregate([
      {
        $match: {
          $expr: {
            $cond: {
              if: { $ne: [conferenceId, null] },
              then: {
                $eq: ["$conference", conferenceId],
              },
              else: {},
            },
          },
        },
      },
      {
        $match: {
          $expr: {
            $cond: {
              if: { $ne: [{ $size: [sectionIds] }, 0] },
              then: {
                $in: ["$section", sectionIds],
              },
              else: {},
            },
          },
        },
      },
      { $sort: { _id: -1 } },
      {
        $facet: {
          data: [
            {
              $match: {
                $expr: {
                  $cond: [
                    { $eq: [after, null] },
                    { $ne: ["$_id", null] },
                    { $lt: ["$_id", after] },
                  ],
                },
              },
            },
            { $limit: first || 20 },
          ],
          hasNextPage: [
            {
              $match: {
                $expr: {
                  $cond: [
                    { $eq: [after, null] },
                    { $ne: ["$_id", null] },
                    { $lt: ["$_id", after] },
                  ],
                },
              },
            },
            { $skip: first || 20 }, // skip paginated data
            { $limit: 1 }, // just to check if there's any element
          ],
          totalCount: [{ $count: "totalCount" }], // Count matching documents,
        },
      },
      {
        $project: {
          totalCount: { $arrayElemAt: ["$totalCount.totalCount", 0] }, // Extract totalCount value
          edges: {
            $map: {
              input: "$data",
              as: "edge",
              in: { cursor: "$$edge._id", node: "$$edge" },
            },
          },
          pageInfo: {
            hasNextPage: { $eq: [{ $size: "$hasNextPage" }, 1] },
            endCursor: { $last: "$data._id" },
          },
        },
      },
    ]);
  }
}
