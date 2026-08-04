import { Index, Ref } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { prop as Property } from "@typegoose/typegoose";
import { ObjectId } from "mongodb";
import {
  Field,
  Float,
  Int,
  ObjectType,
  registerEnumType,
} from "type-graphql";
import { Billing } from "./Billing";
import { Invoice } from "./Invoice";
import { UserStub } from "./User";
import { Status } from "./Internship";
import { Form, FormSubmission } from "./Form";

export enum ElearningProvisioningStatus {
  PendingInvitation = "PENDING_INVITATION",
  Enrolled = "ENROLLED",
  Revoked = "REVOKED",
  SyncFailed = "SYNC_FAILED",
}

registerEnumType(ElearningProvisioningStatus, {
  name: "ElearningProvisioningStatus",
  description: "Current synchronization state of a Reach 360 enrollment.",
});

@ObjectType()
export class ReachCourseConfig {
  @Field()
  @Property()
  courseId: string;

  @Field()
  @Property()
  launchUrl: string;
}

export class ReachEnrollment {
  @Property()
  courseId: string;

  @Property({ enum: ElearningProvisioningStatus, type: String })
  status: ElearningProvisioningStatus;

  @Property()
  lastErrorCode?: string;

  @Property()
  syncedAt: Date;
}

@ObjectType()
export class ElearningAccess {
  @Field(() => ElearningProvisioningStatus)
  status: ElearningProvisioningStatus;

  @Field({ nullable: true })
  launchUrl?: string;
}

@ObjectType({ description: "Course category" })
export class Category extends TimeStamps {
  @Field(() => ObjectId)
  id: ObjectId;

  @Field()
  @Property()
  name: string;

  @Field()
  @Property()
  slug: string;

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
}

@ObjectType()
@Index({ registrationEnd: 1 })
@Index({ start: 1, end: 1 })
@Index({ "category._id": 1 })
@Index({ name: "text" })
export class Course extends TimeStamps {
  @Field(() => ObjectId)
  id: ObjectId;

  @Field(() => UserStub, { nullable: true })
  @Property({ type: () => UserStub })
  procurer?: UserStub;

  @Field(() => [Category])
  @Property({ ref: () => Category, default: [] })
  categories: Ref<Category>[];

  @Field()
  @Property()
  name: string;

  @Field({ description: "String representation of HTML describing the course" })
  @Property()
  description: string;

  @Field({ nullable: true })
  @Property()
  thumbnail?: string;

  @Field(() => Int)
  @Property()
  maxAttendees: number;

  @Field(() => Int)
  @Property({ default: 0 })
  attendeesCount: number;

  @Field()
  @Property()
  registrationEnd: Date;

  @Field(() => Form)
  registrationForm: Form;

  @Field()
  @Property()
  start: Date;

  @Field()
  @Property()
  end: Date;

  @Field(() => Billing, { nullable: true })
  @Property({ type: () => Billing, _id: false })
  billing?: Billing;

  @Field(() => Int)
  @Property()
  price: number;

  @Field()
  get isPaid(): boolean {
    return this.price > 0;
  }

  @Property({ type: () => ReachCourseConfig, _id: false })
  reachCourse?: ReachCourseConfig;

  @Field()
  hasElearning: boolean;

  @Field(() => ElearningAccess, { nullable: true })
  elearningAccess?: ElearningAccess;

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
}

@ObjectType({
  description:
    "Scheduled term for a given course that when created also creates corresponding attendance records.",
})
@Index({ course: 1 })
export class CourseSession extends TimeStamps {
  @Field(() => ObjectId)
  id: ObjectId;

  @Field(() => ObjectId)
  @Property({ ref: () => Course })
  course: Ref<Course>;

  @Field()
  @Property()
  name: string;

  @Field({ nullable: true })
  @Property()
  description?: string;

  @Field()
  @Property()
  start: Date;

  @Field()
  @Property()
  end: Date;

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
}

@ObjectType()
export class CourseAttendeeUserStub extends UserStub {
  @Field()
  @Property({ default: "N/A" })
  organization: string;

  @Field({ nullable: true })
  @Property()
  telephone?: string;

  @Field({ nullable: true })
  avatarUrl?: string;
}

@ObjectType({ description: "Connects a system user with a particular course." })
@Index({ course: 1 })
@Index({ "user._id": 1 })
@Index({ status: 1 })
@Index({ "invoice.issuer.variableSymbol": 1 }, { sparse: true })
export class CourseAttendee extends TimeStamps {
  @Field(() => ObjectId)
  id: ObjectId;

  @Field(() => CourseAttendeeUserStub)
  @Property({ type: () => CourseAttendeeUserStub })
  user: CourseAttendeeUserStub;

  @Field(() => ObjectId)
  @Property({ ref: () => Course })
  course: Ref<Course>;

  @Field({ nullable: true })
  @Property()
  grade?: string;

  @Field(() => Status)
  @Property({ enum: Status, type: String, default: Status.Applied })
  status: Status;

  @Field(() => FormSubmission)
  @Property({ type: () => FormSubmission, _id: false })
  application: FormSubmission;

  @Field(() => Invoice, { nullable: true })
  @Property({ type: () => Invoice, _id: false })
  invoice?: Invoice;

  @Property()
  invoiceId?: ObjectId;

  @Field()
  hasInvoice: boolean;

  @Property({ type: () => ReachEnrollment, _id: false })
  reachEnrollment?: ReachEnrollment;

  @Field(() => ElearningProvisioningStatus, { nullable: true })
  elearningStatus?: ElearningProvisioningStatus;

  @Field({ nullable: true })
  elearningErrorCode?: string;

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
}

@ObjectType({
  description: "Represents individual attendance for a given course term.",
})
@Index({ session: 1 })
@Index({ "attendee._id": 1 })
export class AttendanceRecord extends TimeStamps {
  @Field(() => ObjectId)
  id: ObjectId;

  @Field(() => CourseSession)
  @Property({ ref: () => CourseSession })
  session: Ref<CourseSession>;

  @Field(() => CourseAttendee)
  @Property({ ref: () => CourseAttendee })
  attendee: Ref<CourseAttendee>;

  @Field(() => Float, {
    description:
      "Hours the person attended a given course term. Can't be more than the hours from start to end of a term.",
  })
  @Property()
  hoursAttended: number;

  @Field({ nullable: true })
  @Property()
  online?: boolean;

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
}
