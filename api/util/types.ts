import { ObjectId } from "mongodb";

export type User = {
	id: ObjectId;
	email: string;
	name: string;
	role: string;
	permissions: string[];
};
