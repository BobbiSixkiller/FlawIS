import { Ref } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { prop as Property } from "@typegoose/typegoose";
import { ObjectId } from "mongodb";
import { Field, Int, ObjectType } from "type-graphql";
import { ModelType } from "@typegoose/typegoose/lib/types";
import {
  CourseArgs,
  CourseConnection,
  TermAttendeeArgs,
  TermAttendeeConnection,
} from "../resolvers/types/course";
import { FlawBilling } from "./Billing";
import { Invoice, UserStubUnion } from "./Attendee";
import { UserStub } from "./User";

@ObjectType()
export class Course extends TimeStamps {
  @Field(() => ObjectId)
  id: ObjectId;

  @Field()
  @Property()
  name: string;

  @Field(() => UserStubUnion)
  @Property({ type: () => UserStub })
  user: UserStub;

  @Field({
    description: "String representation of HTML describing the course",
  })
  @Property()
  description: string;

  @Field(() => FlawBilling)
  @Property({ type: () => FlawBilling, _id: false })
  billing: FlawBilling;

  @Field(() => Int)
  @Property()
  price: number;

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;

  public static async paginatedCourses(
    this: ModelType<Course>,
    { first, after }: CourseArgs
  ): Promise<CourseConnection> {
    const data = await this.aggregate([
      { $sort: { _id: -1 } },
      {
        $facet: {
          data: [
            { $match: { ...(after ? { _id: { $lt: after } } : {}) } },
            { $limit: first },
          ],
          hasNextPage: [
            { $match: { ...(after ? { _id: { $lt: after } } : {}) } },
            { $skip: first },
            { $limit: 1 },
          ],
          totalCount: [{ $count: "totalCount" }],
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

    if (data.length === 0) {
      return { edges: [], pageInfo: { hasNextPage: false }, totalCount: 0 };
    } else return data[0];
  }
}

@ObjectType()
export class Module extends TimeStamps {
  @Field(() => ObjectId)
  id: ObjectId;

  @Field(() => Course)
  @Property({ ref: () => Course })
  course: Ref<Course>;

  @Field()
  @Property()
  name: string;

  @Field({
    description:
      "String representation of HTML describing the module of the course",
  })
  @Property()
  description: string;

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
}

export class Term extends TimeStamps {
  @Field(() => ObjectId)
  id: ObjectId;

  @Field(() => Course)
  @Property({ ref: () => Course })
  course: Ref<Course>;

  @Field(() => Module, { nullable: true })
  @Property({ ref: () => Module })
  module?: Ref<Module>;

  @Field()
  @Property()
  start: Date;

  @Field()
  @Property()
  end: Date;

  @Field(() => Int)
  @Property()
  maxAttendees: number;

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
}

export class TermAttendee extends TimeStamps {
  @Field(() => UserStubUnion)
  @Property({ type: () => UserStub })
  user: UserStub;

  @Field(() => Term)
  @Property({ ref: () => Term })
  term: Ref<Term>;

  @Field(() => Invoice, { nullable: true })
  @Property({ type: () => Invoice, _id: false })
  invoice?: Invoice;

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;

  public static async paginatedTermAttendees(
    this: ModelType<TermAttendee>,
    { termId, first, after }: TermAttendeeArgs
  ): Promise<TermAttendeeConnection> {
    const data = await this.aggregate([
      { $match: { term: termId } },
      { $sort: { _id: -1 } },
      {
        $facet: {
          data: [
            { $match: { ...(after ? { _id: { $lt: after } } : {}) } },
            { $limit: first },
            { $addFields: { id: "$_id" } },
          ],
          hasNextPage: [
            { $match: { ...(after ? { _id: { $lt: after } } : {}) } },
            { $skip: first },
            { $limit: 1 },
          ],
          totalCount: [{ $count: "totalCount" }],
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

    if (data.length === 0) {
      return { edges: [], totalCount: 0, pageInfo: { hasNextPage: false } };
    } else {
      return data[0];
    }
  }
}
