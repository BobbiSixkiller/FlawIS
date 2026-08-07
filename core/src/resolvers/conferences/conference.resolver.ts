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

import {
  Conference,
  ConferenceTranslation,
  TicketTranslation,
} from "../../entitites/Conference";
import { Attendee } from "../../entitites/Attendee";
import { Section } from "../../entitites/Section";
import { ConferenceService } from "../../services/conferences/conference.service";
import { ConferenceAttendeeService } from "../../services/conferences/conferenceAttendee.service";
import { I18nService } from "../../services/i18n.service";
import { Context } from "../../util/auth";
import { AttendeeInput } from "../types/attendee.types";
import {
  ConferenceArgs,
  ConferenceConnection,
  ConferenceInput,
  ConferenceMutationResponse,
  DatesInput,
  TicketInput,
} from "../types/conference.types";

@Service()
@Resolver(() => Conference)
export class ConferenceResolver {
  constructor(
    private readonly conferenceService: ConferenceService,
    private readonly conferenceAttendeeService: ConferenceAttendeeService,
    private readonly i18nService: I18nService,
  ) {}

  @Query(() => ConferenceConnection)
  async conferences(
    @Args() args: ConferenceArgs,
  ): Promise<ConferenceConnection> {
    return await this.conferenceService.getConferences(args);
  }

  @Authorized()
  @Query(() => Conference)
  async conference(@Arg("slug") slug: string) {
    return await this.conferenceService.getConference(slug);
  }

  @Authorized(["ADMIN"])
  @Query(() => [Conference])
  async textSearchConference(@Arg("text") text: string) {
    return await this.conferenceService.searchConferences(text);
  }

  @Authorized(["ADMIN"])
  @Mutation(() => ConferenceMutationResponse)
  async createConference(
    @Arg("data") data: ConferenceInput,
  ): Promise<ConferenceMutationResponse> {
    const conference = await this.conferenceService.createConference(data);
    return {
      data: conference,
      message: this.i18nService.translate("new", {
        ns: "conference",
        name: conference.translations[
          this.i18nService.language() as keyof ConferenceTranslation
        ].name,
      }),
    };
  }

  @Authorized(["ADMIN"])
  @Mutation(() => ConferenceMutationResponse)
  async deleteConference(
    @Arg("id") id: ObjectId,
  ): Promise<ConferenceMutationResponse> {
    const conference = await this.conferenceService.deleteConference(id);
    return {
      data: conference,
      message: this.i18nService.translate("delete", {
        ns: "conference",
        name: conference.translations[
          this.i18nService.language() as keyof ConferenceTranslation
        ].name,
      }),
    };
  }

  @Authorized(["ADMIN"])
  @Mutation(() => ConferenceMutationResponse)
  async updateConferenceDates(
    @Arg("slug") slug: string,
    @Arg("data") data: DatesInput,
  ): Promise<ConferenceMutationResponse> {
    const conference = await this.conferenceService.updateConferenceDates(
      slug,
      data,
    );
    return {
      data: conference,
      message: this.i18nService.translate("update", {
        ns: "conference",
        name: conference.translations[
          this.i18nService.language() as keyof ConferenceTranslation
        ].name,
      }),
    };
  }

  @Authorized()
  @FieldResolver(() => Attendee, { nullable: true })
  async attending(@Ctx() { user }: Context, @Root() { id }: Conference) {
    return await this.conferenceAttendeeService.getAttending(id, user!.id);
  }

  @Authorized()
  @FieldResolver(() => [Section])
  async sections(@Root() { id }: Conference) {
    return await this.conferenceService.getSections(id);
  }

  @FieldResolver(() => Int)
  async attendeesCount(@Root() { id }: Conference) {
    return await this.conferenceService.getAttendeesCount(id);
  }

  @Authorized(["ADMIN"])
  @Mutation(() => ConferenceMutationResponse)
  async createTicket(
    @Arg("slug") slug: string,
    @Arg("data") data: TicketInput,
  ): Promise<ConferenceMutationResponse> {
    const conference = await this.conferenceService.createTicket(slug, data);
    return {
      data: conference,
      message: this.i18nService.translate("new", {
        ns: "ticket",
        name: data.translations[
          this.i18nService.language() as keyof TicketTranslation
        ].name,
      }),
    };
  }

  @Authorized(["ADMIN"])
  @Mutation(() => ConferenceMutationResponse)
  async updateTicket(
    @Arg("slug") slug: string,
    @Arg("ticketId") ticketId: ObjectId,
    @Arg("data") data: TicketInput,
  ): Promise<ConferenceMutationResponse> {
    const { conference, ticket } = await this.conferenceService.updateTicket(
      slug,
      ticketId,
      data,
    );
    return {
      data: conference,
      message: this.i18nService.translate("update", {
        ns: "ticket",
        name: ticket.translations[
          this.i18nService.language() as keyof TicketTranslation
        ].name,
      }),
    };
  }

  @Authorized(["ADMIN"])
  @Mutation(() => ConferenceMutationResponse)
  async deleteTicket(
    @Arg("slug") slug: string,
    @Arg("ticketId") ticketId: ObjectId,
  ): Promise<ConferenceMutationResponse> {
    const { conference, ticket } = await this.conferenceService.deleteTicket(
      slug,
      ticketId,
    );
    return {
      data: conference,
      message: this.i18nService.translate("delete", {
        ns: "ticket",
        name: ticket.translations[
          this.i18nService.language() as keyof TicketTranslation
        ].name,
      }),
    };
  }

  @Authorized()
  @Mutation(() => ConferenceMutationResponse)
  async addAttendee(
    @Arg("data") data: AttendeeInput,
    @Ctx() { user, locale, req }: Context,
  ): Promise<ConferenceMutationResponse> {
    const hostname = req.headers["tenant-domain"] as string;
    const conference =
      await this.conferenceAttendeeService.registerAttendee(
        data,
        user!,
        locale,
        hostname,
      );
    return {
      data: conference,
      message: this.i18nService.translate("newAttendee", {
        ns: "conference",
        name: conference.translations[
          this.i18nService.language() as keyof ConferenceTranslation
        ].name,
      }),
    };
  }
}
