import { Ref } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { prop as Property } from "@typegoose/typegoose";
import { ObjectId } from "mongodb";
import { Field, Int, ObjectType } from "type-graphql";
import { ModelType } from "@typegoose/typegoose/lib/types";
import { CourseArgs, CourseConnection } from "../resolvers/types/course";

@ObjectType()
export class Course extends TimeStamps {
  @Field(() => ObjectId)
  id: ObjectId;

  @Field()
  name: string;

  @Field({
    description: "String representation of HTML describing the course",
  })
  description: string;

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
      { $match: { ...(after && { _id: { $lt: after } }) } },
      {
        $facet: {
          data: [{ $limit: first }],
          hasNextPage: [{ $skip: first }, { $limit: 1 }],
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
  name: string;

  @Field({
    description:
      "String representation of HTML describing the module of the course",
  })
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

  @Field(() => Module)
  @Property({ ref: () => Module })
  module: Ref<Module>;

  @Field()
  start: Date;

  @Field()
  end: Date;

  @Field(() => Int)
  maxUsers: number;

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
}
