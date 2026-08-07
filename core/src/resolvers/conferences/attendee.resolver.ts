import { ObjectId } from "mongodb";
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

import { Attendee, UserStubUnion } from "../../entitites/Attendee";
import { Conference } from "../../entitites/Conference";
import { Invoice } from "../../entitites/Invoice";
import { Submission } from "../../entitites/Submission";
import { ConferenceAttendeeService } from "../../services/conferences/conferenceAttendee.service";
import { I18nService } from "../../services/i18n.service";
import {
  AttendeeArgs,
  AttendeeConnection,
  AttendeeMutationResponse,
  InvoiceInput,
} from "../types/attendee.types";

@Service()
@Resolver(() => Attendee)
export class AttendeeResolver {
  constructor(
    private readonly attendeeService: ConferenceAttendeeService,
    private readonly i18nService: I18nService,
  ) {}

  @Authorized(["ADMIN"])
  @Query(() => AttendeeConnection)
  async attendees(@Args() args: AttendeeArgs): Promise<AttendeeConnection> {
    return await this.attendeeService.getAttendees(args);
  }

  @Authorized(["ADMIN"])
  @Query(() => Attendee)
  async attendee(@Arg("id") id: ObjectId) {
    return await this.attendeeService.getAttendee(id);
  }

  @Authorized(["ADMIN"])
  @Query(() => [Attendee])
  async textSearchAttendee(
    @Arg("text") text: string,
    @Arg("slug") slug: string,
  ) {
    return await this.attendeeService.searchAttendees(text, slug);
  }

  @Authorized(["ADMIN"])
  @Mutation(() => AttendeeMutationResponse)
  async updateInvoice(
    @Arg("id") id: ObjectId,
    @Arg("data") data: InvoiceInput,
  ): Promise<AttendeeMutationResponse> {
    const attendee = await this.attendeeService.updateInvoice(id, data);
    return {
      message: this.i18nService.translate("updateInvoice", {
        ns: "conference",
      }),
      data: attendee,
    };
  }

  @Authorized()
  @FieldResolver(() => Invoice)
  invoice(@Root() attendee: Attendee) {
    return this.attendeeService.getInvoice(attendee);
  }

  @Authorized(["ADMIN"])
  @Mutation(() => AttendeeMutationResponse)
  async deleteAttendee(
    @Arg("id") id: ObjectId,
  ): Promise<AttendeeMutationResponse> {
    const attendee = await this.attendeeService.deleteAttendee(id);
    return {
      data: attendee,
      message: this.i18nService.translate("deleteAttendee", {
        ns: "conference",
      }),
    };
  }

  @Authorized()
  @FieldResolver(() => UserStubUnion)
  async user(@Root() attendee: Attendee): Promise<typeof UserStubUnion> {
    return await this.attendeeService.getUser(attendee);
  }

  @Authorized()
  @FieldResolver(() => Conference)
  async conference(@Root() attendee: Attendee) {
    return await this.attendeeService.getConference(attendee);
  }

  @Authorized()
  @FieldResolver(() => [Submission])
  async submissions(@Root() attendee: Attendee) {
    return await this.attendeeService.getSubmissions(attendee);
  }
}
