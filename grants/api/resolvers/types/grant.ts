import { Field, ArgsType, InputType, ObjectType, ID } from "type-graphql";
import {
  IsInt,
  IsDate,
  IsString,
  IsBoolean,
  IsMongoId,
  Min,
} from "class-validator";
import { ObjectId } from "mongodb";

import { NameExists, RefDocExists } from "../../util/validation";
import { Budget, Grant, GrantType, Member } from "../../entitites/Grant";
import { CreateConnection, CreatePaginationArgs } from "./pagination";
import { User } from "../../entitites/User";
import { Ref } from "@typegoose/typegoose";

@InputType()
export class GrantInput implements Partial<Grant> {
  @Field()
  @NameExists(Grant, { message: "Grant with provided name already exists!" })
  name: string;

  @Field(() => GrantType)
  type: GrantType;

  @Field()
  @IsDate()
  start: Date;

  @Field()
  @IsDate()
  end: Date;
}

@InputType()
export class MemberInput implements Partial<Member> {
  @Field(() => ID)
  @RefDocExists(User)
  user: Ref<User>;

  @Field(() => Boolean)
  @IsBoolean()
  isMain: boolean;

  @Field()
  @Min(1)
  hours: number;
}

@InputType()
export class BudgetInput implements Partial<Budget> {
  @Field()
  @IsDate()
  year: Date;

  @Field()
  @IsInt()
  travel: number;

  @Field()
  @IsInt()
  material: number;

  @Field()
  @IsInt()
  services: number;

  @Field()
  @IsInt()
  indirect: number;

  @Field()
  @IsInt()
  salaries: number;
}

@ArgsType()
export class GrantArgs extends CreatePaginationArgs(Grant) {}

@ObjectType({
  description: "GrantConnection type enabling cursor based pagination",
})
export class GrantConnection extends CreateConnection(Grant) {}
