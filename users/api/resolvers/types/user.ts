import {
	InputType,
	Field,
	ArgsType,
	Int,
	Authorized,
	ObjectType,
} from "type-graphql";
import { Length, IsEmail, Matches, } from "class-validator";

import { Role, User } from "../../entitites/User";
import { CreateArgs, CreateConnection } from "./pagination";

@ObjectType({
	description: "UserConnection type enabling cursor based pagination",
})
export class UserConnection extends CreateConnection(User) { }

@ArgsType()
export class UserArgs extends CreateArgs(User) { }

@InputType()
export class PasswordInput implements Partial<User> {
	@Field()
	@Matches(/^[a-zA-Z0-9!@#$&()\\-`.+,/\"]{8,}$/, {
		message: "Minimum 8 characters, at least 1 letter and 1 number!",
	})
	password: string;
}

@InputType({ description: "New user input data" })
export class RegisterInput extends PasswordInput implements Partial<User> {
	@Field()
	@Length(1, 100, { message: "Name can must be 1-100 characters long!" })
	name: string;

	@Field()
	@IsEmail()
	email: string;
}

@InputType({ description: "User update input data" })
export class UserInput implements Partial<User> {
	@Field()
	@Length(1, 100, { message: "Name must be 1-100 characters long!" })
	name: string;

	@Field()
	@IsEmail()
	email: string;

	@Authorized(["ADMIN"])
	@Field({ nullable: true })
	role?: Role;
}
