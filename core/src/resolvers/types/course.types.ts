import { ObjectId } from "mongodb";
import { Category, Course, CourseAttendee } from "../../entitites/Course";
import { CreateArgs, CreateConnection } from "./pagination.types";
import {
  ArgsType,
  Field,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from "type-graphql";
import { IMutationResponse } from "./interface.types";
import { FlawBilling } from "../../entitites/Billing";
import { FlawBillingInput } from "./conference.types";
import { IsInt, IsString, Min } from "class-validator";
import { RefDocExists } from "../../util/decorators";
import Container from "typedi";
import { I18nService } from "../../services/i18n.service";

export enum CourseSortableField {}

registerEnumType(CourseSortableField, {
  name: "CourseSortableField",
  description: "Sortable enum definition for courses query",
});

@InputType()
export class CourseFilterInput {}

@ArgsType()
export class CourseArgs extends CreateArgs(Course, CourseSortableField) {
  @Field(() => CourseFilterInput, { nullable: true })
  filter?: CourseFilterInput;
}

@ObjectType()
export class CourseConnection extends CreateConnection(Course) {}

export enum CourseAttendeeSortableField {}

registerEnumType(CourseAttendeeSortableField, {
  name: "CourseAttendeeSortableField",
  description: "Sortable enum definition for course attendees query",
});

@InputType()
export class CourseAttendeeFilterInput {
  @Field(() => ObjectId)
  termId: ObjectId;
}

@ArgsType()
export class CourseAttendeeArgs extends CreateArgs(
  Course,
  CourseAttendeeSortableField
) {
  @Field(() => CourseAttendeeFilterInput, { nullable: true })
  filter?: CourseAttendeeFilterInput;
}

@ObjectType()
export class CourseAttendeeConnection extends CreateConnection(
  CourseAttendee
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
  @IsString()
  description: string;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  price: number;

  @Field(() => FlawBillingInput, { nullable: true })
  billing?: FlawBilling;
}
