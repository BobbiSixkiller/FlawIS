import {
	Arg,
	Args,
	Authorized,
	Ctx,
	Mutation,
	Query,
	Resolver,
} from "type-graphql";
import { ObjectId } from "mongodb";
import { Service } from "typedi";
import { CRUDservice } from "../services/CRUDservice";

import env from "dotenv";
import { LoadAnnouncement, LoadGrant } from "../util/decorators";
import { DocumentType } from "@typegoose/typegoose/lib/types";
import { Announcement } from "../entitites/Announcement";
import {
	AnnouncementArgs,
	AnnouncementConnection,
	AnnouncementInput,
} from "./types/announcement";
import { Context } from "../util/auth";
import { Grant } from "../entitites/Grant";

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
		@Ctx() { user }: Context,
		@Arg("data") { name, text, files, grantType, grantId }: AnnouncementInput
	) {
		const announcement = await this.announcementService.create({
			name,
			text,
			files,
			user: user?.id,
		});

		if (grantType) {
			await this.grantService.update(
				{ type: grantType },
				{ $addToSet: { announcements: announcement.id } }
			);
		}

		if (grantId) {
			await this.grantService.update(
				{ _id: grantId },
				{ $addToSet: { announcements: announcement._id } }
			);
		}

		return announcement;
	}

	@Authorized()
	@Mutation(() => Announcement)
	async updateAnnouncement(
		@Arg("data") data: AnnouncementInput,
		@Arg("id") _id: ObjectId,
		@LoadGrant() announcement: DocumentType<Announcement>
	) {
		for (const [key, value] of Object.entries(data)) {
			announcement[key as keyof Announcement] = value;
		}

		return await announcement.save();
	}

	@Authorized()
	@Mutation(() => Boolean)
	async deleteAnnouncement(@Arg("id") id: ObjectId) {
		const { deletedCount } = await this.announcementService.delete({ _id: id });
		return deletedCount > 0;
	}
}
