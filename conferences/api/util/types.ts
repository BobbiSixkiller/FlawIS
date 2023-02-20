import { ObjectId } from "mongodb";
import { Conference, Ticket } from "../entities/Conference";
import { Section } from "../entities/Section";

export type Ref<T> = T | ObjectId;

export type User = {
	id: ObjectId;
	name: string;
	email: string;
	role: string;
	permissions: string[];
};

export type VerifiedTicket = {
	ticket: Ticket;
	conference: Conference;
};

export type ConferenceSection = {
	conference: Conference;
	section: Section;
};

export type Translation = {
	language: string;
};
