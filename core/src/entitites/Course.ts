import { Index, Ref } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { prop as Property } from "@typegoose/typegoose";
import { ObjectId } from "mongodb";
import { Field, Int, ObjectType } from "type-graphql";

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
@Index({ user: 1 })
@Index({ name: "text" })
export class Course extends TimeStamps {
  @Field(() => ObjectId)
  id: ObjectId;

  @Field(() => UserStub)
  @Property({ type: () => UserStub })
  owner: UserStub;

  @Field(() => UserStub, { nullable: true })
  @Property({ type: () => UserStub })
  procurer?: UserStub;

  @Field(() => [Category])
  @Property({ type: () => [Category], default: [] })
  categories: Category[];

  @Field()
  @Property()
  name: string;

  @Field({
    description: "String representation of HTML describing the course",
  })
  @Property()
  description: string;

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

@ObjectType()
@Index({ course: 1 })
export class CourseModule extends TimeStamps {
  @Field(() => ObjectId)
  id: ObjectId;

  @Property({ ref: () => Course })
  course: Ref<Course>;

  @Field()
  @Property()
  name: string;

  @Field({
    description:
      "String representation of HTML describing the module of the course",
  })
  @Property()
  description: string;

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
}

@ObjectType()
@Index({ course: 1, module: 1 })
export class CourseTerm extends TimeStamps {
  @Field(() => ObjectId)
  id: ObjectId;

  @Property({ ref: () => Course })
  course: Ref<Course>;

  @Property({ ref: () => CourseModule })
  module?: Ref<CourseModule>;

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
  @Property()
  organizatation: string;

  @Field()
  @Property()
  department: string;
}

@ObjectType()
@Index({ "user._id": 1, term: 1, status: 1 })
export class CourseAttendee extends TimeStamps {
  @Field(() => ObjectId)
  id: ObjectId;

  @Field(() => CourseAttendeeUserStub)
  @Property({ type: () => CourseAttendeeUserStub })
  user: CourseAttendeeUserStub;

  @Property({ ref: () => CourseTerm })
  term: Ref<CourseTerm>;

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
