import {
	Arg,
	Args,
	Authorized,
	Ctx,
	Mutation,
	Query,
	Resolver,
} from "type-graphql";
import { ObjectId, ChangeStreamDocument } from "mongodb";
import { Service } from "typedi";
import { CRUDservice } from "../services/CRUDservice";

import env from "dotenv";
import { LoadAnnouncement } from "../util/decorators";
import { DocumentType } from "@typegoose/typegoose/lib/types";
import { Announcement } from "../entitites/Announcement";
import {
	AnnouncementArgs,
	AnnouncementConnection,
	AnnouncementInput,
} from "./types/announcement";
import { Context } from "../util/auth";
import { Grant } from "../entitites/Grant";
import Messagebroker from "../util/rmq";
import { User } from "../entitites/User";

env.config();

@Service()
@Resolver(() => Announcement)
export class AnnouncementResolver {
	constructor(
		private readonly announcementService = new CRUDservice(Announcement),
		private readonly grantService = new CRUDservice(Grant)
	) {}

	@Authorized()
	@Query(() => AnnouncementConnection)
	async announcements(@Args() { after, first }: AnnouncementArgs) {
		const data =
			await this.announcementService.dataModel.paginatedAnnouncements(
				first,
				after
			);

		if (data[0].edges.length === 0) throw new Error("No announcements!");

		return data[0] as AnnouncementConnection;
	}

	@Authorized()
	@Query(() => Announcement)
	async announcement(
		@Arg("id") _id: ObjectId,
		@LoadAnnouncement() announcement: DocumentType<Announcement>
	) {
		return announcement;
	}

	@Authorized()
	@Mutation(() => Announcement)
	async createAnnouncement(
		@Ctx() { user, locale }: Context,
		@Arg("data") { name, text, files, grantType, grantId }: AnnouncementInput
	) {
		const announcement = await this.announcementService.create({
			name,
			text,
			files,
			user: user?.id,
		});

		await this.grantService.update(
			{ $or: [{ type: grantType }, { _id: grantId }] },
			{ $addToSet: { announcements: announcement.id } }
		);

		const aggregation = await this.grantService.aggregate([
			{
				$match: { announcements: new ObjectId(announcement.id) },
			},
			{ $unwind: "$budgets" },
			{
				$match: {
					$expr: {
						$eq: [{ $year: "$budgets.year" }, { $year: new Date() }],
					},
				},
			},
			{ $unwind: "$budgets.members" },
			{
				$lookup: {
					from: "users",
					localField: "budgets.members.user",
					foreignField: "_id",
					as: "user_doc",
				},
			},
			{ $unwind: "$user_doc" },
			{
				$group: {
					_id: null,
					users: { $addToSet: "$user_doc" },
					grants: { $addToSet: { id: "$_id", name: "$name" } },
				},
			},
		]);

		aggregation[0].users.forEach((user: User) =>
			Messagebroker.produceMessage(
				JSON.stringify({
					locale,
					email: user.email,
					name: user.name,
					announcement: announcement.name,
					grants: aggregation[0].grants,
				}),
				"mail.grantAnnouncemenet"
			)
		);

		return announcement;
	}

	@Authorized()
	@Mutation(() => Announcement)
	async updateAnnouncement(
		@Arg("data") data: AnnouncementInput,
		@Arg("id") _id: ObjectId,
		@LoadAnnouncement() announcement: DocumentType<Announcement>
	) {
		for (const [key, value] of Object.entries(data)) {
			announcement[key as keyof Announcement] = value;
		}

		return await announcement.save();
	}

	@Authorized()
	@Mutation(() => Announcement)
	async deleteAnnouncement(
		@Arg("id") _id: ObjectId,
		@LoadAnnouncement() announcement: DocumentType<Announcement>
	) {
		if (announcement.files.length !== 0) {
			for (const file of announcement.files) {
				Messagebroker.produceMessage(
					JSON.stringify({ path: file }),
					"file.delete"
				);
			}
		}

		await this.grantService.update(
			{ announcements: announcement.id },
			{ $pull: { announcements: announcement.id } }
		);

		return await announcement.remove();
	}
}
