import { DocumentType } from "@typegoose/typegoose";
import { ObjectId } from "mongodb";
import {
  Arg,
  Args,
  Authorized,
  Ctx,
  FieldResolver,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { Service } from "typedi";
import { Attendee } from "../entities/Attendee";
import { Conference } from "../entities/Conference";
import { Section } from "../entities/Section";
import { User } from "../entities/User";
import { CRUDservice } from "../services/CRUDservice";
import { Context } from "../util/auth";
import { LoadResource } from "../util/decorators";
import { localizeInput, localizeOutput } from "../util/locale";
import { ObjectIdScalar } from "../util/scalars";
import { AttendeeArgs, AttendeeConnection } from "./types/attendee";
import {
  ConferenceConnection,
  ConferenceInput,
  TicketInput,
} from "./types/conference";
import { ConferenceUserInput } from "./types/user";

@Service()
@Resolver(() => Conference)
export class ConferenceResolver {
  constructor(
    private readonly conferenceService = new CRUDservice(Conference),
    private readonly sectionService = new CRUDservice(Section),
    private readonly attendeeService = new CRUDservice(Attendee),
    private readonly userService = new CRUDservice(User)
  ) {}

  @Query(() => Conference)
  async conference(@Arg("slug") slug: string): Promise<Conference> {
    const conference = await this.conferenceService.findOne({ slug });
    if (!conference) throw new Error("Conference not found!");

    return conference;
  }

  @Query(() => ConferenceConnection)
  async conferences(
    @Arg("year", () => Int) year: number,
    @Ctx() { locale }: Context
  ) {
    await this.conferenceService.dataModel.syncIndexes();
    const data = await this.conferenceService.aggregate([
      { $sort: { _id: -1 } },
      {
        $facet: {
          data: [
            {
              $match: {
                $expr: { $eq: [{ $year: "$dates.start" }, year] },
              },
            },
            { $addFields: { id: "$_id" } },
          ],
          hasNextDoc: [
            {
              $match: {
                $expr: { $lt: [{ $year: "$dates.start" }, year] },
              },
            },
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
          year: { $year: { $last: "$data.dates.start" } },
        },
      },
    ]);

    if (data[0].edges.length === 0) {
      throw new Error("No conferences found!");
    }

    data[0].edges = data[0].edges.map((e: any) => ({
      cursor: e.cursor,
      node: localizeOutput(e.node, e.node.translations, locale),
    }));

    return data[0] as ConferenceConnection;
  }

  @Authorized(["ADMIN"])
  @Mutation(() => Conference)
  async createConference(
    @Arg("data") conferenceInput: ConferenceInput,
    @Ctx() { locale }: Context
  ): Promise<Conference> {
    return await this.conferenceService.create(
      localizeInput(conferenceInput, conferenceInput.translations, locale)
    );
  }

  @Authorized(["ADMIN"])
  @Mutation(() => Conference)
  async addTicket(
    @Arg("data") ticketInput: TicketInput,
    @Arg("id") _id: ObjectId,
    @Ctx() { locale }: Context,
    @LoadResource(Conference) conference: DocumentType<Conference>
  ) {
    conference.tickets.push(
      localizeInput(ticketInput, ticketInput.translations, locale)
    );

    return await conference.save();
  }

  @Authorized(["ADMIN"])
  @Mutation(() => Conference)
  async removeTicket(
    @Arg("ticketId") ticketId: ObjectId,
    @Arg("id") _id: ObjectId,
    @LoadResource(Conference) conference: DocumentType<Conference>
  ) {
    const ticket = conference.tickets.find(
      (t) => t.id.toString() === ticketId.toString()
    );
    if (!ticket) throw new Error("Ticket not found!");

    conference.tickets = conference.tickets.filter((t) => t !== ticket);

    return await conference.save();
  }

  @Authorized(["ADMIN"])
  @Mutation(() => Conference)
  async updateConference(
    @Arg("id", () => ObjectIdScalar) _id: ObjectId,
    @Arg("data") conferenceInput: ConferenceInput,
    @LoadResource(Conference) conference: DocumentType<Conference>,
    @Ctx() { locale }: Context
  ) {
    for (const [key, value] of Object.entries(
      localizeInput(conferenceInput, conferenceInput.translations, locale)
    )) {
      conference[key as keyof ConferenceInput] = value as any;
    }

    return await conference.save();
  }

  @Authorized(["ADMIN"])
  @Mutation(() => Boolean)
  async deleteConference(@Arg("id") id: ObjectId): Promise<boolean> {
    const { deletedCount } = await this.conferenceService.deleteOne({
      _id: id,
    });
    return deletedCount > 0;
  }

  @Authorized()
  @Mutation(() => User, { nullable: true })
  async updateConferenceUser(
    @Arg("data") userInput: ConferenceUserInput,
    @Ctx() { user }: Context
  ) {
    const conferenceUser = await this.userService.findOne({ _id: user?.id });
    if (conferenceUser) {
      for (const [key, value] of Object.entries(userInput)) {
        conferenceUser[key as keyof ConferenceUserInput] = value;
      }

      return await conferenceUser?.save();
    }
  }

  @FieldResolver(() => [Section])
  async sections(@Root() { sections }: Conference): Promise<Section[]> {
    return await this.sectionService.findAll({ _id: sections });
  }

  @Authorized()
  @FieldResolver(() => AttendeeConnection)
  async attendees(
    @Args() { after, first, sectionIds, passive }: AttendeeArgs,
    @Root() { id }: Conference
  ): Promise<AttendeeConnection> {
    const attendees = await this.attendeeService.aggregate([
      { $match: { conference: id } },
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
                    { $in: ["$$user", "$authors"] },
                    { $eq: ["$conference", "$$conference"] },
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
            { $sort: { _id: -1 } },
            { $limit: first || 20 },
            {
              $addFields: {
                id: "$_id", //transform _id to id property as defined in GraphQL object types
              },
            },
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
            { $sort: { _id: -1 } },
            { $skip: first || 20 }, // skip paginated data
            { $limit: 1 }, // just to check if there's any element
            { $count: "totalNext" },
          ],
        },
      },
      {
        $unwind: { path: "$hasNextPage", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          edges: {
            $map: {
              input: "$data",
              as: "edge",
              in: { cursor: "$$edge._id", node: "$$edge" },
            },
          },
          pageInfo: {
            hasNextPage: { $gt: ["$hasNextPage.totalNext", 0] },
            endCursor: { $last: "$data.id" },
          },
        },
      },
    ]);

    return attendees[0] as unknown as AttendeeConnection;
  }

  @FieldResolver(() => Attendee, { nullable: true })
  async attending(@Root() { id }: Conference, @Ctx() { user }: Context) {
    return await this.attendeeService.findOne({
      conference: id,
      user: user?.id,
    });
  }

  @FieldResolver(() => Boolean)
  async isAdmin(@Ctx() { user }: Context) {
    return user?.role === "ADMIN";
  }
}
