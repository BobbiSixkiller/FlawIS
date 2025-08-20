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
import { Attendee, UserStubUnion } from "../entitites/Attendee";
import { I18nService } from "../services/i18n.service";
import {
  AttendeeArgs,
  AttendeeConnection,
  AttendeeMutationResponse,
  InvoiceInput,
} from "./types/attendee.types";
import { ObjectId } from "mongodb";
import { LoadResource } from "../util/decorators";
import { DocumentType } from "@typegoose/typegoose";
import { Submission } from "../entitites/Submission";
import { Conference } from "../entitites/Conference";
import { AttendeeRepository } from "../repositories/conferenceAttendee.repository";
import { ConferenceRepository } from "../repositories/conference.repository";
import { UserRepository } from "../repositories/user.repository";
import { SubmissionRepository } from "../repositories/submission.repository";

@Service()
@Resolver(() => Attendee)
export class AttendeeResolver {
  constructor(
    private readonly attendeeRepository: AttendeeRepository,
    private readonly conferenceRepository: ConferenceRepository,
    private readonly userRepository: UserRepository,
    private readonly submissionRepository: SubmissionRepository,
    private readonly i18nService: I18nService
  ) {}

  @Authorized(["ADMIN"])
  @Query(() => AttendeeConnection)
  async attendees(@Args() args: AttendeeArgs): Promise<AttendeeConnection> {
    return await this.attendeeRepository.paginatedConferenceAttendees(args);
  }

  @Authorized(["ADMIN"])
  @Query(() => [Attendee])
  async attendeesCsvExport(@Arg("slug") slug: string): Promise<Attendee[]> {
    return await this.attendeeRepository.findAll({ "conference.slug": slug });
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
    return await this.attendeeRepository.textSearch(text, slug);
  }

  @Authorized(["ADMIN"])
  @Mutation(() => AttendeeMutationResponse)
  async updateInvoice(
    @Arg("id") _id: ObjectId,
    @Arg("data") data: InvoiceInput,
    @LoadResource(Attendee) attendee: DocumentType<Attendee>
  ): Promise<AttendeeMutationResponse> {
    console.log(data.body.issueDate);

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
    await this.attendeeRepository.delete({ _id: attendee.id });

    return {
      data: attendee,
      message: this.i18nService.translate("deleteAttendee", {
        ns: "conference",
      }),
    };
  }

  @Authorized()
  @FieldResolver(() => UserStubUnion)
  async user(
    @Root() { user: userStub }: Attendee
  ): Promise<typeof UserStubUnion> {
    const user = await this.userRepository.findOne({ _id: userStub.id });
    if (user) {
      return user;
    } else {
      return userStub;
    }
  }

  @Authorized()
  @FieldResolver(() => Conference)
  async conference(@Root() { conference: { id } }: Attendee) {
    return this.conferenceRepository.findOne({ _id: id });
  }

  @Authorized()
  @FieldResolver(() => [Submission])
  async submissions(
    @Root() { user: { id: userId }, conference: { id: conferenceId } }: Attendee
  ) {
    return await this.submissionRepository.findAll({
      conference: conferenceId,
      authors: userId,
    });
  }
}
