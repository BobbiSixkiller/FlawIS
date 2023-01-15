import { getModelForClass } from "@typegoose/typegoose";
import { createParamDecorator } from "type-graphql";
import { Announcement } from "../entitites/Announcement";
import { Grant } from "../entitites/Grant";
import { Context } from "./auth";

export function LoadGrant(): ParameterDecorator {
	return createParamDecorator<Context>(async ({ args }) => {
		const grant = await getModelForClass(Grant).findOne({ _id: args.id });
		if (!grant) throw new Error("Grant not found!");

		return grant;
	});
}

export function LoadAnnouncement(): ParameterDecorator {
	return createParamDecorator<Context>(async ({ args }) => {
		const announcement = await getModelForClass(Announcement).findOne({
			_id: args.id,
		});
		if (!announcement) throw new Error("Announcement not found!");

		return announcement;
	});
}
