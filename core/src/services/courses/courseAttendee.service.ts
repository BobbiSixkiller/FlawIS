import { Service } from "typedi";
import { ObjectId } from "mongodb";
import { CourseAttendeeRepository } from "../../repositories/courseAttendee.repository";
import { I18nService } from "../i18n.service";
import { CourseService } from "./course.service";
import { AttendeeBillingInput } from "../../resolvers/types/attendee.types";
import mongoose from "mongoose";
import { UserService } from "../user.service";
import { Invoice } from "../../entitites/Attendee";
import { CourseRepository } from "../../repositories/course.repository";
import { Status } from "../../entitites/Internship";
import { toDTO } from "../../util/helpers";
import { CtxUser } from "../../util/types";
import { Access } from "../../entitites/User";
import { MinioService } from "../minio.service";
import { Repository } from "../../repositories/base.repository";
import { AttendanceRecord } from "../../entitites/Course";

@Service()
export class CourseAttendeeService {
  constructor(
    private readonly courseAttendeeRepository: CourseAttendeeRepository,
    private readonly attendanceRecordRepository = new Repository(
      AttendanceRecord
    ),
    private readonly courseService: CourseService,
    private readonly courseRepository: CourseRepository,
    private readonly userService: UserService,
    private readonly i18nService: I18nService,
    private readonly minioService: MinioService
  ) {}

  async getCourseAttendee(id: ObjectId) {
    const attendee = await this.courseAttendeeRepository.findOne({ _id: id });
    if (!attendee) {
      throw new Error(
        this.i18nService.translate("attendee.notFound", { ns: "course" })
      );
    }

    return toDTO(attendee);
  }

  async getAttending(courseId: ObjectId, ctxUserId: ObjectId) {
    const attendee = await this.courseAttendeeRepository.findOne({
      course: courseId,
      "user._id": ctxUserId,
    });

    return attendee ? toDTO(attendee) : null;
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
        this.courseService.getCourse(courseId),
        this.userService.getUser(userId),
      ]);

      const exists = await this.courseAttendeeRepository.findOne({
        course: courseId,
        "user._id": user.id,
      });
      if (exists) {
        throw new Error("You are already registered for this course!");
      }

      const priceWithouTax = course.price / Number(process.env.VAT || 1.23);
      const isFlaw = user.email.split("@")[1] === "flaw.uniba.sk";

      const attendee = await this.courseAttendeeRepository.create({
        course: course.id,
        user: {
          _id: user.id,
          email: user.email,
          name: user.name,
          organization: user.organization,
          telephone: user.telephone,
        },
        fileUrls,
        invoice:
          course.isPaid && course.billing
            ? ({
                body: {
                  body:
                    "Faktura za registracny poplatok na kurz: " + course.name,
                  comment:
                    "Neuhradenie faktury sa povazuje za zrusenie ucasti.",
                  type: "Faktura",
                  price: Math.round((priceWithouTax / 100) * 100) / 100,
                  vat: isFlaw
                    ? 0
                    : Math.round(
                        ((course.price - priceWithouTax) / 100) * 100
                      ) / 100,
                },
                issuer: {
                  ...course.billing,
                  variableSymbol:
                    course.billing.variableSymbol +
                    String(course.attendeesCount + 1).padStart(4, "0"),
                },
                payer: billing,
              } as Invoice)
            : undefined,
      });

      await this.courseRepository.updateMany(
        { _id: course.id },
        { $inc: { attendeesCount: 1 } }
      );

      await session.commitTransaction();

      return toDTO(attendee);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async updateFiles(fileUrls: string[], attendeeId: ObjectId, user: CtxUser) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const attendee = await this.courseAttendeeRepository.findOneAndUpdate(
        { _id: attendeeId },
        { $set: { fileUrls } },
        session
      );
      if (!attendee) {
        throw new Error("Attendee not found!");
      }
      if (
        attendee.user.id.toString() !== user.id.toString() &&
        !user.access.includes(Access.Admin)
      ) {
        throw new Error("Not allowed!");
      }

      await session.commitTransaction();

      return toDTO(attendee);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async updateAttendeeStatus(attendeeId: ObjectId, status: Status) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const attendee = await this.courseAttendeeRepository.findOneAndUpdate(
        { _id: attendeeId },
        { $set: { status } },
        { session, new: true }
      );
      if (!attendee) {
        throw new Error("Attendee not found!");
      }

      await session.commitTransaction();

      return toDTO(attendee);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async deleteAttendee(id: ObjectId, user: CtxUser) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const attendee = await this.courseAttendeeRepository.findOneAndDelete(
        { _id: id },
        { session }
      );
      if (!attendee) {
        throw new Error("Attendee not found!");
      }
      if (
        attendee.user.id.toString() !== user.id.toString() &&
        !user.access.includes(Access.Admin)
      ) {
        throw new Error("Not allowed!");
      }

      await Promise.all([
        this.courseRepository.findOneAndUpdate(
          { _id: attendee.course },
          { $inc: { attendeesCount: -1 } },
          { session, new: true }
        ),
        this.attendanceRecordRepository.deleteMany({}),
      ]);

      await this.minioService.deleteFiles(attendee.fileUrls);

      await session.commitTransaction();

      return toDTO(attendee);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
