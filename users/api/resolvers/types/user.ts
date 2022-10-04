import { InputType, Field, ArgsType, Int, Authorized } from "type-graphql";
import {
  Length,
  IsEmail,
  Matches,
  Min,
  Max,
  IsPhoneNumber,
} from "class-validator";
import { ObjectId } from "mongodb";

import { Role, User } from "../../entitites/User";
import { RefDocExists } from "../../util/validation";

@ArgsType()
export class UserArgs {
  @Field(() => String, { nullable: true })
  @RefDocExists(User, {
    message: "Cursor's document not found!",
  })
  after?: ObjectId;

  @Field(() => Int, { defaultValue: 20, nullable: true })
  @Min(1)
  @Max(50)
  first?: number;

  @Field(() => String, { nullable: true })
  @RefDocExists(User, {
    message: "Cursor's document not found!",
  })
  before?: ObjectId;

  @Field(() => Int, { defaultValue: 20, nullable: true })
  @Min(1)
  @Max(50)
  last?: number;
}

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

  @Field()
  @Length(1, 100, {
    message: "Name of the organisation must be 1-200 characters long!",
  })
  organisation: string;

  @Field()
  @IsPhoneNumber()
  telephone: string;
}

@InputType({ description: "User update input data" })
export class UserInput implements Partial<User> {
  @Field()
  @Length(1, 100, { message: "Name must be 1-100 characters long!" })
  name: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @Length(1, 100, {
    message: "Name of the organisation must be 1-200 characters long!",
  })
  organisation: string;

  @Authorized(["ADMIN"])
  @Field({ nullable: true })
  role?: Role;

  @Field()
  @IsPhoneNumber()
  telephone: string;
}