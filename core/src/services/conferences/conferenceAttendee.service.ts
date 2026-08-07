import { ObjectId } from "mongodb";
import { Service } from "typedi";

import { Attendee } from "../../entitites/Attendee";
import { AttendeeRepository } from "../../repositories/conferenceAttendee.repository";
import { ConferenceRepository } from "../../repositories/conference.repository";
import { SubmissionRepository } from "../../repositories/submission.repository";
import { UserRepository } from "../../repositories/user.repository";
import {
  AttendeeArgs,
  AttendeeInput,
  InvoiceInput,
  InvoiceOwnerType,
} from "../../resolvers/types/attendee.types";
import { CtxUser } from "../../util/types";
import { isDuplicateInvoiceNumberError } from "../../repositories/invoice.repository";
import { withOptionalTransaction } from "../../util/helpers";
import { I18nService } from "../i18n.service";
import { InvoiceService } from "../invoice.service";
import { RmqService } from "../rmq.service";
import { SubmissionService } from "../submission.service";

function isDuplicateAttendeeError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const mongoError = error as {
    code?: number;
    keyPattern?: Record<string, number>;
  };
  return (
    mongoError.code === 11000 &&
    Boolean(
      mongoError.keyPattern?.["conference._id"] ||
        mongoError.keyPattern?.["user._id"],
    )
  );
}

@Service()
export class ConferenceAttendeeService {
  constructor(
    private readonly attendeeRepository: AttendeeRepository,
    private readonly conferenceRepository: ConferenceRepository,
    private readonly userRepository: UserRepository,
    private readonly submissionRepository: SubmissionRepository,
    private readonly i18nService: I18nService,
    private readonly invoiceService: InvoiceService,
    private readonly rmqService: RmqService,
    private readonly submissionService: SubmissionService,
  ) {}

  async getAttendees(args: AttendeeArgs) {
    return await this.attendeeRepository.paginatedConferenceAttendees(args);
  }

  async getAttendee(id: ObjectId) {
    const attendee = await this.attendeeRepository.findOne({ _id: id });
    if (!attendee) this.throwNotFound();
    return attendee!;
  }

  async searchAttendees(text: string, slug: string) {
    return await this.attendeeRepository.textSearch(text, slug);
  }

  async getAttending(conferenceId: ObjectId, userId: ObjectId) {
    return await this.attendeeRepository.findOne({
      "conference._id": conferenceId,
      "user._id": userId,
    });
  }

  async registerAttendee(
    data: AttendeeInput,
    user: CtxUser,
    locale: string,
    hostname: string,
  ) {
    const conference = await this.conferenceRepository.findOne({
      _id: data.conferenceId,
    });
    if (!conference) {
      throw new Error(
        this.i18nService.translate("notFound", { ns: "conference" }),
      );
    }

    if (
      conference.dates.regEnd &&
      Date.now() > new Date(conference.dates.regEnd).getTime()
    ) {
      throw new Error(
        this.i18nService.translate("registrationClosed", {
          ns: "conference",
        }),
      );
    }

    const ticket = conference.tickets.find(
      (candidate) => candidate.id.toString() === data.ticketId.toString(),
    );
    if (!ticket) {
      throw new Error(
        this.i18nService.translate("notFound", { ns: "ticket" }),
      );
    }
    if (data.initialSubmission && !ticket.withSubmission) {
      throw new Error(
        this.i18nService.translate("submissionTicketRequired", {
          ns: "submission",
        }),
      );
    }
    if (
      data.initialSubmission &&
      data.initialSubmission.conference.toString() !==
        data.conferenceId.toString()
    ) {
      throw new Error(
        this.i18nService.translate("sectionMismatch", { ns: "submission" }),
      );
    }

    const existing = await this.getAttending(conference.id, user.id);
    if (existing) this.throwAlreadyRegistered(user.name, conference, locale);

    const isFlaw = user.email.toLowerCase().endsWith("@flaw.uniba.sk");
    const attendeeId = new ObjectId();

    try {
      const result = await withOptionalTransaction(
        undefined,
        async (session) => {
          const createdInvoice = await this.invoiceService.createInvoice({
            attendeeId,
            body: this.i18nService.translate("invoiceBody", {
              ns: "conference",
              name: user.name,
            }),
            comment: this.i18nService.translate("invoiceComment", {
              ns: "conference",
            }),
            grossPriceCents: ticket.price,
            issuer: conference.billing,
            ownerType: InvoiceOwnerType.CONFERENCE_ATTENDEE,
            payer: {
              ...data.billing,
              name: isFlaw
                ? `${user.name}, ${data.billing.name}`
                : data.billing.name,
            },
            payerEmail: user.email,
            session,
            type: this.i18nService.translate("invoiceType", {
              ns: "conference",
            }),
            userId: user.id,
          });

          await this.userRepository.updateMany(
            { _id: user.id },
            { $addToSet: { billings: data.billing } },
            { upsert: true, session },
          );

          await this.attendeeRepository.create(
            {
              _id: attendeeId,
              conference: { _id: conference.id, slug: conference.slug },
              user: { _id: user.id, name: user.name, email: user.email },
              ticket,
              invoiceId: createdInvoice._id,
            },
            { session },
          );

          const initialSubmission = data.initialSubmission
            ? await this.submissionService.createSubmission(
                hostname,
                user,
                data.initialSubmission,
                { deferNotifications: true, session },
              )
            : undefined;

          return { invoice: createdInvoice, initialSubmission };
        },
        isDuplicateInvoiceNumberError,
      );

      this.rmqService.produceMessage(
        JSON.stringify({
          locale,
          name: user.name,
          email: user.email,
          conferenceName:
            conference.translations[this.localeKey(locale)].name,
          conferenceLogo:
            conference.translations[this.localeKey(locale)].logoUrl,
          invoice: this.invoiceService.toInvoice(result.invoice),
        }),
        "mail.conference.invoice",
      );

      if (result.initialSubmission && data.initialSubmission) {
        await this.submissionService.sendCoAuthorInvites(
          hostname,
          user,
          conference,
          result.initialSubmission,
          data.initialSubmission.authors,
        );
      }

      return conference;
    } catch (error) {
      if (isDuplicateAttendeeError(error)) {
        this.throwAlreadyRegistered(user.name, conference, locale);
      }
      throw error;
    }
  }

  async updateInvoice(
    attendeeId: ObjectId,
    data: InvoiceInput,
  ) {
    const attendee = await this.getAttendee(attendeeId);
    const result = await this.invoiceService.updateInvoice(
      InvoiceOwnerType.CONFERENCE_ATTENDEE,
      attendee.id,
      data,
      attendee.invoice,
    );
    if (!result.stored) {
      attendee.invoice = result.invoice;
      await attendee.save();
    }
    return attendee;
  }

  getInvoice(attendee: Attendee) {
    return this.invoiceService.getInvoice(
      InvoiceOwnerType.CONFERENCE_ATTENDEE,
      attendee.id,
      attendee.invoice,
    );
  }

  async deleteAttendee(id: ObjectId) {
    return await withOptionalTransaction(undefined, async (session) => {
      const attendee = await this.attendeeRepository.findOneAndDelete(
        { _id: id },
        { session },
      );
      if (!attendee) this.throwNotFound();

      await this.submissionRepository.updateMany(
        {
          conference: attendee!.conference.id,
          authors: attendee!.user.id,
        },
        { $pull: { authors: attendee!.user.id } },
        { session },
      );

      return attendee!;
    });
  }

  async getUser(attendee: Attendee) {
    return (
      (await this.userRepository.findOne({ _id: attendee.user.id })) ??
      attendee.user
    );
  }

  async getConference(attendee: Attendee) {
    return await this.conferenceRepository.findOne({
      _id: attendee.conference.id,
    });
  }

  async getSubmissions(attendee: Attendee) {
    return await this.submissionRepository.findAll({
      conference: attendee.conference.id,
      authors: attendee.user.id,
    });
  }

  private localeKey(locale: string): "sk" | "en" {
    return locale === "en" ? "en" : "sk";
  }

  private throwNotFound(): never {
    throw new Error(
      this.i18nService.translate("attendeeNotFound", { ns: "conference" }),
    );
  }

  private throwAlreadyRegistered(
    name: string,
    conference: { translations: { sk: { name: string }; en: { name: string } } },
    locale: string,
  ): never {
    throw new Error(
      this.i18nService.translate("alreadyRegistered", {
        ns: "conference",
        name,
        conference: conference.translations[this.localeKey(locale)].name,
      }),
    );
  }
}
