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
  ConferenceTranslations,
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
import { CheckTicket, LoadResource } from "../util/decorators";
import { DocumentType } from "@typegoose/typegoose";

import { Context } from "../util/auth";
import { Attendee } from "../entitites/Attendee";
import { Section } from "../entitites/Section";
import { transformIds } from "../middlewares/typegoose-middleware";
import Messagebroker from "../util/rmq";
import { AttendeeInput } from "./types/attendee";
import { VerifiedTicket } from "../util/types";
import { User } from "../entitites/User";
import { Submission } from "../entitites/Submission";

@Service()
@Resolver(() => Conference)
export class ConferencerResolver {
  constructor(
    private readonly conferenceService = new CRUDservice(Conference),
    private readonly sectionService = new CRUDservice(Section),
    private readonly attendeeService = new CRUDservice(Attendee),
    private readonly userService = new CRUDservice(User),
    private readonly submissionService = new CRUDservice(Submission),
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

  @Authorized()
  @Mutation(() => ConferenceMutationResponse)
  async addAttendee(
    @Arg("data")
    { conferenceId, submissionId, billing }: AttendeeInput,
    @CheckTicket() { ticket, conference }: VerifiedTicket,
    @Ctx() { user, locale, req }: Context
  ): Promise<ConferenceMutationResponse> {
    const priceWithouTax = ticket.price / Number(process.env.VAT || 1.2);
    const isFlaw = user?.email.split("@")[1] === "flaw.uniba.sk";

    await this.userService.update(
      { _id: user?.id },
      {
        $addToSet: { billings: billing },
      },
      { upsert: true }
    );

    if (submissionId) {
      await this.submissionService.update(
        { _id: submissionId },
        { $addToSet: { authors: user?.id } }
      );
    }

    const attendee = await this.attendeeService.create({
      conference: conferenceId,
      user: user?.id,
      ticket,
      invoice: {
        issuer: {
          ...conference.billing,
          variableSymbol:
            conference.billing.variableSymbol +
            String(conference.attendeesCount + 1).padStart(4, "0"),
        },
        payer: {
          ...billing,
          name: isFlaw ? `${user.name}, ${billing.name}` : billing.name,
        },
        body: {
          price: Math.round((priceWithouTax / 100) * 100) / 100,
          vat: isFlaw
            ? 0
            : Math.round(((ticket.price - priceWithouTax) / 100) * 100) / 100,
          body: this.i18nService.translate("invoiceBody", { ns: "conference" }),
          comment: this.i18nService.translate("invoiceComment", {
            ns: "conference",
          }),
        },
      },
    });

    Messagebroker.produceMessage(
      JSON.stringify({
        locale,
        clientUrl: req.hostname,
        name: user?.name,
        email: user?.email,
        conferenceName:
          conference.translations[this.i18nService.language() as "sk" | "en"]
            .name,
        conferenceLogo:
          conference.translations[this.i18nService.language() as "sk" | "en"]
            .logoUrl,
        invoice: attendee.invoice,
      }),
      "mail.conference.invoice"
    );

    return {
      message: this.i18nService.translate("newAttendee", {
        ns: "conference",
        name: conference.translations[
          this.i18nService.language() as keyof ConferenceTranslation
        ].name,
      }),
      data: { ...conference, attending: attendee },
    };
  }
}
