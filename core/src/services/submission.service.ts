import { Service } from "typedi";
import { ObjectId } from "mongodb";

import { SubmissionRepository } from "../repositories/submission.repository";
import { DocumentType } from "@typegoose/typegoose";
import { Submission } from "../entitites/Submission";
import { I18nService } from "./i18n.service";
import {
  SubmissionArgs,
  SubmissionInput,
} from "../resolvers/types/submission.types";
import { ConferenceRepository } from "../repositories/conference.repository";
import { RmqService } from "./rmq.service";
import { ArgumentValidationError } from "type-graphql";
import mongoose from "mongoose";
import { Access } from "../entitites/User";
import { Conference } from "../entitites/Conference";
import { TokenService } from "./token.service";
import { CtxUser } from "../util/types";

function toSubmissionDTO(doc: DocumentType<Submission>) {
  const obj = doc.toJSON({
    versionKey: false,
    virtuals: false,
    transform(_doc, ret) {
      if (ret._id) {
        ret.id = ret._id;
        delete ret._id;
      }

      return ret;
    },
  });

  return obj as Submission;
}

@Service()
export class SubmissionService {
  constructor(
    private readonly submissionRepository: SubmissionRepository,
    private readonly conferenceRepository: ConferenceRepository,
    private readonly tokenService: TokenService,
    private readonly rmqService: RmqService,
    private readonly i18nService: I18nService
  ) {}

  private async sendAddAuthorLink(
    hostname: string,
    email: string,
    ctxUser: CtxUser,
    conference: Conference,
    submission: Submission,
    ticketId: ObjectId
  ) {
    const token = await this.tokenService.generateOneTimeToken(
      60 * 60 * 24 * 7,
      { email, submissionId: submission.id, ticketId }
    );

    this.rmqService.produceMessage(
      JSON.stringify({
        locale: this.i18nService.language(),
        hostname,
        name: ctxUser.name,
        email,
        conferenceName:
          conference?.translations[this.i18nService.language() as "sk" | "en"]
            .name,
        conferenceSlug: conference?.slug,
        token,
        submissionId: submission.id,
        ticketId,
        submissionName:
          submission.translations[this.i18nService.language() as "sk" | "en"]
            .name,
        submissionAbstract:
          submission.translations[this.i18nService.language() as "sk" | "en"]
            .abstract,
        submissionKeywords:
          submission.translations[this.i18nService.language() as "sk" | "en"]
            .keywords,
      }),
      "mail.conference.coAuthor"
    );
  }

  async getSubmissions(args: SubmissionArgs) {
    return await this.submissionRepository.paginatedSubmissions(args);
  }

  async getSubmission(id: ObjectId) {
    const submission = await this.submissionRepository.findOne({ _id: id });
    if (!submission) {
      throw new Error(
        this.i18nService.translate("notFound", { ns: "submission" })
      );
    }

    return toSubmissionDTO(submission);
  }

  async createSubmission(
    hostname: string,
    ctxUser: CtxUser,
    data: SubmissionInput,
    ticketId: ObjectId
  ) {
    const conference = await this.conferenceRepository.findOne({
      _id: data.conference,
    });
    if (!conference) {
      throw new Error(
        this.i18nService.translate("notFound", { ns: "conference" })
      );
    }

    const [skExists, enExists] = await Promise.all([
      this.submissionRepository.findOne({
        "translations.sk.name": data.translations.sk.name,
      }),
      this.submissionRepository.findOne({
        "translations.en.name": data.translations.en.name,
      }),
    ]);

    // Validate uniqueness for SK name
    if (skExists) {
      throw new ArgumentValidationError([
        {
          target: Submission,
          property: "translations.sk.name",
          value: data.translations.sk.name,
          constraints: {
            name: this.i18nService.translate("skNameExists", {
              ns: "submission",
              name: data.translations.sk.name,
            }),
          },
        },
      ]);
    }

    // 2. Validate uniqueness for EN name
    if (enExists) {
      throw new ArgumentValidationError([
        {
          target: Submission,
          property: "translations.en.name",
          value: data.translations.en.name,
          constraints: {
            name: this.i18nService.translate("enNameExists", {
              ns: "submission",
              name: data.translations.en.name,
            }),
          },
        },
      ]);
    }

    const submission = await this.submissionRepository.create({
      ...data,
      authors: [ctxUser.id],
    });

    if (data.authors.length !== 0) {
      data.authors?.forEach((author) =>
        this.sendAddAuthorLink(
          hostname,
          author,
          ctxUser,
          conference,
          submission,
          ticketId
        )
      );
    }

    return toSubmissionDTO(submission);
  }

  async updateSubmission(
    id: ObjectId,
    hostname: string,
    ctxUser: CtxUser,
    { authors, ...data }: SubmissionInput,
    ticketId: ObjectId
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const conference = await this.conferenceRepository.findOne({
        _id: data.conference,
      });
      if (!conference) {
        throw new Error(
          this.i18nService.translate("notFound", { ns: "conference" })
        );
      }

      const [skExists, enExists] = await Promise.all([
        this.submissionRepository.findOne({
          "translations.sk.name": data.translations.sk.name,
        }),
        this.submissionRepository.findOne({
          "translations.en.name": data.translations.en.name,
        }),
      ]);

      // Validate uniqueness for SK name
      if (skExists && skExists.id !== id.toString()) {
        throw new ArgumentValidationError([
          {
            target: Submission,
            property: "translations.sk.name",
            value: data.translations.sk.name,
            constraints: {
              name: this.i18nService.translate("skNameExists", {
                ns: "submission",
                name: data.translations.sk.name,
              }),
            },
          },
        ]);
      }

      // 2. Validate uniqueness for EN name
      if (enExists && enExists.id !== id.toString()) {
        throw new ArgumentValidationError([
          {
            target: Submission,
            property: "translations.en.name",
            value: data.translations.en.name,
            constraints: {
              name: this.i18nService.translate("enNameExists", {
                ns: "submission",
                name: data.translations.en.name,
              }),
            },
          },
        ]);
      }

      const submission = await this.submissionRepository.findOneAndUpdate(
        {
          _id: id,
        },
        { $set: { ...data } },
        { session }
      );
      if (!submission) {
        throw new Error(
          this.i18nService.translate("notFound", { ns: "submission" })
        );
      }

      if (
        !ctxUser.access.includes(Access.Admin) &&
        !submission.authors.some(
          (author) => author.toString() === ctxUser.id.toString()
        )
      ) {
        throw new Error("Not allowed!");
      }

      if (authors.length !== 0) {
        authors.forEach(async (author) =>
          this.sendAddAuthorLink(
            hostname,
            author,
            ctxUser,
            conference,
            submission,
            ticketId
          )
        );
      }

      await session.commitTransaction();

      return toSubmissionDTO(submission);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async deleteSubmission(id: ObjectId, ctxUser: CtxUser) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const submission = await this.submissionRepository.findOneAndDelete(
        { _id: id },
        { session }
      );
      if (!submission) {
        throw new Error(
          this.i18nService.translate("notFound", { ns: "submission" })
        );
      }
      if (
        !ctxUser.access.includes(Access.Admin) &&
        !submission.authors.some(
          (author) => author.toString() === ctxUser.id.toString()
        )
      ) {
        throw new Error("Not allowed!");
      }

      await session.commitTransaction();

      return toSubmissionDTO(submission);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async addCoAuthor(token: string, ctxUser: CtxUser) {
    const decoded = await this.tokenService.verifyOneTimeToken<{
      email: string;
      submissionId: string;
    }>(token);
    if (!decoded.payload || decoded.payload.email !== ctxUser.email) {
      throw new Error(
        this.i18nService.translate("tokenMalformed", { ns: "common" })
      );
    }

    const submission = await this.submissionRepository.findOneAndUpdate(
      { _id: decoded.payload.submissionId },
      { $addToSet: { authors: ctxUser.id } }
    );
    if (!submission) {
      throw new Error(
        this.i18nService.translate("notFound", { ns: "submission" })
      );
    }

    return toSubmissionDTO(submission);
  }

  async removeAuthor(submissionId: ObjectId, authorId: ObjectId) {
    const submission = await this.submissionRepository.findOneAndUpdate(
      { _id: submissionId },
      { $pull: { authors: authorId } }
    );
    if (!submission) {
      throw new Error(
        this.i18nService.translate("notFound", { ns: "submission" })
      );
    }

    return toSubmissionDTO(submission);
  }
}
