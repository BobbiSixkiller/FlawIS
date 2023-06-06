import { IsPhoneNumber, IsString, Length } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType({ description: "User input type" })
export class ConferenceUserInput {
  @Field()
  @Length(1, 100, {
    message: "Name of the organisation must be 1-200 characters long!",
  })
  organisation: string;

  @Field()
  @IsPhoneNumber()
  telephone: string;

  @Field({ nullable: true })
  @IsString()
  titlesBefore?: string;

  @Field({ nullable: true })
  @IsString()
  titlesAfter?: string;
}
