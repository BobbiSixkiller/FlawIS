import { ObjectId } from "mongodb";
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
import { Service } from "typedi";
import { Conference } from "../entitites/Conference";
import { Section } from "../entitites/Section";
import { Submission } from "../entitites/Submission";
import { CRUDservice } from "../services/CRUDservice";
import { Context, signJwt } from "../util/auth";
import { CheckConferenceSection } from "../util/decorators";
import { localizeInput } from "../util/locale";
import { sendMail } from "../util/mail";
import { ConferenceSection } from "../util/types";
import { SubmissionInput } from "./types/submission";

@Service()
@Resolver(() => Submission)
export class SubmissionResolver {
	constructor(
		private readonly submissionService = new CRUDservice(Submission),
		private readonly conferenceService = new CRUDservice(Conference),
		private readonly sectionService = new CRUDservice(Section)
	) {}

	@Authorized()
	@Query(() => Submission)
	async submission(@Arg("id") id: ObjectId): Promise<Submission> {
		const submission = await this.submissionService.findOne({ _id: id });
		if (!submission) throw new Error("Submission not found!");

		return submission;
	}

	@Authorized()
	@Mutation(() => Submission)
	async addSubmission(
		@Arg("data") data: SubmissionInput,
		@CheckConferenceSection() { conference, section }: ConferenceSection,
		@Ctx() { user, locale }: Context
	): Promise<Submission> {
		const submission = await this.submissionService.create({
			...localizeInput(data, data.translations, locale),
			conference: conference.id,
			section: section.id,
			authors: [{ id: user!.id }],
		});

		if (data.authors) {
			const token = signJwt(
				{ submissionId: submission.id, conferenceId: conference.id },
				{ expiresIn: "7d" }
			);

			sendMail(
				data.authors,
				conference.name,
				`You've been added to authors list of the submission: ${
					submission.name
				} uploaded by ${user!.name} to section "${section.name}" of the ${
					conference.name
				} conference.\n\nPlease copy following link to your browser:\n\n${token}\n\nBest regards,\n\n${
					conference.name
				} team`,
				`<html><head></head><body><p>You've been added to authors list of the submission: ${
					submission.name
				} uploaded by ${user!.name} to section "${section.name}" of the ${
					conference.name
				} conference.</p><p>If you wish to participate please click on the following <a>link ${token}</a></p><p>Best regards,</p><p>${
					conference.name
				} team</p></body></html>`,
				[]
			);
		}

		return submission;
	}

	@Authorized()
	@Mutation(() => Submission)
	async updateSubmission(
		@Arg("id") id: ObjectId,
		@Arg("data") data: SubmissionInput,
		@Ctx() { locale }: Context
	): Promise<Submission> {
		const submission = await this.submissionService.findOne({ _id: id });
		if (!submission) throw new Error("Submission not found!");

		for (const [key, value] of Object.entries(
			localizeInput(data, data.translations, locale)
		)) {
			submission[key as keyof Submission] = value;
		}

		return await submission.save();
	}

	@Authorized()
	@Mutation(() => Boolean)
	async deleteSubmission(@Arg("id") id: ObjectId): Promise<boolean> {
		const { deletedCount } = await this.submissionService.delete({ _id: id });
		return deletedCount > 0;
	}

	@Authorized()
	@FieldResolver(() => Conference, { nullable: true })
	async conference(
		@Root() { conference }: Submission
	): Promise<Conference | null> {
		return await this.conferenceService.findOne({ _id: conference });
	}

	@Authorized()
	@FieldResolver(() => Section, { nullable: true })
	async section(@Root() { section }: Submission): Promise<Section | null> {
		return await this.sectionService.findOne({ _id: section });
	}
}
