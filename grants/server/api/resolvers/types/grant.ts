import { Field, ArgsType, Int, InputType } from "type-graphql";
import { Min, Max, IsInt, IsDate, IsString, IsMongoId } from "class-validator";
import { ObjectId } from "mongodb";

import { NameExists, RefDocExists } from "../../util/decorators";
import { Budget, Grant, Member } from "../../entitites/Grant";

@InputType()
export class GrantInput implements Partial<Grant> {
  @Field()
  @IsString()
  @NameExists(Grant, { message: "Grant with provided name already exists!" })
  name: string;

  @Field()
  @IsDate()
  start: Date;

  @Field()
  @IsDate()
  end: Date;

  @Field(() => [String])
  @IsString({ each: true })
  files: string[];
}

export class MemberInput implements Partial<Member> {
  @Field()
  @IsMongoId()
  user: ObjectId;

  @Field()
  @IsInt()
  hours: number;
}

@InputType()
export class BudgetInput
  implements Omit<Budget, "id" | "members" | "createdAt" | "updatedAt">
{
  @Field()
  @IsDate()
  year: Date;

  @Field(() => [MemberInput])
  members: MemberInput[];

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
export class GrantArgs {
  @Field(() => String, { nullable: true })
  @RefDocExists(Grant, {
    message: "Cursor's document not found!",
  })
  after?: ObjectId;

  @Field(() => Int, { defaultValue: 20, nullable: true })
  @Min(1)
  @Max(50)
  first?: number;
}
