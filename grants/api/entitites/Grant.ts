import {
  Index,
  prop as Property,
  Ref,
  ReturnModelType,
} from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { ObjectId } from "mongodb";
import { Field, ID, Int, ObjectType, registerEnumType } from "type-graphql";
import { Announcement } from "./Announcement";
import { User } from "./User";

export enum GrantType {
  APVV = "APVV",
  VEGA = "VEGA",
  KEGA = "KEGA",
}

registerEnumType(GrantType, {
  name: "GrantType", // this one is mandatory
  description: "Type of grants inside the FLAWIS system", // this one is optional
});

@ObjectType({ description: "Member schema type" })
export class Member extends TimeStamps {
  @Field(() => User)
  @Property({ ref: () => User })
  user: Ref<User>;

  @Field(() => Boolean)
  @Property()
  isMain: boolean;

  @Field()
  @Property()
  hours: Number;

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
}

@ObjectType()
class Approved {
  @Field(() => Int)
  @Property()
  travel: Number;

  @Field(() => Int)
  @Property()
  material: Number;

  @Field(() => Int)
  @Property()
  services: Number;

  @Field(() => Int)
  @Property()
  indirect: Number;

  @Field(() => Int)
  @Property()
  salaries: Number;
}

@ObjectType()
class Spent {
  @Field(() => Int)
  @Property()
  travel: Number;

  @Field(() => Int)
  @Property()
  material: Number;

  @Field(() => Int)
  @Property()
  services: Number;

  @Field(() => Int)
  @Property()
  indirect: Number;

  @Field(() => Int)
  @Property()
  salaries: Number;
}

@ObjectType({ description: "Budget schema type" })
export class Budget extends TimeStamps {
  @Field()
  @Property()
  year: Date;

  @Field(() => Approved)
  @Property({ type: () => Approved, _id: false })
  approved: Approved;

  @Field(() => Spent, { nullable: true })
  @Property({ type: () => Spent, _id: false })
  spent?: Spent;

  @Field(() => [Member], { nullable: "items" })
  @Property({ type: () => Member, _id: false, default: [] })
  members: Member[];

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
}

@Index({ name: "text" })
@ObjectType({ description: "Grant model type" })
export class Grant extends TimeStamps {
  @Field(() => ID)
  id: ObjectId;

  @Field()
  @Property()
  name: string;

  @Field(() => GrantType)
  @Property({ enum: GrantType })
  type: GrantType;

  @Field()
  @Property()
  start: Date;

  @Field()
  @Property()
  end: Date;

  @Field(() => [Announcement], { nullable: "items" })
  @Property({ ref: () => Announcement })
  announcements: Ref<Announcement>[];

  @Field(() => [Budget], { nullable: "items" })
  @Property({ type: () => [Budget], _id: false, default: [] })
  budgets: Budget[];

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;

  public static async paginatedGrants(
    this: ReturnModelType<typeof Grant>,
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
