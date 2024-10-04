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
} from "class-validator";

import { Role, User } from "../../entitites/User";
import { CreateArgs, CreateConnection } from "./pagination";
import { IMutationResponse } from "./interface";
import { I18nService } from "../../services/i18nService";
import Container from "typedi";

@ObjectType({
  description: "UserConnection type enabling cursor based pagination",
})
export class UserConnection extends CreateConnection(User) {}

@ArgsType()
export class UserArgs extends CreateArgs(User) {}

@ObjectType({ implements: IMutationResponse })
export class UserMutationResponse extends IMutationResponse {
  @Field(() => User)
  data: User;
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
export class RegisterInput extends PasswordInput implements Partial<User> {
  @Field()
  @MaxLength(100, {
    message: (args: ValidationArguments) =>
      Container.get(I18nService).translate("maxLength", {
        ns: "validation",
        length: args.constraints[0],
      }),
  })
  name: string;

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
  @IsString()
  organization: string;

  @Field()
  @IsPhoneNumber(undefined, {
    message: (args: ValidationArguments) =>
      Container.get(I18nService).translate("phone", {
        ns: "validation",
        value: args.value,
      }),
  })
  telephone: string;
}

@InputType({ description: "User update input data" })
export class UserInput implements Partial<User> {
  @Field()
  @MaxLength(100, {
    message: (args: ValidationArguments) =>
      Container.get(I18nService).translate("maxLength", {
        ns: "validation",
        length: args.constraints[0],
      }),
  })
  name: string;

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
  @IsString()
  organization: string;

  @Field()
  @IsPhoneNumber(undefined, {
    message: (args: ValidationArguments) =>
      Container.get(I18nService).translate("phone", {
        ns: "validation",
        value: args.value,
      }),
  })
  telephone: string;

  @Authorized(["ADMIN"])
  @Field(() => Role, { nullable: true })
  role?: Role;

  @Authorized(["ADMIN"])
  @Field({ nullable: true })
  @Matches(/^[a-zA-Z0-9!@#$&()\\-`.+,/\"]{8,}$/, {
    message: () =>
      Container.get(I18nService).translate("password", {
        ns: "validation",
      }),
  })
  password?: string;
}
