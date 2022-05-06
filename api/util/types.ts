import { ObjectId } from "mongodb";

export type User = {
	id: ObjectId;
	email: string;
	role: string;
	permissions: string[];
};
