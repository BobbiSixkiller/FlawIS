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
import { Attendee } from "../entitites/Attendee";
import { CRUDservice } from "../services/CRUDservice";
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

@Service()
@Resolver(() => Attendee)
export class AttendeeResolver {
  constructor(
    private readonly attendeeService = new CRUDservice(Attendee),
    private readonly conferenceService = new CRUDservice(Conference),
    private readonly userService = new CRUDservice(User),
    private readonly submissionService = new CRUDservice(Submission),
    private readonly i18nService: I18nService
  ) {}

  @Authorized(["ADMIN"])
  @Query(() => AttendeeConnection)
  async attendees(
    @Args() { first, after, conferenceSlug }: AttendeeArgs
  ): Promise<AttendeeConnection> {
    const data = await this.attendeeService.dataModel.paginatedAttendees(
      conferenceSlug,
      first,
      after
    );

    const connection: AttendeeConnection = data[0];

    return {
      pageInfo: connection.pageInfo,
      edges: connection.edges.map((e) => ({
        cursor: e.cursor,
        node: transformIds(e.node),
      })),
    };
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
    await this.conferenceService.update(
      { slug: attendee.conference.slug },
      { $inc: { attendeesCount: -1 } }
    );

    return {
      data: attendee,
      message: this.i18nService.translate("deleteAttendee", {
        ns: "conference",
      }),
    };
  }

  @Authorized()
  @FieldResolver(() => User)
  async user(@Root() { user: { id } }: Attendee) {
    return this.userService.findOne({ _id: id });
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
    return this.submissionService.findAll({
      conference: conferenceId,
      authors: userId,
    });
  }
}
