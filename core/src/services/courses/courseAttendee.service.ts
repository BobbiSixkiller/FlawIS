import { Service } from "typedi";
import { ObjectId } from "mongodb";
import { CourseAttendeeRepository } from "../../repositories/courseAttendee.repository";
import { I18nService } from "../i18n.service";
import { CourseService, toDTO } from "./course.service";
import { CourseAttendeeArgs } from "../../resolvers/types/course.types";
import { AttendeeBillingInput } from "../../resolvers/types/attendee.types";
import mongoose from "mongoose";
import { UserService } from "../user.service";
import { Invoice } from "../../entitites/Attendee";
import { CourseRepository } from "../../repositories/course.repository";
import { Status } from "../../entitites/Internship";

@Service()
export class CourseAttendeeService {
  constructor(
    private readonly courseAttendeeRepository: CourseAttendeeRepository,
    private readonly courseService: CourseService,
    private readonly courseRepository: CourseRepository,
    private readonly userService: UserService,
    private readonly i18nService: I18nService
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

  async getPaginatedCourseAttendees(args: CourseAttendeeArgs) {
    return await this.courseAttendeeRepository.paginatedCourseTermAttendees(
      args
    );
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

      await this.courseRepository.update(
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

  async deleteAttendee(id: ObjectId) {
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

      await this.courseRepository.findOneAndUpdate(
        { _id: attendee.course },
        { $inc: { attendeesCount: -1 } },
        { session, new: true }
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
}
