import { ObjectId } from "mongodb";
import { Arg, Mutation, Resolver } from "type-graphql";
import { Service } from "typedi";
import { CourseService } from "../../services/courses/course.service";
import { I18nService } from "../../services/i18n.service";
import { CourseSession } from "../../entitites/Course";
import {
  CourseSessionInput,
  CourseSessionMutationResponse,
} from "../types/course.types";

@Service()
@Resolver(() => CourseSession)
export class CourseSessionResolver {
  constructor(
    private readonly courseService: CourseService,
    private readonly i18nService: I18nService
  ) {}

  @Mutation(() => CourseSessionMutationResponse)
  async createCourseSession(@Arg("data") data: CourseSessionInput) {
    const courseSession = await this.courseService.createCourseSession(data);

    return {
      data: courseSession,
      message: this.i18nService.translate("new", {
        ns: "course",
        name: courseSession.name,
      }),
    };
  }

  @Mutation(() => CourseSessionMutationResponse)
  async updateCourseSession(
    @Arg("id") id: ObjectId,
    @Arg("data") data: CourseSessionInput
  ) {
    const course = await this.courseService.updateCourseSession(id, data);

    return {
      data: course,
      message: this.i18nService.translate("update", {
        ns: "course",
        name: course.name,
      }),
    };
  }

  @Mutation(() => CourseSessionMutationResponse)
  async deleteCourseSession(@Arg("id") id: ObjectId) {
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
