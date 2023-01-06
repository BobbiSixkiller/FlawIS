import { ObjectId } from "mongodb";
import { prop as Property } from "@typegoose/typegoose";
import { Directive, Field, ID, ObjectType } from "type-graphql";
import { Grant } from "./Grant";

@ObjectType()
@Directive("@extends")
@Directive(`@key(fields: "id")`)
export class User {
	@Directive("@external")
	@Field(() => ID)
	id: ObjectId;

	@Property()
	email: string;

	grants: Grant[];

	hours: number;
}
