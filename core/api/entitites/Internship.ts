import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { Field, Int, ObjectType, registerEnumType } from "type-graphql";
import { ObjectId } from "mongodb";
import {
  getModelForClass,
  Index,
  Pre,
  prop as Property,
} from "@typegoose/typegoose";
import { Ref } from "../util/types";
import { ModelType } from "@typegoose/typegoose/lib/types";
import { InternArgs, InternshipArgs } from "../resolvers/types/internship";

@ObjectType({ description: "User stub type" })
class UserReferece {
  @Field(() => ObjectId, { description: "User document reference" })
  id: ObjectId;

  @Field()
  @Property()
  name: string;
}

@Index({ createdAt: 1, "user._id": 1 })
@ObjectType({ description: "Internship object type" })
export class Internship extends TimeStamps {
  @Field(() => ObjectId)
  id: ObjectId;

  @Field()
  @Property()
  organization: string;

  @Field({
    description: "String representation of internship listing's HTML page",
  })
  @Property()
  description: string;

  @Field(() => UserReferece)
  @Property({ type: () => UserReferece })
  user: UserReferece;

  @Field(() => Int)
  @Property({ default: 0 })
  applicationCount: number;

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;

  public static async paginatedInternships(
    this: ModelType<Internship>,
    { first = 20, after, endDate, startDate, user }: InternshipArgs
  ) {
    return await this.aggregate([
      {
        $match: {
          ...(user ? { "user._id": user } : {}),
          ...(endDate ? { createdAt: { $lte: endDate } } : {}),
          ...(startDate ? { createdAt: { $gte: startDate } } : {}),
          ...(after ? { _id: { $lt: after } } : {}),
        },
      },
      { $sort: { applicationCount: -1 } },
      {
        $facet: {
          data: [{ $limit: first }],
          hasNextPage: [{ $skip: first }, { $limit: 1 }], // Check if more data exists
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

@Pre<Intern>("save", async function () {
  if (this.isNew) {
    await getModelForClass(Internship).updateOne(
      { _id: this.internship },
      { $inc: { applicationCount: 1 } }
    );
  }
})
@Pre<Intern>(
  "deleteOne",
  async function () {
    await getModelForClass(Internship).updateOne(
      { _id: this.internship },
      { $inc: { applicationCount: -1 } }
    );
  },
  { document: true }
)
@Index({ internship: 1, "user._id": 1, status: 1 })
@Index({ "user._id": 1, createdAt: 1, status: 1 })
@ObjectType({
  description: "Ovject type representing student who applies for an internship",
})
export class Intern extends TimeStamps {
  @Field(() => ObjectId)
  id: ObjectId;

  @Field(() => UserReferece)
  @Property({ type: () => UserReferece, _id: false })
  user: UserReferece;

  @Field(() => Internship)
  @Property({ ref: () => Internship })
  internship: Ref<Internship>;

  @Field(() => Status)
  @Property({ enum: Status, type: String, default: Status.Applied })
  status: Status;

  @Field(() => [String], { nullable: true })
  @Property({ type: () => [String] })
  files?: string[];

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;

  public static async paginatedInterns(
    this: ModelType<Intern>,
    { first, after, endDate, startDate, user, internship }: InternArgs
  ) {
    return await this.aggregate([
      { $sort: { _id: -1 } },
      {
        $facet: {
          data: [
            {
              $match: {
                $expr: {
                  $cond: {
                    if: {
                      $ne: [internship, null],
                    },
                    then: { $eq: [internship, "$internship"] },
                    else: {},
                  },
                },
              },
            },
            {
              $match: {
                $expr: {
                  $cond: {
                    if: {
                      $ne: [user, null],
                    },
                    then: { $eq: [user, "$user._id"] },
                    else: {},
                  },
                },
              },
            },
            {
              $match: {
                $expr: {
                  $cond: {
                    if: {
                      $ne: [endDate, null],
                    },
                    then: { $lte: ["createdAt", endDate] },
                    else: {},
                  },
                },
              },
            },
            {
              $match: {
                $expr: {
                  $cond: {
                    if: {
                      $ne: [startDate, null],
                    },
                    then: { $gte: ["createdAt", startDate] },
                    else: {},
                  },
                },
              },
            },
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
          totalCount: [
            {
              $match: {
                $expr: {
                  $cond: {
                    if: {
                      $ne: [internship, null],
                    },
                    then: { $eq: [internship, "$internship"] },
                    else: {},
                  },
                },
              },
            },
            {
              $match: {
                $expr: {
                  $cond: {
                    if: {
                      $ne: [user, null],
                    },
                    then: { $eq: [user, "$user._id"] },
                    else: {},
                  },
                },
              },
            },
            {
              $match: {
                $expr: {
                  $cond: {
                    if: {
                      $ne: [endDate, null],
                    },
                    then: { $lte: ["createdAt", endDate] },
                    else: {},
                  },
                },
              },
            },
            {
              $match: {
                $expr: {
                  $cond: {
                    if: {
                      $ne: [startDate, null],
                    },
                    then: { $gte: ["createdAt", startDate] },
                    else: {},
                  },
                },
              },
            },
            { $count: "totalCount" }, // Count matching documents
          ],
        },
      },
      {
        $project: {
          totalCount: {
            $ifNull: [{ $arrayElemAt: ["$totalCount.totalCount", 0] }, 0], // Extract totalCount value
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
