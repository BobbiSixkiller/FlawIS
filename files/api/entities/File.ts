import { Directive, Field, ObjectType } from "type-graphql";
import { ObjectId } from "mongodb";
import { prop as Property } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { FileType } from "../resolvers.ts/types/file";
import { ReturnModelType } from "@typegoose/typegoose/lib/types";

@Directive("@extends")
@Directive(`@key(fields: "id")`)
@ObjectType()
export default class User {
  @Directive("@external")
  @Property()
  @Field(() => ObjectId)
  id: ObjectId;

  @Field()
  @Property()
  email: string;
}

@ObjectType()
export class File extends TimeStamps {
  @Field(() => ObjectId)
  id: ObjectId;

  @Field()
  @Property()
  name: string;

  @Field()
  @Property()
  url: string;

  // @Directive(`@provides(fields: "email")`)
  @Field(() => User)
  @Property({ type: () => User, _id: false })
  user: User;

  @Field(() => FileType)
  @Property()
  type: FileType;

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;

  public static async paginatedFiles(
    this: ReturnModelType<typeof File>,
    first: number,
    after?: ObjectId
  ) {
    return await this.aggregate([
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
            { $addFields: { id: "$_id" } },
          ],
          hasNextDoc: [
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
            { $skip: first || 20 },
            { $limit: 1 },
          ],
        },
      },
      {
        $project: {
          edges: {
            $map: {
              input: "$data",
              as: "doc",
              in: { cursor: "$$doc._id", node: "$$doc" },
            },
          },
          pageInfo: {
            endCursor: { $last: "$data._id" },
            hasNextPage: { $eq: [{ $size: "$hasNextDoc" }, 1] },
          },
        },
      },
    ]);
  }
}
