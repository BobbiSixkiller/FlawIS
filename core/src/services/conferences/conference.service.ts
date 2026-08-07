import { ObjectId } from "mongodb";
import { ArgumentValidationError } from "type-graphql";
import { Service } from "typedi";

import {
  Conference,
  Ticket,
} from "../../entitites/Conference";
import { AttendeeRepository } from "../../repositories/conferenceAttendee.repository";
import { ConferenceRepository } from "../../repositories/conference.repository";
import { SectionRepository } from "../../repositories/section.repository";
import {
  ConferenceArgs,
  ConferenceInput,
  DatesInput,
  TicketInput,
} from "../../resolvers/types/conference.types";
import { assertInvoiceIssuerBilling } from "../../entitites/Billing";
import { I18nService } from "../i18n.service";

type DuplicateKeyError = {
  code?: number;
  keyPattern?: Record<string, number>;
  keyValue?: Record<string, unknown>;
};

@Service()
export class ConferenceService {
  constructor(
    private readonly conferenceRepository: ConferenceRepository,
    private readonly attendeeRepository: AttendeeRepository,
    private readonly sectionRepository: SectionRepository,
    private readonly i18nService: I18nService,
  ) {}

  async getConferences(args: ConferenceArgs) {
    return await this.conferenceRepository.paginatedConferences(args);
  }

  async getConference(slug: string) {
    const conference = await this.conferenceRepository.findOne({ slug });
    if (!conference) this.throwNotFound();
    return conference!;
  }

  async getConferenceById(id: ObjectId) {
    const conference = await this.findConferenceById(id);
    if (!conference) this.throwNotFound();
    return conference!;
  }

  async findConferenceById(id: ObjectId) {
    return await this.conferenceRepository.findOne({ _id: id });
  }

  async searchConferences(text: string) {
    return await this.conferenceRepository.textSearch(text);
  }

  async createConference(data: ConferenceInput) {
    assertInvoiceIssuerBilling(data.billing);
    await this.assertUniqueConference(data);

    try {
      return await this.conferenceRepository.create(data);
    } catch (error) {
      this.rethrowDuplicateConference(error, data);
      throw error;
    }
  }

  async deleteConference(id: ObjectId) {
    const conference = await this.conferenceRepository.findOneAndDelete({
      _id: id,
    });
    if (!conference) this.throwNotFound();
    return conference!;
  }

  async updateConferenceDates(slug: string, dates: DatesInput) {
    const conference = await this.conferenceRepository.findOneAndUpdate(
      { slug },
      { $set: { dates } },
      { new: true, runValidators: true },
    );
    if (!conference) this.throwNotFound();
    return conference!;
  }

  async getSections(conferenceId: ObjectId) {
    return await this.sectionRepository.findAll({ conference: conferenceId });
  }

  async getAttendeesCount(conferenceId: ObjectId) {
    return await this.attendeeRepository.countDocuments({
      "conference._id": conferenceId,
    });
  }

  async createTicket(slug: string, data: TicketInput) {
    const conference = await this.getConference(slug);
    conference.tickets.push(data as Ticket);
    await conference.save();
    return conference;
  }

  async updateTicket(slug: string, ticketId: ObjectId, data: TicketInput) {
    const conference = await this.getConference(slug);
    const ticketIndex = conference.tickets.findIndex(
      (ticket) => ticket.id.toString() === ticketId.toString(),
    );
    if (ticketIndex === -1) this.throwTicketNotFound();

    conference.tickets[ticketIndex] = {
      ...conference.tickets[ticketIndex],
      ...data,
    };
    await conference.save();
    return { conference, ticket: conference.tickets[ticketIndex] };
  }

  async deleteTicket(slug: string, ticketId: ObjectId) {
    const conference = await this.getConference(slug);
    const ticket = conference.tickets.find(
      (candidate) => candidate.id.toString() === ticketId.toString(),
    );
    if (!ticket) this.throwTicketNotFound();

    conference.tickets = conference.tickets.filter(
      (candidate) => candidate.id.toString() !== ticketId.toString(),
    );
    await conference.save();
    return { conference, ticket: ticket! };
  }

  private throwNotFound(): never {
    throw new Error(
      this.i18nService.translate("notFound", { ns: "conference" }),
    );
  }

  private throwTicketNotFound(): never {
    throw new Error(
      this.i18nService.translate("notFound", { ns: "ticket" }),
    );
  }

  private async assertUniqueConference(data: ConferenceInput) {
    const [skNameExists, enNameExists, slugExists] = await Promise.all([
      this.conferenceRepository.findOne({
        "translations.sk.name": data.translations.sk.name,
      }),
      this.conferenceRepository.findOne({
        "translations.en.name": data.translations.en.name,
      }),
      this.conferenceRepository.findOne({ slug: data.slug }),
    ]);

    if (skNameExists) {
      this.throwNameExists(
        "translations.sk.name",
        data.translations.sk.name,
      );
    }
    if (enNameExists) {
      this.throwNameExists(
        "translations.en.name",
        data.translations.en.name,
      );
    }
    if (slugExists) this.throwSlugExists(data.slug);
  }

  private rethrowDuplicateConference(
    error: unknown,
    data: ConferenceInput,
  ) {
    if (!error || typeof error !== "object") return;
    const duplicate = error as DuplicateKeyError;
    if (duplicate.code !== 11000) return;

    const fields = {
      ...duplicate.keyPattern,
      ...duplicate.keyValue,
    };
    if (fields["translations.sk.name"] !== undefined) {
      this.throwNameExists(
        "translations.sk.name",
        data.translations.sk.name,
      );
    }
    if (fields["translations.en.name"] !== undefined) {
      this.throwNameExists(
        "translations.en.name",
        data.translations.en.name,
      );
    }
    if (fields.slug !== undefined) this.throwSlugExists(data.slug);
  }

  private throwNameExists(property: string, name: string): never {
    throw new ArgumentValidationError([
      {
        target: Conference,
        property,
        value: name,
        constraints: {
          name: this.i18nService.translate("nameExists", {
            ns: "conference",
            name,
          }),
        },
      },
    ]);
  }

  private throwSlugExists(slug: string): never {
    throw new ArgumentValidationError([
      {
        target: Conference,
        property: "slug",
        value: slug,
        constraints: {
          slug: this.i18nService.translate("slugExists", {
            ns: "conference",
            slug,
          }),
        },
      },
    ]);
  }
}
