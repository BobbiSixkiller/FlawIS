import {
  ArgsType,
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from "type-graphql";
import { ObjectId } from "mongodb";
import { CreateArgs, CreateConnection } from "../pagination.types";
import { CourseAttendee } from "../../../entitites/Course";
import { IMutationResponse } from "../interface.types";

export enum CourseAttendeeSortableField {
  NAME = "name",
  ID = "_id",
}

registerEnumType(CourseAttendeeSortableField, {
  name: "CourseAttendeeSortableField",
  description: "Sortable enum definition for course attendees query",
});

@ArgsType()
export class CourseAttendeeArgs extends CreateArgs(
  CourseAttendee,
  CourseAttendeeSortableField
) {}

@ObjectType()
export class CourseAttendeeConnection extends CreateConnection(
  CourseAttendee
) {}

@ObjectType({ implements: IMutationResponse })
export class CourseAttendeeMutationResponse extends IMutationResponse {
  @Field(() => CourseAttendee)
  data: CourseAttendee;
}
