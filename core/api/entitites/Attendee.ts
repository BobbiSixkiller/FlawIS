import {
  getModelForClass,
  Index,
  pre,
  prop as Property,
} from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { Field, Float, ObjectType, createUnionType } from "type-graphql";
import { ObjectId } from "mongodb";

import { Billing, ConferenceBilling } from "./Billing";

import { Conference, Ticket } from "./Conference";
import { Submission } from "./Submission";
import { ModelType } from "@typegoose/typegoose/lib/types";
import { User } from "./User";
import { AttendeeArgs } from "../resolvers/types/attendee";

export const AttendeeUserUnion = createUnionType({
  name: "AttendeeUserUnion", // Name of the GraphQL union
  types: () => [User, AttendeeUser] as const, // function that returns tuple of object types classes
  // Implementation of detecting returned object type
  resolveType: (value) => {
    if ("organization" in value) {
      return User; // Return object type class (the one with `@ObjectType()`)
    } else {
      return AttendeeUser;
    }
  },
});

@ObjectType({ description: "The body of an invoice" })
export class InvoiceData {
  @Field()
  @Property({ default: "Faktúra" })
  type?: String;

  @Field()
  @Property({ default: Date.now() })
  issueDate?: Date;

  @Field()
  @Property({ default: Date.now() })
  vatDate?: Date;

  @Field()
  @Property({ default: new Date().setDate(new Date().getDate() + 30) })
  dueDate?: Date;

  @Field(() => Float)
  @Property()
  price: Number;

  @Field(() => Float)
  @Property()
  vat: Number;

  @Field()
  @Property()
  body: String;

  @Field()
  @Property()
  comment: String;
}

@ObjectType({ description: "Invoice entity subdocument type" })
export class Invoice {
  @Field(() => Billing)
  @Property({ type: () => Billing, _id: false })
  payer: Billing;

  @Field(() => ConferenceBilling)
  @Property({ type: () => ConferenceBilling, _id: false })
  issuer: ConferenceBilling;

  @Field(() => InvoiceData)
  @Property({ type: () => InvoiceData, _id: false })
  body: InvoiceData;
}

@ObjectType()
export class AttendeeUser {
  @Field()
  id: ObjectId;

  @Field()
  @Property()
  name: string;

  @Field()
  @Property()
  email: string;
}

@ObjectType()
export class AttendeeConference {
  @Field()
  id: ObjectId;

  @Field()
  @Property()
  slug: string;
}

@pre<Attendee>("save", async function () {
  if (this.isNew) {
    await getModelForClass(Conference).updateOne(
      { slug: this.conference.slug },
      { $inc: { attendeesCount: 1 } }
    );
  }
})
@ObjectType({ description: "Attendee model type" })
@Index({ "user.name": "text", "user.email": "text" })
@Index({ "conference.slug": 1, _id: -1 }) //attendees query
@Index({ "user._id": 1, "conference.slug": 1 }) //attendee query
export class Attendee extends TimeStamps {
  @Field(() => ObjectId)
  id: ObjectId;

  @Field(() => Conference)
  @Property({ type: () => AttendeeConference })
  conference: AttendeeConference;

  @Field(() => AttendeeUserUnion)
  @Property({ type: () => AttendeeUser })
  user: AttendeeUser;

  @Field(() => Ticket)
  @Property({ type: () => Ticket })
  ticket: Ticket;

  //invoice subdoc added so individual invoice customization is possible
  @Field(() => Invoice)
  @Property({ type: () => Invoice, _id: false })
  invoice: Invoice;

  @Field(() => [Submission])
  submissions: Submission[];

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;

  public static async paginatedAttendees(
    this: ModelType<Attendee>,
    { conferenceSlug, sectionIds, first, after, passive }: AttendeeArgs
  ) {
    return await this.aggregate([
      { $sort: { _id: -1 } },
      {
        $facet: {
          data: [
            { $match: { "conference.slug": conferenceSlug } },
            {
              $lookup: {
                from: "submissions",
                let: {
                  conference: "$conference",
                  user: "$user",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $in: ["$$user._id", "$authors"] },
                          { $eq: ["$conference", "$$conference._id"] },
                        ],
                      },
                    },
                  },
                ],
                as: "submissions",
              },
            },
            {
              $match: {
                $expr: {
                  $cond: {
                    if: {
                      $or: [
                        { $ne: [{ $size: [sectionIds] }, 0] },
                        { $eq: [passive, true] },
                      ],
                    },
                    then: {
                      $or: [
                        {
                          $and: [
                            { $ne: [{ $size: [sectionIds] }, 0] }, // Include documents with specific submissions
                            {
                              $anyElementTrue: {
                                $map: {
                                  input: "$submissions",
                                  as: "nested",
                                  in: {
                                    $in: ["$$nested.section", sectionIds], // Complex condition involving nested array
                                  },
                                },
                              },
                            },
                          ],
                        },
                        {
                          $and: [
                            { $eq: [passive, true] }, // Include documents with empty submissions
                            { $eq: [{ $size: "$submissions" }, 0] },
                          ],
                        },
                      ],
                    },
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
            { $match: { "conference.slug": conferenceSlug } },
            {
              $lookup: {
                from: "submissions",
                let: {
                  conference: "$conference",
                  user: "$user",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $in: ["$$user._id", "$authors"] },
                          { $eq: ["$conference", "$$conference._id"] },
                        ],
                      },
                    },
                  },
                ],
                as: "submissions",
              },
            },
            {
              $match: {
                $expr: {
                  $cond: {
                    if: {
                      $or: [
                        { $ne: [{ $size: [sectionIds] }, 0] },
                        { $eq: [passive, true] },
                      ],
                    },
                    then: {
                      $or: [
                        {
                          $and: [
                            { $ne: [{ $size: [sectionIds] }, 0] }, // Include documents with specific submissions
                            {
                              $anyElementTrue: {
                                $map: {
                                  input: "$submissions",
                                  as: "nested",
                                  in: {
                                    $in: ["$$nested.section", sectionIds], // Complex condition involving nested array
                                  },
                                },
                              },
                            },
                          ],
                        },
                        {
                          $and: [
                            { $eq: [passive, true] }, // Include documents with empty submissions
                            { $eq: [{ $size: "$submissions" }, 0] },
                          ],
                        },
                      ],
                    },
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
