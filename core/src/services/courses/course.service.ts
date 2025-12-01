import { ObjectId } from "mongodb";
import { DocumentType } from "@typegoose/typegoose";

import {
  AttendanceConnection,
  CourseArgs,
  CourseInput,
  CourseSessionInput,
} from "../../resolvers/types/course/course.types";
import { AttendanceRecord, CourseSession } from "../../entitites/Course";
import { I18nService } from "../i18n.service";
import mongoose from "mongoose";
import { Service } from "typedi";
import { CourseRepository } from "../../repositories/course.repository";
import { Repository } from "../../repositories/base.repository";
import { UserService } from "../user.service";
import { toDTO } from "../../util/helpers";
import { CourseAttendeeArgs } from "../../resolvers/types/course/courseAttendee.types";
import { CourseAttendeeRepository } from "../../repositories/courseAttendee.repository";
import { Status } from "../../entitites/Internship";

@Service()
export class CourseService {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly courseSessionRepository = new Repository(CourseSession),
    private readonly courseAttendeeRepository: CourseAttendeeRepository,
    private readonly attendanceRecordRepository = new Repository(
      AttendanceRecord
    ),
    private readonly i18nService: I18nService
  ) {}

  async getCourse(id: ObjectId) {
    const course = await this.courseRepository.findOne({ _id: id });
    if (!course) {
      throw new Error(this.i18nService.translate("notFound", { ns: "course" }));
    }

    return toDTO(course);
  }

  async getSession(id: ObjectId) {
    const session = await this.courseSessionRepository.findOne({ _id: id });
    if (!session) {
      throw new Error("Course session not found!");
    }

    return toDTO(session);
  }

  async getPaginatedCourses(args: CourseArgs) {
    return await this.courseRepository.paginatedCourses(args);
  }

  async createCourse(data: CourseInput) {
    const course = await this.courseRepository.create(data);

    return toDTO(course);
  }

  async updateCourse(id: ObjectId, data: CourseInput) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const updated = await this.courseRepository.findOneAndUpdate(
        { _id: id },
        { $set: data },
        { session, new: true }
      );
      if (!updated) {
        throw new Error(
          this.i18nService.translate("notFound", { ns: "course" })
        );
      }

      await session.commitTransaction();

      return toDTO(updated);
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

    return toDTO(deleted);
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

      return toDTO(courseSession);
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
        { session, new: true }
      );
      if (!courseSession) {
        throw new Error(
          this.i18nService.translate("notFound", { ns: "course" })
        );
      }

      await session.commitTransaction();

      return toDTO(courseSession);
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
      const res = await this.attendanceRecordRepository.deleteMany(
        { session: id },
        { session }
      );
      console.log(res);

      await session.commitTransaction();

      return toDTO(courseSession);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async updateAttendance(
    id: ObjectId,
    data: { online?: boolean; hoursAttended?: number }
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const attendanceRecord =
        await this.attendanceRecordRepository.findOneAndUpdate(
          {
            _id: id,
          },
          { $set: data },
          { session, new: true }
        );
      if (!attendanceRecord) {
        throw new Error("Attendance record not found!");
      }

      const courseSession = await this.courseSessionRepository.findOne(
        {
          _id: attendanceRecord.session,
        },
        { session }
      );
      if (!courseSession) {
        throw new Error("Course session not found!");
      }

      // ✅ Calculate session duration in hours
      const durationMs =
        new Date(courseSession.end).getTime() -
        new Date(courseSession.start).getTime();
      const durationHours = durationMs / (1000 * 60 * 60);

      if (data.hoursAttended && data.hoursAttended > durationHours) {
        throw new Error(
          `HoursAttended (${data.hoursAttended}) cannot exceed session duration (${durationHours} hours)`
        );
      }

      await session.commitTransaction();

      return toDTO(attendanceRecord);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async attendance(
    paginationArgs: CourseAttendeeArgs,
    courseId: ObjectId
  ): Promise<AttendanceConnection> {
    const [sessions, attendeesConnection] = await Promise.all([
      this.courseSessionRepository.findAll({ course: courseId }, null, {
        sort: { _id: 1 },
      }),
      this.courseAttendeeRepository.paginatedCourseAttendees({
        ...paginationArgs,
        courseId,
      }),
    ]);

    const edges = await Promise.all(
      attendeesConnection.edges.map(async (edge) => {
        if (edge.node.status !== Status.Accepted) {
          return {
            ...edge,
            node: {
              attendee: edge.node,
              attendanceRecords: [],
            },
          };
        } else {
          const existingRecords = await this.attendanceRecordRepository.findAll(
            {
              attendee: edge.node.id,
              session: { $in: sessions.map((s) => s._id) },
            },
            null,
            { sort: { session: 1 } }
          );

          const attendanceRecords: AttendanceRecord[] = [];
          for (const session of sessions) {
            const exists = existingRecords.find(
              (record) => record.session.toString() === session.id
            );
            if (exists) {
              attendanceRecords.push(toDTO(exists));
            } else {
              const newRecord = await this.attendanceRecordRepository.create({
                session: session._id,
                attendee: edge.node.id,
                hoursAttended: 0,
              });
              attendanceRecords.push(toDTO(newRecord));
            }
          }

          return {
            ...edge,
            node: {
              attendee: edge.node,
              attendanceRecords,
            },
          };
        }
      })
    );

    return {
      ...attendeesConnection,
      edges,
      sessions,
    };
  }
}
