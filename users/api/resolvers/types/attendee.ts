import { ObjectId } from "mongodb";
import { Field, InputType } from "type-graphql";
import { SubmissionInput } from "./submission";
import { Billing } from "../../entitites/Billing";
import { IsString } from "class-validator";
import { AddressInput } from "./conference";

@InputType()
export class AttendeeBillingInput implements Billing {
  @Field()
  @IsString()
  name: string;

  @Field(() => AddressInput)
  address: AddressInput;

  @Field({ nullable: true })
  @IsString()
  DIC?: string;

  @Field({ nullable: true })
  @IsString()
  ICDPH?: string;

  @Field({ nullable: true })
  @IsString()
  ICO?: string;
}

@InputType({ description: "Conference registration input type" })
export class AttendeeInput {
  @Field()
  conferenceId: ObjectId;

  @Field()
  ticketId: ObjectId;

  @Field({ nullable: true })
  submissionId?: ObjectId;

  @Field(() => SubmissionInput)
  submission: SubmissionInput;

  @Field(() => AttendeeBillingInput)
  billing: AttendeeBillingInput;
}
