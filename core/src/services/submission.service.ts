import { ObjectId } from "mongodb";
import { ClientSession } from "mongoose";
import { GraphQLError } from "graphql";
import { ArgumentValidationError } from "type-graphql";
import { Service } from "typedi";

import { Conference } from "../entitites/Conference";
import { Submission } from "../entitites/Submission";
import { Access } from "../entitites/User";
import { AttendeeRepository } from "../repositories/conferenceAttendee.repository";
import { ConferenceRepository } from "../repositories/conference.repository";
import { SectionRepository } from "../repositories/section.repository";
import { SubmissionRepository } from "../repositories/submission.repository";
import {
  SubmissionArgs,
  SubmissionInput,
} from "../resolvers/types/submission.types";
import { toDTO } from "../util/helpers";
import { CtxUser } from "../util/types";
import { I18nService } from "./i18n.service";
import { RmqService } from "./rmq.service";
import { TokenService } from "./token.service";

type SubmissionTokenPayload = {
  email: string;
  submissionId: string;
};

type CreateSubmissionOptions = {
  deferNotifications?: boolean;
  session?: ClientSession;
};

function sameId(left: unknown, right: unknown) {
  return String(left) === String(right);
}

@Service()
export class SubmissionService {
  constructor(
    private readonly submissionRepository: SubmissionRepository,
    private readonly conferenceRepository: ConferenceRepository,
    private readonly attendeeRepository: AttendeeRepository,
    private readonly sectionRepository: SectionRepository,
    private readonly tokenService: TokenService,
    private readonly rmqService: RmqService,
    private readonly i18nService: I18nService,
  ) {}

  async getSubmissions(args: SubmissionArgs) {
    return await this.submissionRepository.paginatedSubmissions(args);
  }

  async getSubmission(id: ObjectId) {
    const submission = await this.submissionRepository.findOne({ _id: id });
    if (!submission) this.throwNotFound();
    return toDTO(submission!);
  }

  async getAuthorizedSubmission(id: ObjectId, user: CtxUser) {
    const submission = await this.submissionRepository.findOne({ _id: id });
    if (!submission) this.throwNotFound();
    if (!this.isAdmin(user) && !this.isAuthor(submission!, user.id)) {
      this.throwNotAllowed();
    }
    return toDTO(submission!);
  }

  async getSubmissionInvite(
    token: string,
    user: CtxUser,
    expectedSubmissionId?: ObjectId,
  ) {
    const decoded = await this.tokenService.inspectOneTimeToken<SubmissionTokenPayload>(
      token,
    );
    const payload = this.validateInvitePayload(
      decoded.payload,
      user,
      expectedSubmissionId,
    );

    return await this.getSubmission(new ObjectId(payload.submissionId));
  }

  async createSubmission(
    hostname: string,
    user: CtxUser,
    data: SubmissionInput,
    options: CreateSubmissionOptions = {},
  ) {
    const conference = await this.assertSubmissionContext(
      user,
      data.conference,
      data.section,
      options.session,
    );
    await this.assertUniqueNames(data, undefined, options.session);

    const submission = await this.submissionRepository.create(
      {
        ...data,
        authors: [user.id],
      },
      { session: options.session },
    );
    const result = toDTO(submission);

    if (!options.deferNotifications) {
      await this.sendCoAuthorInvites(
        hostname,
        user,
        conference,
        result,
        data.authors,
      );
    }

    return result;
  }

  async updateSubmission(
    id: ObjectId,
    hostname: string,
    user: CtxUser,
    { authors, ...data }: SubmissionInput,
  ) {
    const existing = await this.submissionRepository.findOne({ _id: id });
    if (!existing) this.throwNotFound();

    const isAdmin = this.isAdmin(user);
    if (!isAdmin && !this.isAuthor(existing!, user.id)) {
      this.throwNotAllowed();
    }
    if (!sameId(existing!.conference, data.conference)) {
      this.throwSectionMismatch();
    }

    const conference = await this.assertSubmissionContext(
      user,
      data.conference,
      data.section,
    );
    await this.assertUniqueNames(data, id);

    const submission = await this.submissionRepository.findOneAndUpdate(
      {
        _id: id,
        ...(isAdmin ? {} : { authors: user.id }),
      },
      { $set: data },
      { new: true, runValidators: true },
    );
    if (!submission) this.throwNotAllowed();

    const result = toDTO(submission!);
    await this.sendCoAuthorInvites(
      hostname,
      user,
      conference,
      result,
      authors,
    );
    return result;
  }

  async deleteSubmission(id: ObjectId, user: CtxUser) {
    const existing = await this.submissionRepository.findOne({ _id: id });
    if (!existing) this.throwNotFound();

    const isAdmin = this.isAdmin(user);
    if (!isAdmin && !this.isAuthor(existing!, user.id)) {
      this.throwNotAllowed();
    }

    const conference = await this.conferenceRepository.findOne({
      _id: existing!.conference,
    });
    if (!conference) {
      throw new Error(
        this.i18nService.translate("notFound", { ns: "conference" }),
      );
    }
    await this.assertParticipantCanSubmit(user, conference!);

    const submission = await this.submissionRepository.findOneAndDelete({
      _id: id,
      ...(isAdmin ? {} : { authors: user.id }),
    });
    if (!submission) this.throwNotAllowed();
    return toDTO(submission!);
  }

  async addCoAuthor(token: string, user: CtxUser) {
    const inspected =
      await this.tokenService.inspectOneTimeToken<SubmissionTokenPayload>(token);
    const payload = this.validateInvitePayload(inspected.payload, user);

    const submission = await this.submissionRepository.findOne({
      _id: payload.submissionId,
    });
    if (!submission) this.throwNotFound();
    const conference = await this.conferenceRepository.findOne({
      _id: submission!.conference,
    });
    if (!conference) {
      throw new Error(
        this.i18nService.translate("notFound", { ns: "conference" }),
      );
    }
    await this.assertParticipantCanSubmit(user, conference!);

    await this.tokenService.verifyOneTimeToken<SubmissionTokenPayload>(token);
    const updated = await this.submissionRepository.findOneAndUpdate(
      { _id: submission!.id },
      { $addToSet: { authors: user.id } },
      { new: true },
    );
    if (!updated) this.throwNotFound();
    return toDTO(updated!);
  }

  async removeAuthor(submissionId: ObjectId, authorId: ObjectId) {
    const submission = await this.submissionRepository.findOneAndUpdate(
      { _id: submissionId },
      { $pull: { authors: authorId } },
      { new: true },
    );
    if (!submission) this.throwNotFound();
    return toDTO(submission!);
  }

  async sendCoAuthorInvites(
    hostname: string,
    user: CtxUser,
    conference: Conference,
    submission: Submission,
    authors: string[] = [],
  ) {
    await Promise.all(
      authors.map((email) =>
        this.sendAddAuthorLink(hostname, email, user, conference, submission),
      ),
    );
  }

  private async sendAddAuthorLink(
    hostname: string,
    email: string,
    user: CtxUser,
    conference: Conference,
    submission: Submission,
  ) {
    const token = await this.tokenService.generateOneTimeToken(
      60 * 60 * 24 * 7,
      { email, submissionId: submission.id },
    );
    const locale = this.localeKey();

    this.rmqService.produceMessage(
      JSON.stringify({
        locale: this.i18nService.language(),
        hostname,
        name: user.name,
        email,
        conferenceName: conference.translations[locale].name,
        conferenceSlug: conference.slug,
        token,
        submissionId: submission.id,
        submissionName: submission.translations[locale].name,
        submissionAbstract: submission.translations[locale].abstract,
        submissionKeywords: submission.translations[locale].keywords,
      }),
      "mail.conference.coAuthor",
    );
  }

  private async assertSubmissionContext(
    user: CtxUser,
    conferenceId: ObjectId,
    sectionId: ObjectId,
    session?: ClientSession,
  ) {
    const [conference, section] = await Promise.all([
      this.conferenceRepository.findOne(
        { _id: conferenceId },
        null,
        { session },
      ),
      this.sectionRepository.findOne({ _id: sectionId }, null, { session }),
    ]);
    if (!conference) {
      throw new Error(
        this.i18nService.translate("notFound", { ns: "conference" }),
      );
    }
    if (!section) {
      throw new Error(
        this.i18nService.translate("notFound", { ns: "section" }),
      );
    }
    if (!sameId(section!.conference, conference!.id)) {
      this.throwSectionMismatch();
    }

    await this.assertParticipantCanSubmit(user, conference!, session);
    return conference!;
  }

  private validateInvitePayload(
    payload: SubmissionTokenPayload | undefined,
    user: CtxUser,
    expectedSubmissionId?: ObjectId,
  ) {
    if (
      !payload ||
      (expectedSubmissionId &&
        !sameId(payload.submissionId, expectedSubmissionId))
    ) {
      throw new Error(
        this.i18nService.translate("tokenMalformed", { ns: "common" }),
      );
    }

    if (payload.email.toLowerCase() !== user.email.toLowerCase()) {
      throw new GraphQLError(
        this.i18nService.translate("inviteEmailMismatch", { ns: "common" }),
        { extensions: { code: "INVITATION_EMAIL_MISMATCH" } },
      );
    }

    return payload;
  }

  private async assertParticipantCanSubmit(
    user: CtxUser,
    conference: Conference,
    session?: ClientSession,
  ) {
    if (this.isAdmin(user)) return;

    const attendee = await this.attendeeRepository.findOne(
      {
        "conference._id": conference.id,
        "user._id": user.id,
      },
      null,
      { session },
    );
    if (!attendee?.ticket.withSubmission) {
      throw new Error(
        this.i18nService.translate("submissionTicketRequired", {
          ns: "submission",
        }),
      );
    }

    const deadline = conference.dates.submissionDeadline;
    if (deadline && Date.now() > new Date(deadline).getTime()) {
      throw new Error(
        this.i18nService.translate("deadlinePassed", { ns: "submission" }),
      );
    }
  }

  private async assertUniqueNames(
    data: Pick<SubmissionInput, "translations">,
    excludedId?: ObjectId,
    session?: ClientSession,
  ) {
    const excluded = excludedId ? { _id: { $ne: excludedId } } : {};
    const [skExists, enExists] = await Promise.all([
      this.submissionRepository.findOne(
        {
          ...excluded,
          "translations.sk.name": data.translations.sk.name,
        },
        null,
        { session },
      ),
      this.submissionRepository.findOne(
        {
          ...excluded,
          "translations.en.name": data.translations.en.name,
        },
        null,
        { session },
      ),
    ]);

    if (skExists) {
      this.throwNameExists(
        "translations.sk.name",
        "skNameExists",
        data.translations.sk.name,
      );
    }
    if (enExists) {
      this.throwNameExists(
        "translations.en.name",
        "enNameExists",
        data.translations.en.name,
      );
    }
  }

  private isAdmin(user: CtxUser) {
    return user.access.includes(Access.Admin);
  }

  private isAuthor(
    submission: Pick<Submission, "authors">,
    userId: ObjectId,
  ) {
    return submission.authors.some((author) => sameId(author, userId));
  }

  private localeKey(): "sk" | "en" {
    return this.i18nService.language() === "en" ? "en" : "sk";
  }

  private throwNameExists(
    property: string,
    key: "skNameExists" | "enNameExists",
    name: string,
  ): never {
    throw new ArgumentValidationError([
      {
        target: Submission,
        property,
        value: name,
        constraints: {
          name: this.i18nService.translate(key, {
            ns: "submission",
            name,
          }),
        },
      },
    ]);
  }

  private throwNotFound(): never {
    throw new Error(
      this.i18nService.translate("notFound", { ns: "submission" }),
    );
  }

  private throwNotAllowed(): never {
    throw new Error(
      this.i18nService.translate("notAllowed", { ns: "submission" }),
    );
  }

  private throwSectionMismatch(): never {
    throw new Error(
      this.i18nService.translate("sectionMismatch", { ns: "submission" }),
    );
  }
}
