import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { ObjectId } from "mongodb";
import { UserInputError } from "apollo-server";
import { Service } from "typedi";
import { CRUDservice } from "../services/CRUDservice";

import { Attendee } from "../entities/Attendee";
import { Conference } from "../entities/Conference";
import { Submission } from "../entities/Submission";
import { User } from "../entities/User";

import { AttendeeInput, InvoiceInput } from "./types/attendee";

import { Context } from "../util/auth";
import { VerifiedTicket } from "../util/types";
import { CheckTicket, LoadResource } from "../util/decorators";

import env from "dotenv";
import Messagebroker from "../util/rmq";
import { localizeInput } from "../util/locale";
import {
  convertDocument,
  transformIds,
} from "../middlewares/typegoose-middleware";
import { ModelType } from "@typegoose/typegoose/lib/types";

env.config();

@Service()
@Resolver(() => Attendee)
export class AttendeeResolver {
  constructor(
    private readonly attendeeService = new CRUDservice(Attendee),
    private readonly conferenceService = new CRUDservice(Conference),
    private readonly submissionService = new CRUDservice(Submission),
    private readonly userService = new CRUDservice(User)
  ) {}

  @Authorized(["ADMIN"])
  @Query(() => [Attendee])
  async attendeesToCsvExport(@Arg("conferenceId") conferenceId: ObjectId) {
    return await this.attendeeService.findAll({ conference: conferenceId });
  }

  @Authorized()
  @Query(() => Attendee)
  async attendee(@Arg("id") id: ObjectId): Promise<Attendee> {
    const attendee = await this.attendeeService.findOne({ _id: id });
    if (!attendee) throw new Error("Attendee not found!");

    return attendee;
  }

  @Authorized(["ADMIN"])
  @Query(() => [Attendee])
  async searchAttendee(
    @Arg("conferenceId") conferenceId: ObjectId,
    @Arg("text") text: string
  ) {
    const data = await this.userService.aggregate([
      {
        $match: {
          $text: {
            $search: text,
          },
        },
      },
      {
        $lookup: {
          localField: "_id",
          from: "attendees",
          foreignField: "user",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $match: { "user.conference": conferenceId } },
      { $replaceRoot: { newRoot: "$user" } },
    ]);

    return data.map((i) => transformIds(i));
  }

  @Authorized()
  @Mutation(() => Attendee)
  async addAttendee(
    @Arg("data")
    { conferenceId, billing, submission, submissionId }: AttendeeInput,
    @CheckTicket() { ticket, conference }: VerifiedTicket,
    @Ctx() { user, locale, req }: Context
  ): Promise<Attendee> {
    const priceWithouTax = ticket.price / Number(process.env.VAT || 1.2);
    const isFlaw = user?.email.split("@")[1] === "flaw.uniba.sk";

    await this.userService.update(
      { _id: user?.id },
      {
        _id: user?.id,
        email: user?.email,
        $addToSet: { billings: billing },
      },
      { upsert: true }
    );

    Messagebroker.produceMessage(
      JSON.stringify({ id: user?.id, updatedAt: new Date(Date.now()) }),
      "user.update.billings"
    );

    if (submission) {
      if (submissionId) {
        await this.submissionService.update(
          { _id: submissionId },
          { $addToSet: { authors: user?.id } }
        );
      } else {
        const registeredSubmission = await this.submissionService.create({
          ...localizeInput(submission, submission.translations, locale),
          authors: [user?.id],
          conference: submission.conference,
          section: submission.section,
        });
        const localizedSubmission = convertDocument(
          registeredSubmission,
          locale
        );

        submission.authors?.forEach((author) =>
          Messagebroker.produceMessage(
            JSON.stringify({
              locale,
              clientUrl: req.headers.origin,
              name: user?.name,
              email: author,
              conferenceName: conference.name,
              conferenceSlug: conference.slug,
              submissionId: localizedSubmission.id,
              submissionName: localizedSubmission.name,
              submissionAbstract: localizedSubmission.abstract,
              submissionKeywords: localizedSubmission.keywords,
            }),
            "mail.conference.coAuthor"
          )
        );
      }
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
          body:
            locale === "sk"
              ? `Faktúra vystavená na úhradu konferenčného poplatku pre účastníka ${user?.name}.`
              : `This invoice has been issued in order for ${user?.name} to pay the conference fee .`,
          comment:
            locale === "sk"
              ? "V prípade neuhradenia konferenčného poplatku do stanoveného termínu si hostiteľská organizácia vyhradzuje právo na zrušenie účasti uchádzača."
              : "In case of not due payment the host organisation is reserving the right to cancel attendee",
        },
      },
    });

    Messagebroker.produceMessage(
      JSON.stringify({
        locale,
        clientUrl: req.hostname,
        name: user?.name,
        email: user?.email,
        conferenceName: conference.name,
        conferenceLogo:
          process.env.NODE_ENV === "staging"
            ? "http://gateway-staging:6000" + conference.logo.path
            : "http://gateway:5000" + conference.logo.path,
        invoice: attendee.invoice,
      }),
      "mail.conference.invoice"
    );

    return attendee;
  }

  @Authorized(["ADMIN"])
  @Mutation(() => Attendee)
  async updateInvoice(
    @Arg("id") id: ObjectId,
    @Arg("data") invoiceInput: InvoiceInput
  ): Promise<Attendee> {
    const attendee = await this.attendeeService.findOne({ _id: id });
    if (!attendee) throw new UserInputError("Attendee not found!");

    for (const [key, value] of Object.entries(invoiceInput)) {
      attendee.invoice[key as keyof InvoiceInput] = value;
    }

    return attendee.save();
  }

  @Authorized(["ADMIN"])
  @Mutation(() => Attendee)
  async removeAttendee(
    @Arg("id") _id: ObjectId,
    @LoadResource(Attendee) attendee: ModelType<Attendee>
  ) {
    return await attendee.remove();
  }

  @Authorized()
  @FieldResolver(() => Conference, { nullable: true })
  async conference(
    @Root() { conference }: Attendee
  ): Promise<Conference | null> {
    return await this.conferenceService.findOne({ _id: conference });
  }

  @Authorized()
  @FieldResolver(() => User, { nullable: true })
  async user(@Root() { user }: Attendee) {
    return await this.userService.findOne({ _id: user });
  }

  @Authorized()
  @FieldResolver(() => [Submission])
  async submissions(@Root() { conference, user }: Attendee) {
    await this.submissionService.dataModel.syncIndexes();

    return await this.submissionService.findAll({
      conference: conference,
      authors: user,
    });
  }
}
