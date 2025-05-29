import { Index, Ref } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { prop as Property } from "@typegoose/typegoose";
import { ObjectId } from "mongodb";
import { Field, Int, ObjectType } from "type-graphql";

import { FlawBilling } from "./Billing";
import { Invoice, UserStubUnion } from "./Attendee";
import { UserStub } from "./User";

//implement proper indexes

@ObjectType()
@Index({ user: 1 })
@Index({ name: "text" })
export class Course extends TimeStamps {
  @Field(() => ObjectId)
  id: ObjectId;

  @Field()
  @Property()
  name: string;

  @Field(() => UserStubUnion)
  @Property({ type: () => UserStub })
  user: UserStub;

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
@Index({ "user._id": 1, term: 1 })
export class CourseTermAttendee extends TimeStamps {
  @Field(() => ObjectId)
  id: ObjectId;

  @Field(() => UserStubUnion)
  @Property({ type: () => UserStub })
  user: UserStub;

  @Property({ ref: () => CourseTerm })
  term: Ref<CourseTerm>;

  @Field(() => Invoice, { nullable: true })
  @Property({ type: () => Invoice, _id: false })
  invoice?: Invoice;

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
}
