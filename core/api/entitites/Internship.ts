import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { Field, ObjectType, registerEnumType } from "type-graphql";
import { ObjectId } from "mongodb";
import { Index, Pre, prop as Property, PropType } from "@typegoose/typegoose";
import { Ref } from "../util/types";
import { ModelType } from "@typegoose/typegoose/lib/types";
import { InternArgs, InternshipArgs } from "../resolvers/types/internship";
import { StudyProgramme, User } from "./User";
import { getAcademicYear } from "../util/helpers";

export enum Status {
  Applied = "APPLIED",
  Eligible = "ELIGIBLE",
  Accepted = "ACCEPTED",
  Rejected = "REJECTED",
}

registerEnumType(Status, {
  name: "Status",
  description: "Intern status",
});

@ObjectType({ description: "User stub type" })
export class UserReferece {
  @Field(() => ObjectId, { description: "User document id" })
  id: ObjectId;

  @Field()
  @Property()
  name: string;

  @Field()
  @Property()
  email: string;

  @Field()
  @Property()
  telephone: string;

  @Field(() => StudyProgramme)
  @Property({ type: Number, enum: StudyProgramme })
  studyProgramme: StudyProgramme;

  @Field({ nullable: true })
  avatarUrl?: string;
}

@Index({ internship: 1, "user._id": 1, status: 1 })
@Index({ "user._id": 1, createdAt: 1, status: 1 })
@ObjectType({
  description: "Ovject type representing student who applies for an internship",
})
export class Intern extends TimeStamps {
  @Field(() => ObjectId)
  id: ObjectId;

  @Field(() => UserReferece)
  @Property({ type: () => UserReferece })
  user: UserReferece;

  @Field(() => ObjectId)
  @Property({ ref: () => Internship })
  internship: Ref<Internship>;

  @Field()
  @Property()
  organization: string;

  @Field(() => Status)
  @Property({ enum: Status, type: String, default: Status.Applied })
  status: Status;

  @Field(() => [String])
  @Property({ type: () => [String], default: [] })
  fileUrls: string[];

  @Field(() => String, { nullable: true })
  @Property()
  organizationFeedbackUrl?: string;

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;

  public static async paginatedInterns(
    this: ModelType<Intern>,
    {
      first = 20,
      after,
      endDate,
      startDate,
      user,
      internship,
      status,
    }: InternArgs
  ) {
    return await this.aggregate([
      {
        $match: {
          ...(internship ? { internship } : {}),
          ...(user ? { "user._id": user } : {}),
          ...(status ? { status: { $in: status } } : {}),
          ...(endDate ? { createdAt: { $lte: endDate } } : {}),
          ...(startDate ? { createdAt: { $gte: startDate } } : {}),
        },
      },
      { $sort: { _id: 1 } },
      {
        $facet: {
          data: [
            { $match: { ...(after ? { _id: { $lt: after } } : {}) } },
            { $limit: first },
          ],
          hasNextPage: [
            { $match: { ...(after ? { _id: { $lt: after } } : {}) } },
            { $skip: first },
            { $limit: 1 }, // Check if more data exists
          ],
          totalCount: [{ $count: "totalCount" }],
        },
      },
      {
        $project: {
          totalCount: {
            $ifNull: [{ $arrayElemAt: ["$totalCount.totalCount", 0] }, 0],
          },
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

@Pre<Internship>("save", async function () {
  if (this.isNew) {
    const { academicYear } = getAcademicYear();

    this.academicYear = academicYear;
  }
})
@Index({ createdAt: 1, user: 1 }) // Index for queries utilizing createdAt
@Index({ academicYear: 1, user: 1 }) // Index for queries utilizing academicYear instead of createdAt
@ObjectType({ description: "Internship object type" })
export class Internship extends TimeStamps {
  @Field(() => ObjectId)
  id: ObjectId;

  @Property()
  language: string;

  @Field()
  @Property()
  organization: string;

  @Field()
  @Property()
  academicYear: string;

  @Field({
    description: "String representation of internship listing's HTML page",
  })
  @Property()
  description: string;

  @Field(() => String, { description: "User document reference" })
  @Property({ ref: () => User })
  user: Ref<User>;

  @Field(() => Intern, { nullable: true })
  myApplication?: Intern;

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;

  public static async paginatedInternships(
    this: ModelType<Internship>,
    {
      first = 20,
      after,
      endDate,
      startDate,
      user,
      academicYear,
      contextUserId,
    }: InternshipArgs
  ) {
    return await this.aggregate([
      {
        $facet: {
          data: [
            {
              $match: {
                ...(user ? { user } : {}),
                ...(endDate ? { createdAt: { $lte: endDate } } : {}),
                ...(startDate ? { createdAt: { $gte: startDate } } : {}),
                ...(academicYear ? { academicYear } : {}),
                ...(after ? { _id: { $lt: after } } : {}),
              },
            },
            ...(contextUserId
              ? [
                  {
                    $lookup: {
                      from: "interns", // Collection name for Intern
                      let: { internshipId: "$_id" },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $and: [
                                { $eq: ["$internship", "$$internshipId"] },
                                { $eq: ["$user._id", contextUserId] },
                              ],
                            },
                          },
                        },
                        { $limit: 1 }, // Only need one application per internship
                      ],
                      as: "myApplication",
                    },
                  },
                  {
                    $addFields: {
                      myApplication: { $arrayElemAt: ["$myApplication", 0] },
                      hasApplication: {
                        $cond: {
                          if: { $gt: [{ $size: "$myApplication" }, 0] },
                          then: 1,
                          else: 0,
                        },
                      },
                    },
                  },
                  {
                    $sort: { hasApplication: -1 as -1, createdAt: 1 as -1 }, // Sort by application first, then by creation date
                  },
                ]
              : []),
            { $limit: first },
          ],
          hasNextPage: [
            {
              $match: {
                ...(user ? { user } : {}),
                ...(endDate ? { createdAt: { $lte: endDate } } : {}),
                ...(startDate ? { createdAt: { $gte: startDate } } : {}),
                ...(academicYear ? { academicYear } : {}),
                ...(after ? { _id: { $lt: after } } : {}),
              },
            },
            { $skip: first },
            { $limit: 1 }, // Check if more data exists
          ],
          totalCount: [{ $count: "totalCount" }],
          academicYearCount: [{ $sortByCount: "$academicYear" }],
        },
      },
      {
        $project: {
          totalCount: {
            $ifNull: [{ $arrayElemAt: ["$totalCount.totalCount", 0] }, 0],
          },
          academicYears: {
            $map: {
              input: "$academicYearCount",
              as: "item",
              in: { academicYear: "$$item._id", count: "$$item.count" },
            },
          },
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
