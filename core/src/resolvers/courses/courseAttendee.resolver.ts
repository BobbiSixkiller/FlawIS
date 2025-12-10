import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { CourseAttendee, CourseAttendeeUserStub } from "../../entitites/Course";
import { Service } from "typedi";
import { CourseAttendeeService } from "../../services/courses/courseAttendee.service";
import { ObjectId } from "mongodb";
import { Status } from "../../entitites/Internship";
import { CourseAttendeeMutationResponse } from "../types/course/courseAttendee.types";
import { AttendeeBillingInput } from "../types/attendee.types";
import { Context } from "../../util/auth";
import { Access } from "../../entitites/User";
import { UserService } from "../../services/user.service";
import { CourseService } from "../../services/courses/course.service";

@Service()
@Resolver(() => CourseAttendee)
export class CourseAttendeeResolver {
  constructor(
    private readonly courseAttendeeService: CourseAttendeeService,
    private readonly userService: UserService
  ) {}

  @Authorized([Access.Admin])
  @Query(() => CourseAttendee)
  async courseAttendee(@Arg("id") id: ObjectId) {
    return await this.courseAttendeeService.getCourseAttendee(id);
  }

  @Authorized()
  @Mutation(() => CourseAttendeeMutationResponse)
  async createCourseAttendee(
    @Arg("courseId") courseId: ObjectId,
    @Arg("fileUrls", () => [String]) fileUrls: string[],
    @Ctx() { req, user }: Context,
    @Arg("billing", () => AttendeeBillingInput, { nullable: true })
    billing?: AttendeeBillingInput
  ): Promise<CourseAttendeeMutationResponse> {
    const hostname = req.headers["tenant-domain"] as string;

    const attendee = await this.courseAttendeeService.createCourseAttendee(
      hostname,
      courseId,
      user!.id,
      fileUrls,
      billing
    );

    return { message: "Registracia na kurz prebehla uspesne!", data: attendee };
  }

  @Authorized()
  @Mutation(() => CourseAttendeeMutationResponse)
  async updateCourseAttendeeFiles(
    @Arg("id") id: ObjectId,
    @Arg("fileUrls", () => [String]) filesUrls: string[],
    @Ctx() { user }: Context
  ): Promise<CourseAttendeeMutationResponse> {
    const attendee = await this.courseAttendeeService.updateFiles(
      filesUrls,
      id,
      user!
    );

    return { message: "Vase dokumenty boli aktualizovane!", data: attendee };
  }

  @Authorized([Access.Admin])
  @Mutation(() => CourseAttendeeMutationResponse)
  async changeCourseAttendeeStatus(
    @Arg("id") id: ObjectId,
    @Arg("status", () => Status) status: Status,
    @Ctx() { req }: Context
  ): Promise<CourseAttendeeMutationResponse> {
    const hostname = req.headers["tenant-domain"] as string;

    const attendee = await this.courseAttendeeService.updateAttendeeStatus(
      id,
      status,
      hostname
    );

    return { message: "Status ucastnika bol zmeneny!", data: attendee };
  }

  @Authorized()
  @Mutation(() => CourseAttendeeMutationResponse)
  async deleteCourseAttendee(
    @Arg("id") id: ObjectId,
    @Ctx() { user }: Context
  ): Promise<CourseAttendeeMutationResponse> {
    const attendee = await this.courseAttendeeService.deleteAttendee(id, user!);

    return { message: "Ucastnik kurzu bol vymazaný!", data: attendee };
  }

  @FieldResolver(() => CourseAttendeeUserStub)
  async user(@Root() { user: userStub }: CourseAttendee) {
    try {
      const user = await this.userService.getUser(userStub.id);

      return { ...userStub, avatarUrl: user.avatarUrl };
    } catch (error: any) {
      console.log(error.message);
      return userStub;
    }
  }
}
