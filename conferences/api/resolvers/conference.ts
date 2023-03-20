import { UserInputError } from "apollo-server";
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
import { Attendee, AttendeeConnection } from "../entities/Attendee";
import { Conference } from "../entities/Conference";
import { Section } from "../entities/Section";
import { User } from "../entities/User";
import { CRUDservice } from "../services/CRUDservice";
import { Context } from "../util/auth";
import { localizeInput, localizeOutput } from "../util/locale";
import { ObjectIdScalar } from "../util/scalars";
import { AttendeeArgs } from "./types/attendee";
import { ConferenceConnection, ConferenceInput } from "./types/conference";
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
    if (!conference) throw new UserInputError("Conference not found!");

    return conference;
  }

  @Query(() => ConferenceConnection)
  async conferences(
    @Arg("year", () => Int) year: number,
    @Ctx() { locale, user }: Context
  ) {
    console.log(user, locale);
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
  async updateConference(
    @Arg("id", () => ObjectIdScalar) id: ObjectId,
    @Arg("data") conferenceInput: ConferenceInput,
    @Ctx() { locale }: Context
  ) {
    const conference = await this.conferenceService.findOne({ _id: id });
    if (!conference) throw new UserInputError("Conference not found!");

    for (const [key, value] of Object.entries(
      localizeInput(conferenceInput, conferenceInput.translations, locale)
    )) {
      conference[key as keyof Conference] = value;
    }

    return await conference.save();
  }

  @Authorized(["ADMIN"])
  @Mutation(() => Boolean)
  async deleteConference(@Arg("id") id: ObjectId): Promise<boolean> {
    const { deletedCount } = await this.conferenceService.delete({ _id: id });
    return deletedCount > 0;
  }

  @Authorized()
  @Mutation(() => User)
  async updateConferenceUser(
    @Arg("data") userInput: ConferenceUserInput,
    @Ctx() { user }: Context
  ) {
    const conferenceUser = await this.userService.findOne({ _id: user?.id });
    if (!conferenceUser) throw new Error("Accout has been deleted!");

    for (const [key, value] of Object.entries(userInput)) {
      conferenceUser[key as keyof User] = value;
    }

    return await conferenceUser.save();
  }

  @Authorized()
  @FieldResolver(() => [Section])
  async sections(@Root() { id }: Conference): Promise<Section[]> {
    return await this.sectionService.findAll({ conference: id });
  }

  @Authorized()
  @FieldResolver(() => AttendeeConnection)
  async attendees(
    @Args() { after, first }: AttendeeArgs,
    @Root() { id }: Conference
  ): Promise<AttendeeConnection> {
    const attendees = await this.attendeeService.aggregate([
      { $match: { conference: id } },
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

  @Authorized()
  @FieldResolver(() => Boolean)
  async attending(
    @Root() { id }: Conference,
    @Ctx() { user }: Context
  ): Promise<boolean> {
    return (
      (await this.attendeeService.exists({
        conference: id,
        "user.id": user!.id,
      })) !== null
    );
  }

  @Authorized()
  @FieldResolver(() => Int)
  async attendeesCount(
    @Root() { id }: Conference,
    @Ctx() { user }: Context
  ): Promise<number> {
    return await this.attendeeService.dataModel.countDocuments({
      conference: id,
      "user.id": user!.id,
    });
  }
}
