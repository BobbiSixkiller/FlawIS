import { Service } from "typedi";
import { ObjectId } from "mongodb";
import { CourseAttendeeRepository } from "../../repositories/courseAttendee.repository";
import { I18nService } from "../i18n.service";
import { CourseService } from "./course.service";
import { InvoiceOwnerType } from "../../resolvers/types/attendee.types";
import { Billing } from "../../entitites/Billing";
import mongoose from "mongoose";
import { UserService } from "../user.service";
import { CourseRepository } from "../../repositories/course.repository";
import { Status } from "../../entitites/Internship";
import { toDTO, withOptionalTransaction } from "../../util/helpers";
import { CtxUser } from "../../util/types";
import { Access } from "../../entitites/User";
import { MinioService } from "../minio.service";
import { Repository } from "../../repositories/base.repository";
import {
  AttendanceRecord,
  ElearningProvisioningStatus,
} from "../../entitites/Course";
import { RmqService, RoutingKey } from "../rmq.service";
import { FormSubmissionInput } from "../../resolvers/types/form/form.types";
import { FormService } from "../form.service";
import { FieldType } from "../../entitites/Form";
import { Reach360Service } from "../reach360.service";
import { InvoiceService } from "../invoice.service";
import { isDuplicateInvoiceNumberError } from "../../repositories/invoice.repository";

@Service()
export class CourseAttendeeService {
  constructor(
    private readonly courseAttendeeRepository: CourseAttendeeRepository,
    private readonly attendanceRecordRepository = new Repository(
      AttendanceRecord,
    ),
    private readonly courseService: CourseService,
    private readonly courseRepository: CourseRepository,
    private readonly userService: UserService,
    private readonly i18nService: I18nService,
    private readonly minioService: MinioService,
    private readonly rmqService: RmqService,
    private readonly formService: FormService,
    private readonly reach360Service: Reach360Service,
    private readonly invoiceService: InvoiceService,
  ) {}

  async getCourseAttendee(id: ObjectId) {
    const attendee = await this.courseAttendeeRepository.findOne({ _id: id });
    if (!attendee) {
      throw new Error(
        this.i18nService.translate("attendee.notFound", { ns: "course" }),
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
    hostname: string,
    courseId: ObjectId,
    userId: ObjectId,
    application: FormSubmissionInput,
    billing?: Billing,
  ) {
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

    const form = await this.formService.getForm(application.form);
    if (form.course.toString() !== course.id.toString()) {
      throw new Error("Form does not belong to this course!");
    }

    if (course.isPaid && (!course.billing || !billing)) {
      throw new Error(
        "Paid course registrations require issuer and payer billing information.",
      );
    }

    const attendeeId = new ObjectId();
    const { attendee, invoice } = await withOptionalTransaction(
      undefined,
      async (session) => {
        const invoice = course.isPaid
          ? await this.invoiceService.createInvoice({
              attendeeId,
              body: this.i18nService.translate("invoice.body", {
                ns: "course",
                name: course.name,
              }),
              comment: this.i18nService.translate("invoice.comment", {
                ns: "course",
              }),
              grossPriceCents: course.price,
              issuer: course.billing!,
              ownerType: InvoiceOwnerType.COURSE_ATTENDEE,
              payer: billing!,
              payerEmail: user.email,
              session,
              type: this.i18nService.translate("invoice.type", {
                ns: "course",
              }),
              userId: user.id,
            })
          : undefined;

        const attendee = await this.courseAttendeeRepository.create(
          {
            _id: attendeeId,
            course: course.id,
            user: {
              _id: user.id,
              email: user.email,
              name: user.name,
              organization: user.organization,
              telephone: user.telephone,
            },
            application: {
              form: application.form,
              formVersion: application.formVersion,
              answers: application.answers,
            },
            invoiceId: invoice?._id,
          },
          { session },
        );

        await this.courseRepository.updateMany(
          { _id: course.id },
          { $inc: { attendeesCount: 1 } },
          { session },
        );

        return { attendee, invoice };
      },
      isDuplicateInvoiceNumberError,
    );

    this.rmqService.produceMessage(
      JSON.stringify({
        locale: this.i18nService.language(),
        hostname,
        name: user.name,
        email: user.email,
        courseId: course.id,
        course: course.name,
        invoice: invoice ? this.invoiceService.toInvoice(invoice) : undefined,
      }),
      "mail.courses.applied",
    );

    return toDTO(attendee);
  }

  async updateCourseAttendee(
    attendeeId: ObjectId,
    application: FormSubmissionInput,
    userId: ObjectId,
  ) {
    const attendee = await this.courseAttendeeRepository.findOne({
      _id: attendeeId,
    });
    if (!attendee) {
      throw new Error("Attendee not found!");
    }

    if (attendee.status !== Status.Applied) {
      throw new Error("Cannot update application - status is not APPLIED!");
    }

    if (attendee.user.id.toString() !== userId.toString()) {
      throw new Error("Not authorized to update this application!");
    }

    const form = await this.formService.getForm(application.form);
    if (form.course.toString() !== attendee.course.toString()) {
      throw new Error("Form does not belong to this course!");
    }

    const updated = await this.courseAttendeeRepository.findOneAndUpdate(
      { _id: attendeeId },
      {
        $set: {
          application: {
            form: application.form,
            formVersion: application.formVersion,
            answers: application.answers,
          },
        },
      },
      { new: true },
    );

    return toDTO(updated!);
  }

  async updateAttendeeStatus(
    attendeeId: ObjectId,
    status: Status,
    hostname: string,
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    let shouldSyncElearning = false;

    try {
      const attendee = await this.courseAttendeeRepository.findOneAndUpdate(
        { _id: attendeeId },
        { $set: { status } },
        { session, new: true },
      );
      if (!attendee) {
        throw new Error("Attendee not found!");
      }
      const course = await this.courseRepository.findOne(
        {
          _id: attendee.course,
        },
        null,
        { session },
      );
      if (!course) {
        throw new Error("Course not found!");
      }
      shouldSyncElearning =
        status === Status.Accepted || Boolean(attendee.reachEnrollment);

      await this.rmqService.produceMessage(
        JSON.stringify({
          locale: this.i18nService.language(),
          hostname,
          name: attendee.user.name,
          email: attendee.user.email,
          courseId: course.id,
          course: course.name,
        }),
        `mail.courses.${status.toLowerCase()}` as RoutingKey,
      );

      await session.commitTransaction();

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

    const attendee = shouldSyncElearning
      ? await this.reach360Service.syncAttendee(attendeeId)
      : await this.courseAttendeeRepository.findOne({ _id: attendeeId });
    if (!attendee) {
      throw new Error("Attendee not found!");
    }
    return toDTO(attendee);
  }

  async deleteAttendee(id: ObjectId, user: CtxUser) {
    const existing = await this.courseAttendeeRepository.findOne({ _id: id });
    if (!existing) {
      throw new Error("Attendee not found!");
    }
    if (
      existing.user.id.toString() !== user.id.toString() &&
      !user.access.includes(Access.Admin)
    ) {
      throw new Error("Not allowed!");
    }

    if (existing.reachEnrollment) {
      const synced = await this.reach360Service.syncAttendee(id, false);
      if (
        synced.reachEnrollment?.status ===
        ElearningProvisioningStatus.SyncFailed
      ) {
        throw new Error(
          "Reach 360 access could not be revoked. Retry before deleting the attendee.",
        );
      }
    }

    return withOptionalTransaction(undefined, async (session) => {
      const attendee = await this.courseAttendeeRepository.findOneAndDelete(
        { _id: id },
        { session },
      );
      if (!attendee) {
        throw new Error("Attendee not found!");
      }
      const [_, __, form] = await Promise.all([
        this.courseRepository.findOneAndUpdate(
          { _id: attendee.course },
          { $inc: { attendeesCount: -1 } },
          { session, new: true },
        ),
        this.attendanceRecordRepository.deleteMany(
          { attendee: attendee._id },
          { session },
        ),
        this.formService.getForm(attendee.application.form),
      ]);

      const uploadField = form.fields.find(
        (f) => f.type === FieldType.FileUpload,
      );
      if (uploadField) {
        await this.minioService.deleteFiles(
          attendee.application.answers.get(
            uploadField.id.toString(),
          ) as string[],
        );
      }

      return toDTO(attendee);
    });
  }

  async syncElearningAccess(attendeeId: ObjectId) {
    const attendee = await this.reach360Service.syncAttendee(attendeeId);
    return toDTO(attendee);
  }
}
