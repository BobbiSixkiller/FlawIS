import {
  InputType,
  Field,
  ArgsType,
  Authorized,
  ObjectType,
  registerEnumType,
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
import { CreateArgs, CreateConnection } from "./pagination.types";
import { IMutationResponse } from "./interface.types";
import { I18nService } from "../../services/i18n.service";
import Container from "typedi";
import { AddressInput } from "./conference.types";

export enum UserSortableField {
  NAME = "name",
  ID = "_id",
}

registerEnumType(UserSortableField, {
  name: "UserSortableField",
  description: "Sortable enum definition for users query",
});

@InputType()
export class UserFilterInput {
  @Field(() => [Access], { nullable: true })
  access?: Access[];
}

@ArgsType()
export class UserArgs extends CreateArgs(User, UserSortableField) {
  @Field(() => UserFilterInput, { nullable: true })
  filter?: UserFilterInput;
}

@ObjectType({
  description: "UserConnection type enabling cursor based pagination",
})
export class UserConnection extends CreateConnection(User) {}

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
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)\S{8,}$/, {
    message: () =>
      Container.get(I18nService).translate("password", {
        ns: "validation",
      }),
  })
  password?: string;

  @Authorized(["ADMIN"])
  @Field(() => [Access], { nullable: true })
  access?: Access[];

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
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)\S{8,}$/, {
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
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)\S{8,}$/, {
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
