import {
  InputType,
  Field,
  ArgsType,
  Authorized,
  ObjectType,
} from "type-graphql";
import {
  IsEmail,
  Matches,
  IsString,
  IsPhoneNumber,
  MaxLength,
  ValidationArguments,
  IsNumber,
  ArrayNotEmpty,
} from "class-validator";

import { Access, StudyProgramme, User } from "../../entitites/User";
import { CreateArgs, CreateConnection } from "./pagination";
import { IMutationResponse } from "./interface";
import { I18nService } from "../../services/i18nService";
import Container from "typedi";
import { AddressInput } from "./conference";

@ObjectType({
  description: "UserConnection type enabling cursor based pagination",
})
export class UserConnection extends CreateConnection(User) {}

@ArgsType()
export class UserArgs extends CreateArgs(User) {
  @Field(() => [Access], { nullable: true })
  access?: Access[];
}

@ObjectType({ implements: IMutationResponse })
export class UserMutationResponse extends IMutationResponse {
  @Field(() => User)
  data: User;
}

@InputType({ description: "FlawIS user base input" })
export class UserInput implements Partial<User> {
  @Field()
  @IsEmail(undefined, {
    message: (args: ValidationArguments) =>
      Container.get(I18nService).translate("email", {
        ns: "validation",
        value: args.value,
      }),
  })
  email: string;

  @Field({ nullable: true })
  @Matches(/^[a-zA-Z0-9!@#$&()\\-`.+,/\"]{8,}$/, {
    message: () =>
      Container.get(I18nService).translate("password", {
        ns: "validation",
      }),
  })
  password?: string;

  @Authorized(["ADMIN"])
  @Field(() => [Access], { nullable: true })
  access?: Access[];

  @Field()
  @MaxLength(100, {
    message: (args: ValidationArguments) =>
      Container.get(I18nService).translate("maxLength", {
        ns: "validation",
        length: args.constraints[0],
      }),
  })
  name: string;

  @Field({ nullable: true })
  address?: AddressInput;

  @Field({ nullable: true })
  @MaxLength(200, {
    message: (args: ValidationArguments) =>
      Container.get(I18nService).translate("maxLength", {
        ns: "validation",
        length: args.constraints[0],
      }),
  })
  organization?: string;

  @Field({ nullable: true })
  @IsPhoneNumber(undefined, {
    message: (args: ValidationArguments) =>
      Container.get(I18nService).translate("phone", {
        ns: "validation",
        value: args.value,
      }),
  })
  telephone?: string;

  @Field(() => StudyProgramme, { nullable: true })
  @IsNumber()
  studyProgramme?: StudyProgramme;

  @Field({ nullable: true })
  @IsString()
  cvUrl?: string;

  @Field({ nullable: true })
  @IsString()
  avatarUrl?: string;
}

@InputType()
export class PasswordInput implements Partial<User> {
  @Field()
  @Matches(/^[a-zA-Z0-9!@#$&()\\-`.+,/\"]{8,}$/, {
    message: () =>
      Container.get(I18nService).translate("password", {
        ns: "validation",
      }),
  })
  password: string;
}

@InputType({ description: "New user input data" })
export class RegisterUserInput extends UserInput {
  @Field()
  @Matches(/^[a-zA-Z0-9!@#$&()\\-`.+,/\"]{8,}$/, {
    message: () =>
      Container.get(I18nService).translate("password", {
        ns: "validation",
      }),
  })
  password: string;
}

@InputType({
  description:
    "Addresses of the organizations you want to invite to FlawIS/internships",
})
export class OrganizationEmails {
  @Field(() => [String])
  @ArrayNotEmpty()
  @IsEmail({}, { each: true })
  emails: string[];
}
