import { ObjectId } from "mongodb";
import { Course, CourseTermAttendee } from "../../entitites/Course";
import { CreateArgs, CreateConnection } from "./pagination.types";
import { ArgsType, Field, InputType, Int, ObjectType } from "type-graphql";
import { IMutationResponse } from "./interface.types";
import { FlawBilling } from "../../entitites/Billing";
import { FlawBillingInput } from "./conference.types";
import { IsInt, IsPositive, IsString, Min } from "class-validator";

@ArgsType()
export class CourseArgs extends CreateArgs(Course) {}

@ObjectType()
export class CourseConnection extends CreateConnection(Course) {}

@ArgsType()
export class CourseTermAttendeeArgs extends CreateArgs(CourseTermAttendee) {
  @Field(() => ObjectId)
  termId: ObjectId;
}

@ObjectType()
export class CourseTermAttendeeConnection extends CreateConnection(
  CourseTermAttendee
) {}

@ObjectType({ implements: IMutationResponse })
export class CourseMutationResponse extends IMutationResponse {
  @Field(() => Course)
  data: Course;
}

@InputType()
export class CourseInput implements Partial<Course> {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  description: string;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  price: number;

  @Field(() => FlawBillingInput, { nullable: true })
  billing?: FlawBilling;
}
