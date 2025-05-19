import { ObjectId } from "mongodb";
import { Course, TermAttendee } from "../../entitites/Course";
import { CreateArgs, CreateConnection } from "./pagination";
import { Field } from "type-graphql";

export class CourseArgs extends CreateArgs(Course) {}
export class CourseConnection extends CreateConnection(Course) {}

export class TermAttendeeArgs extends CreateArgs(TermAttendee) {
  @Field(() => ObjectId)
  termId: ObjectId;
}
export class TermAttendeeConnection extends CreateConnection(TermAttendee) {}
