import { ObjectId } from "mongodb";
import { DocumentType } from "@typegoose/typegoose";

import {
  CourseArgs,
  CourseInput,
  CourseSessionInput,
} from "../resolvers/types/course.types";
import {
  AttendaceRecord,
  Category,
  Course,
  CourseAttendeeUserStub,
  CourseSession,
} from "../entitites/Course";
import { I18nService } from "./i18n.service";
import mongoose from "mongoose";
import { Service } from "typedi";
import { CourseRepository } from "../repositories/course.repository";
import { Repository } from "../repositories/base.repository";
import { CourseAttendeeRepository } from "../repositories/courseAttendee.repository";
import { CtxUser } from "../util/types";
import { UserService } from "./user.service";
import {
  AttendeeBillingInput,
  InvoiceInput,
} from "../resolvers/types/attendee.types";
import { Billing } from "../entitites/Billing";

function toCourseDTO(doc: DocumentType<Course>) {
  const obj = doc.toJSON({
    versionKey: false,
    virtuals: false,
    transform(_doc, ret) {
      if (ret._id) {
        ret.id = ret._id;
        delete ret._id;
      }

      return ret;
    },
  });

  return obj as Course;
}

function toSessionDTO(doc: DocumentType<CourseSession>) {
  const obj = doc.toJSON({
    versionKey: false,
    virtuals: false,
    transform(_doc, ret) {
      if (ret._id) {
        ret.id = ret._id;
        delete ret._id;
      }

      return ret;
    },
  });

  return obj as CourseSession;
}

function toAttendanceDTO(doc: DocumentType<AttendaceRecord>) {
  const obj = doc.toJSON({
    versionKey: false,
    virtuals: false,
    transform(_doc, ret) {
      if (ret._id) {
        ret.id = ret._id;
        delete ret._id;
      }

      return ret;
    },
  });

  return obj as AttendaceRecord;
}

@Service()
export class CourseService {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly courseSessionRepository = new Repository(CourseSession),
    private readonly courseAttendeeRepository: CourseAttendeeRepository,
    private readonly attendanceRecordRepository = new Repository(
      AttendaceRecord
    ),
    private readonly userService: UserService,
    private readonly i18nService: I18nService
  ) {}

  async getCourse(id: ObjectId) {
    const course = await this.courseRepository.findOne({ _id: id });
    if (!course) {
      throw new Error(this.i18nService.translate("notFound", { ns: "course" }));
    }

    return toCourseDTO(course);
  }

  async getPaginatedCourses(args: CourseArgs) {
    return await this.courseRepository.paginatedCourses(args);
  }

  async createCourse(data: CourseInput) {
    const course = await this.courseRepository.create(data);

    return toCourseDTO(course);
  }

  async updateCourse(id: ObjectId, data: CourseInput) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const updated = await this.courseRepository.findOneAndUpdate(
        { _id: id },
        data,
        session
      );
      if (!updated) {
        throw new Error(
          this.i18nService.translate("notFound", { ns: "course" })
        );
      }

      await session.commitTransaction();

      return toCourseDTO(updated);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async deleteCourse(id: ObjectId) {
    const deleted = await this.courseRepository.findOneAndDelete({ _id: id });
    if (!deleted) {
      throw new Error(this.i18nService.translate("notFound", { ns: "course" }));
    }

    return toCourseDTO(deleted);
  }

  async createCourseSession(data: CourseSessionInput) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // test if using service method instead of a repository method which can have session as an arg also prevents creating new courseSession doc
      await this.getCourse(data.course._id);
      const courseSession = await this.courseSessionRepository.create(data, {
        session,
      });

      await session.commitTransaction();

      return toSessionDTO(courseSession);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async updateCourseSession(id: ObjectId, data: CourseSessionInput) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const courseSession = await this.courseSessionRepository.findOneAndUpdate(
        { _id: id },
        { $set: { ...data } },
        { session }
      );
      if (!courseSession) {
        throw new Error(
          this.i18nService.translate("notFound", { ns: "course" })
        );
      }

      await session.commitTransaction();

      return toSessionDTO(courseSession);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async deleteCourseSession(id: ObjectId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const courseSession = await this.courseSessionRepository.findOneAndDelete(
        {
          _id: id,
        },
        { session }
      );
      if (!courseSession) {
        throw new Error(
          this.i18nService.translate("notFound", { ns: "course" })
        );
      }

      await session.commitTransaction();

      return toSessionDTO(courseSession);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async createCourseAttendee(
    courseId: ObjectId,
    userId: ObjectId,
    fileUrls: string[],
    billing?: AttendeeBillingInput
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const [course, user] = await Promise.all([
        this.getCourse(courseId),
        this.userService.getUser(userId),
      ]);

      const exists = await this.courseAttendeeRepository.findOne({
        _id: courseId,
        "user._id": user.id,
      });
      if (exists) {
        throw new Error("You are already registered for this course!");
      }

      const attendee = await this.courseAttendeeRepository.create({
        course: course.id,
        user: {
          _id: user.id,
          email: user.email,
          name: user.name,
          organization: user.organization,
        },
        fileUrls,
        invoice: course.isPaid
          ? ({
              body: {},
              issuer: course.billing,
              payer: billing,
            } as InvoiceInput)
          : undefined,
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async updateAttendance(
    id: ObjectId,
    data: { online?: boolean; hoursAttended?: boolean }
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const attendanceRecord =
        await this.attendanceRecordRepository.findOneAndUpdate(
          {
            _id: id,
          },
          { data },
          { session }
        );
      if (!attendanceRecord) {
        throw new Error(
          this.i18nService.translate("notFound", { ns: "course" })
        );
      }

      await session.commitTransaction();

      return toAttendanceDTO(attendanceRecord);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
