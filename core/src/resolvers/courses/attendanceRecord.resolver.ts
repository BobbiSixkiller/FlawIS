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
import {
  AttendanceRecord,
  CourseAttendee,
  CourseSession,
} from "../../entitites/Course";
import { CourseAttendeeService } from "../../services/courses/courseAttendee.service";
import { AttendanceRecordMutationResponse } from "../types/course/courseAttendee.types";
import { Access } from "../../entitites/User";

@Service()
@Resolver(() => AttendanceRecord)
export class AttendanceRecordResolver {
  constructor(
    private readonly courseService: CourseService,
    private readonly courseAttendeeService: CourseAttendeeService,
    private readonly i18nService: I18nService
  ) {}

  @Authorized([Access.Admin])
  @Mutation(() => AttendanceRecordMutationResponse)
  async updateAttendanceHours(
    @Arg("id") id: ObjectId,
    @Arg("hoursAttended") hoursAttended: number
  ): Promise<AttendanceRecordMutationResponse> {
    const res = await this.courseService.updateAttendance(id, {
      hoursAttended,
    });

    return { message: "Pocet hodin bol aktualizovany!", data: res };
  }

  @Authorized()
  @Mutation(() => AttendanceRecordMutationResponse)
  async updateAttendanceOnline(
    @Arg("id") id: ObjectId,
    @Arg("online") online: boolean
  ): Promise<AttendanceRecordMutationResponse> {
    const res = await this.courseService.updateAttendance(id, { online });

    return { message: "Forma ucasti na termine aktualizovana!", data: res };
  }

  @FieldResolver(() => CourseSession)
  async session(@Root() record: AttendanceRecord) {
    return await this.courseService.getSession(record.session as any);
  }

  @FieldResolver(() => CourseAttendee)
  async attendee(@Root() record: AttendanceRecord) {
    return await this.courseAttendeeService.getCourseAttendee(
      record.attendee._id
    );
  }
}
