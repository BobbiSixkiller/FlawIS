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
import { CheckTicket } from "../util/decorators";

import env from "dotenv";
import Messagebroker from "../util/rmq";

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

  @Authorized()
  @Query(() => Attendee)
  async attendee(@Arg("id") id: ObjectId): Promise<Attendee> {
    const attendee = await this.attendeeService.findOne({ _id: id });
    if (!attendee) throw new Error("Attendee not found!");

    return attendee;
  }

  //Refactor to check for co-author header and run a submission update to push new coauthor into the authors array
  @Authorized()
  @Mutation(() => Attendee)
  async addAttendee(
    @Arg("data") { conferenceId, billing }: AttendeeInput,
    @CheckTicket() { ticket, conference }: VerifiedTicket,
    @Ctx() { user }: Context
  ): Promise<Attendee> {
    const ticketPrice = ticket.price / Number(process.env.VAT || 1.2);
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

    const attendee = await this.attendeeService.create({
      conference: conferenceId,
      withSubmission: ticket.withSubmission,
      online: ticket.online,
      user: {
        _id: user?.id,
        email: user?.email,
      },
      invoice: {
        payer: { ...billing, name: user?.name },
        body: {
          ticketPrice: Math.round((ticketPrice / 100) * 100) / 100,
          vat: isFlaw
            ? 0
            : Math.round((ticket.price - ticketPrice) * 100) / 100,
          body: "Test invoice",
          comment:
            "In case of not due payment the host organisation is reserving the right to cancel attendee",
        },
      },
    });

    return attendee;
  }

  @Authorized()
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
  @Mutation(() => Boolean)
  async removeAttendee(@Arg("id") id: ObjectId): Promise<boolean> {
    const { deletedCount } = await this.attendeeService.delete({ _id: id });

    return deletedCount > 0;
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
  async user(@Root() { user }: Attendee): Promise<User | null> {
    return await this.userService.findOne({ _id: user });
  }

  @Authorized()
  @FieldResolver(() => [Submission], { nullable: true })
  async submissions(
    @Root() { conference, user }: Attendee
  ): Promise<Submission[]> {
    return await this.submissionService.findAll({
      conference: conference,
      authors: { id: user.id },
    });
  }
}
