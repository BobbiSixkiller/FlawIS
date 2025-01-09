import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { Field, ObjectType, registerEnumType } from "type-graphql";
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
import { getAcademicYearInterval } from "../util/helpers";
import { StudyProgramme } from "./User";

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
class UserReferece {
  @Field(() => ObjectId, { description: "User document id" })
  id: ObjectId;

  @Field()
  @Property()
  name: string;

  @Field()
  @Property()
  email: string;

  @Field({ nullable: true })
  @Property()
  telephone?: string;

  @Field(() => StudyProgramme, { nullable: true })
  @Property({ type: Number, enum: StudyProgramme })
  studyProgramme?: StudyProgramme;

  @Field({ nullable: true })
  @Property()
  avatarUrl?: string;
}

@Pre<Intern>("save", async function () {
  if (this.isNew) {
    await getModelForClass(Internship).updateOne(
      { _id: this.internship },
      { $inc: { applicationCount: 1 } }
    );
  }
})
@Pre<Intern>(
  "findOneAndDelete",
  async function () {
    // Get the filter used in the query
    const queryFilter = this.getFilter();

    // Retrieve the document manually using a properly typed model
    const doc = await getModelForClass(Intern).findOne(queryFilter);

    // Proceed with the update if the document exists
    if (doc) {
      await getModelForClass(Internship).updateOne(
        { _id: doc.internship },
        { $inc: { applicationCount: -1 } }
      );
    }
  },
  { query: true }
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
  @Property({ type: () => UserReferece })
  user: UserReferece;

  @Field(() => ObjectId)
  @Property({ ref: () => Internship })
  internship: Ref<Internship>;

  @Field(() => Status)
  @Property({ enum: Status, type: String, default: Status.Applied })
  status: Status;

  @Field(() => [String])
  @Property({ type: () => [String], default: [] })
  files: string[];

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
          ...(status ? { status } : {}),
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
    const { startYear, endYear } = getAcademicYearInterval();

    this.academicYear = `${startYear}/${endYear}`;
  }
})
@Index({ createdAt: 1, "user._id": 1 })
@ObjectType({ description: "Internship object type" })
export class Internship extends TimeStamps {
  @Field(() => ObjectId)
  id: ObjectId;

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

  @Field(() => UserReferece)
  @Property({ type: () => UserReferece })
  user: UserReferece;

  @Field(() => Intern, { nullable: true })
  myApplication?: Intern;

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
        },
      },
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
