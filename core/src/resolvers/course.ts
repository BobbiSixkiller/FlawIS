import { ObjectId } from "mongodb";
import { Arg, Args, Mutation, Query, Resolver } from "type-graphql";
import { Service } from "typedi";
import { CourseService } from "../services/course.service";
import { I18nService } from "../services/i18n.service";
import { Course } from "../entitites/Course";
import {
  CourseArgs,
  CourseConnection,
  CourseInput,
  CourseMutationResponse,
} from "./types/course";

@Service()
@Resolver(() => Course)
export class CourseResolver {
  constructor(
    private readonly courseService: CourseService,
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
}
