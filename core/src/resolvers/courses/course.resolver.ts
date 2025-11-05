import { ObjectId } from "mongodb";
import {
  Arg,
  Args,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { Service } from "typedi";
import { CourseService } from "../../services/courses/course.service";
import { I18nService } from "../../services/i18n.service";
import { Course, CourseAttendee } from "../../entitites/Course";
import {
  AttendanceConnection,
  CourseArgs,
  CourseConnection,
  CourseInput,
  CourseMutationResponse,
} from "../types/course/course.types";
import { CourseAttendeeService } from "../../services/courses/courseAttendee.service";
import { Context } from "../../util/auth";
import { CourseAttendeeArgs } from "../types/course/courseAttendee.types";

@Service()
@Resolver(() => Course)
export class CourseResolver {
  constructor(
    private readonly courseService: CourseService,
    private readonly courseAttendeeService: CourseAttendeeService,
    private readonly i18nService: I18nService
  ) {}

  @Query(() => Course)
  async course(@Arg("id") id: ObjectId) {
    return await this.courseService.getCourse(id);
  }

  @Query(() => CourseConnection)
  async courses(@Args() args: CourseArgs) {
    return await this.courseService.getPaginatedCourses(args);
  }

  @Mutation(() => CourseMutationResponse)
  async createCourse(@Arg("data") data: CourseInput) {
    const course = await this.courseService.createCourse(data);

    return {
      data: course,
      message: this.i18nService.translate("new", {
        ns: "course",
        name: course.name,
      }),
    };
  }

  @Mutation(() => CourseMutationResponse)
  async updateCourse(@Arg("id") id: ObjectId, @Arg("data") data: CourseInput) {
    const course = await this.courseService.updateCourse(id, data);

    return {
      data: course,
      message: this.i18nService.translate("update", {
        ns: "course",
        name: course.name,
      }),
    };
  }

  @Mutation(() => CourseMutationResponse)
  async deleteCourse(@Arg("id") id: ObjectId) {
    const course = await this.courseService.deleteCourse(id);

    return {
      data: course,
      message: this.i18nService.translate("delete", {
        ns: "course",
        name: course.name,
      }),
    };
  }

  @Authorized()
  @FieldResolver(() => CourseAttendee, { nullable: true })
  async attending(@Root() { id }: Course, @Ctx() { user }: Context) {
    return await this.courseAttendeeService.getAttending(id, user!.id);
  }

  @Authorized()
  @FieldResolver(() => AttendanceConnection)
  async attendance(@Root() { id }: Course, @Args() args: CourseAttendeeArgs) {
    return await this.courseService.attendance(args, id);
  }
}
