import { ObjectId } from "mongodb";
import {
  AttendanceRecord,
  Category,
  Course,
  CourseAttendee,
  CourseSession,
} from "../../../entitites/Course";
import { CreateArgs, CreateConnection } from "../pagination.types";
import {
  ArgsType,
  Field,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from "type-graphql";
import { IMutationResponse } from "../interface.types";
import { FlawBilling } from "../../../entitites/Billing";
import { FlawBillingInput } from "../conference.types";
import { IsDate, IsInt, IsString, Min } from "class-validator";
import { Ref } from "@typegoose/typegoose";
import { IsAfter, IsBefore, RefDocExists } from "../../../util/decorators";
import Container from "typedi";
import { I18nService } from "../../../services/i18n.service";

export enum CourseSortableField {
  NAME = "name",
  ID = "_id",
}

registerEnumType(CourseSortableField, {
  name: "CourseSortableField",
  description: "Sortable enum definition for courses query",
});

@InputType()
export class CourseFilterInput {
  @Field(() => [ObjectId], { nullable: "items", defaultValue: [] })
  categoryIds: ObjectId[];
}

@ArgsType()
export class CourseArgs extends CreateArgs(Course, CourseSortableField) {
  @Field(() => CourseFilterInput, { nullable: true })
  filter?: CourseFilterInput;
}

@ObjectType()
export class CourseConnection extends CreateConnection(Course) {}

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

  @Field(() => [ObjectId])
  @RefDocExists(Category, {
    each: true,
    message: () =>
      Container.get(I18nService).translate("categoryNotFound", {
        ns: "course",
      }),
  })
  categoryIds: ObjectId[];

  @Field()
  @IsDate()
  start: Date;

  @Field()
  @IsDate()
  end: Date;

  @Field()
  @IsDate()
  @IsBefore("start")
  registrationEnd: Date;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  maxAttendees: number;

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

@ObjectType({ implements: IMutationResponse })
export class CourseSessionMutationResponse extends IMutationResponse {
  @Field(() => CourseSession)
  data: CourseSession;
}

@InputType()
export class CourseSessionInput implements Partial<CourseSession> {
  @Field(() => ObjectId)
  @RefDocExists(Course)
  course: Ref<Course>;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  @IsBefore("end")
  start: Date;

  @Field()
  @IsAfter("start")
  end: Date;
}

@ObjectType({
  description: "represents one row of attendance matrix",
})
export class Attendance {
  @Field(() => CourseAttendee)
  attendee: CourseAttendee;

  @Field(() => [AttendanceRecord], { nullable: "items" })
  attendanceRecords: AttendanceRecord[];
}

@ObjectType()
export class AttendanceConnection extends CreateConnection(Attendance) {
  @Field(() => [CourseSession], { nullable: "items" })
  sessions: CourseSession[];
}
