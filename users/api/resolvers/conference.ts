import {
  Arg,
  Args,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { Service } from "typedi";
import { CRUDservice } from "../services/CRUDservice";
import {
  Conference,
  ConferenceTranslation,
  Ticket,
  TicketTranslation,
} from "../entitites/Conference";
import { I18nService } from "../services/i18nService";
import {
  ConferenceArgs,
  ConferenceConnection,
  ConferenceInput,
  ConferenceMutationResponse,
  DatesInput,
  TicketInput,
} from "./types/conference";
import { ObjectId } from "mongodb";
import { LoadResource } from "../util/decorators";
import { DocumentType } from "@typegoose/typegoose";

import { Context } from "../util/auth";
import { Attendee } from "../entitites/Attendee";
import { Section } from "../entitites/Section";
import { transformIds } from "../middlewares/typegoose-middleware";

@Service()
@Resolver(() => Conference)
export class ConferencerResolver {
  constructor(
    private readonly conferenceService = new CRUDservice(Conference),
    private readonly sectionService = new CRUDservice(Section),
    private readonly attendeeService = new CRUDservice(Attendee),
    private readonly i18nService: I18nService
  ) {}

  @Authorized()
  @Query(() => ConferenceConnection)
  async conferences(
    @Args() { first, after }: ConferenceArgs
  ): Promise<ConferenceConnection> {
    const data = await this.conferenceService.dataModel.paginatedConferences(
      first,
      after
    );

    const connection: ConferenceConnection = data[0];
    console.log(connection.edges);

    return {
      pageInfo: connection.pageInfo,
      edges: connection.edges.map((e) => ({
        cursor: e.cursor,
        node: transformIds(e.node),
      })),
    };
  }

  @Authorized()
  @Query(() => Conference)
  async conference(
    @Arg("slug") _slug: string,
    @LoadResource(Conference) conference: DocumentType<Conference>
  ) {
    return conference;
  }

  @Authorized(["ADMIN"])
  @Query(() => [Conference])
  async textSearchConference(@Arg("text") text: string) {
    return await this.conferenceService.aggregate([
      { $match: { $text: { $search: text } } },
      { $sort: { score: { $meta: "textScore" } } },
      { $addFields: { id: "$_id" } },
      { $limit: 10 },
    ]);
  }

  @Authorized(["ADMIN"])
  @Mutation(() => ConferenceMutationResponse)
  async createConference(
    @Arg("data") data: ConferenceInput
  ): Promise<ConferenceMutationResponse> {
    const conference = await this.conferenceService.create(data);

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
    @Arg("id") _id: ObjectId,
    @LoadResource(Conference) conference: DocumentType<Conference>
  ): Promise<ConferenceMutationResponse> {
    await this.conferenceService.delete({ _id: conference.id });

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
    @Arg("slug") _slug: string,
    @Arg("data") data: DatesInput,
    @LoadResource(Conference) conference: DocumentType<Conference>
  ): Promise<ConferenceMutationResponse> {
    conference.dates = data;

    await conference.save();

    console.log(conference.dates);

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
    return await this.attendeeService.findOne({
      conference: id,
      user: user?.id,
    });
  }

  @Authorized()
  @FieldResolver(() => [Section])
  async sections(@Root() { id }: Conference) {
    return await this.sectionService.findAll({
      conference: id,
    });
  }

  @Authorized(["ADMIN"])
  @Mutation(() => ConferenceMutationResponse)
  async createTicket(
    @Arg("slug") _slug: string,
    @Arg("data") data: TicketInput,
    @LoadResource(Conference) conference: DocumentType<Conference>
  ): Promise<ConferenceMutationResponse> {
    conference.tickets.push(data as Ticket);

    await conference.save();

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
    @Arg("slug") _slug: string,
    @Arg("ticketId") ticketId: ObjectId,
    @Arg("data") data: TicketInput,
    @LoadResource(Conference) conference: DocumentType<Conference>
  ): Promise<ConferenceMutationResponse> {
    const tIndex = conference.tickets.findIndex(
      (t) => t.id.toString() === ticketId.toString()
    );
    if (tIndex === -1) {
      throw new Error(this.i18nService.translate("notFound", { ns: "ticket" }));
    }
    conference.tickets[tIndex] = { ...conference.tickets[tIndex], ...data };

    await conference.save();

    return {
      data: conference,
      message: this.i18nService.translate("update", {
        ns: "ticket",
        name: conference.tickets[tIndex].translations[
          this.i18nService.language() as keyof TicketTranslation
        ].name,
      }),
    };
  }

  @Authorized(["ADMIN"])
  @Mutation(() => String)
  async deleteTicket(
    @Arg("slug") _slug: string,
    @Arg("ticketId") ticketId: ObjectId,
    @LoadResource(Conference) conference: DocumentType<Conference>
  ): Promise<string> {
    const ticket = conference.tickets.find(
      (t) => t.id.toString() === ticketId.toString()
    );
    if (!ticket) {
      throw new Error(this.i18nService.translate("notFound", { ns: "ticket" }));
    }

    conference.tickets = conference.tickets.filter(
      (t) => t.id.toString() !== ticketId.toString()
    );
    await conference.save();

    return this.i18nService.translate("delete", {
      ns: "ticket",
      name: ticket.translations[
        this.i18nService.language() as keyof TicketTranslation
      ].name,
    });
  }
}
