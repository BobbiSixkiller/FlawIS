import {
  Arg,
  Args,
  Authorized,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { Service } from "typedi";
import { Attendee, AttendeeUserUnion } from "../entitites/Attendee";
import { I18nService } from "../services/i18nService";
import {
  AttendeeArgs,
  AttendeeConnection,
  AttendeeMutationResponse,
  InvoiceInput,
} from "./types/attendee";
import { transformIds } from "../middlewares/typegoose-middleware";
import { ObjectId } from "mongodb";
import { LoadResource } from "../util/decorators";
import { DocumentType } from "@typegoose/typegoose";
import { User } from "../entitites/User";
import { Submission } from "../entitites/Submission";
import { Conference } from "../entitites/Conference";
import { TypegooseService } from "../services/typegooseService";

@Service()
@Resolver(() => Attendee)
export class AttendeeResolver {
  constructor(
    private readonly attendeeService = new TypegooseService(Attendee),
    private readonly conferenceService = new TypegooseService(Conference),
    private readonly userService = new TypegooseService(User),
    private readonly submissionService = new TypegooseService(Submission),
    private readonly i18nService: I18nService
  ) {}

  @Authorized(["ADMIN"])
  @Query(() => AttendeeConnection)
  async attendees(@Args() args: AttendeeArgs): Promise<AttendeeConnection> {
    const data = await this.attendeeService.dataModel.paginatedAttendees(args);

    const connection: AttendeeConnection = data[0];

    return {
      totalCount: connection.totalCount || 0,
      pageInfo: connection.pageInfo || { hasNextPage: false },
      edges:
        connection.edges.map((edge) => ({
          cursor: edge.cursor,
          node: transformIds(edge.node),
        })) || [],
    };
  }

  @Authorized(["ADMIN"])
  @Query(() => [Attendee])
  async attendeesCsvExport(@Arg("slug") slug: string): Promise<Attendee[]> {
    return await this.attendeeService.findAll({ "conference.slug": slug });
  }

  @Authorized(["ADMIN"])
  @Query(() => Attendee)
  async attendee(
    @Arg("id") _id: ObjectId,
    @LoadResource(Attendee) attendee: DocumentType<Attendee>
  ) {
    return attendee;
  }

  @Authorized(["ADMIN"])
  @Query(() => [Attendee])
  async textSearchAttendee(
    @Arg("text") text: string,
    @Arg("slug") slug: string
  ) {
    // await this.attendeeService.dataModel.syncIndexes();

    return await this.attendeeService.aggregate([
      {
        $match: {
          $text: { $search: text },
          "conference.slug": slug, // Replace 'slug' with the variable holding the slug value
        },
      },
      { $sort: { score: { $meta: "textScore" } } },
      { $addFields: { id: "$_id", "user.id": "$user._id" } },
      { $limit: 10 },
    ]);
  }

  @Authorized(["ADMIN"])
  @Mutation(() => AttendeeMutationResponse)
  async updateInvoice(
    @Arg("id") _id: ObjectId,
    @Arg("data") data: InvoiceInput,
    @LoadResource(Attendee) attendee: DocumentType<Attendee>
  ): Promise<AttendeeMutationResponse> {
    attendee.invoice = data;

    await attendee.save();

    return {
      message: this.i18nService.translate("updateInvoice", {
        ns: "conference",
      }),
      data: attendee,
    };
  }

  @Authorized(["ADMIN"])
  @Mutation(() => AttendeeMutationResponse)
  async deleteAttendee(
    @Arg("id") _id: ObjectId,
    @LoadResource(Attendee) attendee: DocumentType<Attendee>
  ): Promise<AttendeeMutationResponse> {
    await this.attendeeService.delete({ _id: attendee.id });
    // await this.conferenceService.update(
    //   { slug: attendee.conference.slug },
    //   { $inc: { attendeesCount: -1 } }
    // );
    // await this.submissionService.update(
    //   { authors: attendee.user.id },
    //   { $pull: { authors: attendee.user.id } }
    // );

    return {
      data: attendee,
      message: this.i18nService.translate("deleteAttendee", {
        ns: "conference",
      }),
    };
  }

  @Authorized()
  @FieldResolver(() => AttendeeUserUnion)
  async user(
    @Root() { user: attendeeUser }: Attendee
  ): Promise<typeof AttendeeUserUnion> {
    const user = await this.userService.findOne({ _id: attendeeUser.id });
    if (user) {
      return user;
    } else {
      return attendeeUser;
    }
  }

  @Authorized()
  @FieldResolver(() => Conference)
  async conference(@Root() { conference: { id } }: Attendee) {
    return this.conferenceService.findOne({ _id: id });
  }

  @Authorized()
  @FieldResolver(() => [Submission])
  async submissions(
    @Root() { user: { id: userId }, conference: { id: conferenceId } }: Attendee
  ) {
    return await this.submissionService.findAll({
      conference: conferenceId,
      authors: userId,
    });
  }
}
