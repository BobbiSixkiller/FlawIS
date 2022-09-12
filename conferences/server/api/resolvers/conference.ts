import { UserInputError } from "apollo-server";
import { ObjectId } from "mongodb";
import {
  Arg,
  Args,
  Authorized,
  Ctx,
  Field,
  FieldResolver,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { Service } from "typedi";
import { Attendee, AttendeeConnection } from "../entitites/Attendee";
import { Conference } from "../entitites/Conference";
import { Section } from "../entitites/Section";
import { CRUDservice } from "../services/CRUDservice";
import { Context } from "../util/auth";
import { localizeInput } from "../util/locale";
import { ObjectIdScalar } from "../util/scalars";
import { transformIds } from "../util/typegoose-middleware";
import { AttendeeArgs } from "./types/attendee";
import { ConferenceInput } from "./types/conference";

@Service()
@Resolver(() => Conference)
export class ConferenceResolver {
  constructor(
    private readonly conferenceService = new CRUDservice(Conference),
    private readonly sectionService = new CRUDservice(Section),
    private readonly attendeeService = new CRUDservice(Attendee)
  ) {}

  @Query(() => Conference)
  async conference(@Arg("slug") slug: string): Promise<Conference> {
    const conference = await this.conferenceService.findOne({ slug });
    if (!conference) throw new UserInputError("Conference not found!");

    return conference;
  }

  @Query(() => [Conference])
  async conferences(@Arg("year") year: Date): Promise<Conference[]> {
    return await this.conferenceService.findAll(
      {
        $expr: { $eq: [{ $year: "$start" }, year.getFullYear()] },
      },
      {},
      { sort: { _id: -1 } }
    );
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

  @Authorized()
  @FieldResolver(() => [Section])
  async sections(@Root() { id }: Conference): Promise<Section[]> {
    return await this.sectionService.findAll({ conference: id });
  }

  //refactor from freshsquare products mongo aggregation query
  @Authorized()
  @FieldResolver(() => AttendeeConnection)
  async attendees(
    @Args() { after, first, before, last }: AttendeeArgs,
    @Root() { id }: Conference,
    @Ctx() { user }: Context
  ): Promise<AttendeeConnection> {
    const attendees = await this.attendeeService.aggregate([
      {
        $match: {
          conference: id,
          $expr: {
            $cond: [
              { $and: [{ $eq: [after, null] }, { $eq: [before, null] }] },
              { $ne: ["$_id", null] },
              {
                $cond: [
                  { $ne: [after, null] },
                  { $lt: ["$_id", after] },
                  { $gt: ["$_id", before] },
                ],
              },
            ],
          },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: first || last || 20 },
    ]);

    const [hasNextPage, hasPreviousPage] = await Promise.all([
      this.attendeeService.exists({
        _id: { $gt: attendees[0]?._id },
      }),
      this.attendeeService.exists({
        _id: { $lt: attendees[attendees.length - 1]?._id },
      }),
    ]);

    return {
      edges: attendees.map((attendee) => ({
        cursor: attendee?._id,
        node: transformIds(attendee),
      })),
      pageInfo: {
        startCursor: attendees[0]?._id,
        hasPreviousPage: hasPreviousPage !== null,
        endCursor: attendees[attendees.length - 1]?._id,
        hasNextPage: hasNextPage !== null,
      },
    };
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
