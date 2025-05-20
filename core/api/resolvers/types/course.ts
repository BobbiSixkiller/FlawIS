import { ObjectId } from "mongodb";
import { Course, CourseTermAttendee } from "../../entitites/Course";
import { CreateArgs, CreateConnection } from "./pagination";
import { Field } from "type-graphql";

export class CourseArgs extends CreateArgs(Course) {}
export class CourseConnection extends CreateConnection(Course) {}

export class CourseTermAttendeeArgs extends CreateArgs(CourseTermAttendee) {
  @Field(() => ObjectId)
  termId: ObjectId;
}
export class CourseTermAttendeeConnection extends CreateConnection(
  CourseTermAttendee
) {}
