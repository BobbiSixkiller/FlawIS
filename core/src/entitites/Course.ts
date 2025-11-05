import { Index, Ref } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { prop as Property } from "@typegoose/typegoose";
import { ObjectId } from "mongodb";
import { Field, Float, Int, ObjectType } from "type-graphql";
import { FlawBilling } from "./Billing";
import { Invoice } from "./Attendee";
import { UserStub } from "./User";
import { Status } from "./Internship";

@ObjectType({ description: "Course category" })
export class Category {
  @Field(() => ObjectId)
  id: ObjectId;

  @Field()
  @Property()
  name: string;

  @Field()
  @Property()
  slug: string;
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
  @Property({ type: () => [Category], default: [] })
  categories: Category[];

  @Field()
  @Property()
  name: string;

  @Field({ description: "String representation of HTML describing the course" })
  @Property()
  description: string;

  @Field(() => Int)
  @Property()
  maxAttendees: number;

  @Field(() => Int)
  @Property({ default: 0 })
  attendeesCount: number;

  @Field()
  @Property()
  registrationEnd: Date;

  @Field()
  @Property()
  start: Date;

  @Field()
  @Property()
  end: Date;

  @Field(() => FlawBilling, { nullable: true })
  @Property({ type: () => FlawBilling, _id: false })
  billing?: FlawBilling;

  @Field(() => Int)
  @Property()
  price: number;

  @Field()
  get isPaid(): boolean {
    return this.price > 0;
  }

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

  @Field(() => Int)
  @Property()
  maxAttendees: number;

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

  @Field(() => [String])
  @Property({ type: () => [String], default: [] })
  fileUrls: string[];

  @Field(() => Invoice, { nullable: true })
  @Property({ type: () => Invoice, _id: false })
  invoice?: Invoice;

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
}

@ObjectType()
export class CourseAttendeeStub {
  @Field(() => ObjectId)
  id: ObjectId;

  @Field()
  @Property()
  name: string;
}

@ObjectType({
  description: "Represents individual attendance for a given course term.",
})
@Index({ term: 1 })
@Index({ "attendee._id": 1 })
export class AttendanceRecord extends TimeStamps {
  @Field(() => ObjectId)
  id: ObjectId;

  @Property({ ref: () => CourseSession })
  session: Ref<CourseSession>;

  @Field(() => CourseAttendeeStub)
  @Property({ type: () => CourseAttendeeStub })
  attendee: CourseAttendeeStub;

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
