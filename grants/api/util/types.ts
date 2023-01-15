import { ObjectId } from "mongodb";

export type User = {
	id: ObjectId;
	name: string;
	email: string;
	role: string;
	permissions: string[];
};

export type Translation = {
	language: string;
};
