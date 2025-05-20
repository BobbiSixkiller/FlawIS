import { Ref } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { prop as Property } from "@typegoose/typegoose";
import { ObjectId } from "mongodb";
import { Field, Int, ObjectType } from "type-graphql";

import { FlawBilling } from "./Billing";
import { Invoice, UserStubUnion } from "./Attendee";
import { UserStub } from "./User";

@ObjectType()
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

  @Field(() => FlawBilling)
  @Property({ type: () => FlawBilling, _id: false })
  billing: FlawBilling;

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
export class Module extends TimeStamps {
  @Field(() => ObjectId)
  id: ObjectId;

  @Field(() => Course)
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
export class CourseTerm extends TimeStamps {
  @Field(() => ObjectId)
  id: ObjectId;

  @Field(() => Course)
  @Property({ ref: () => Course })
  course: Ref<Course>;

  @Field(() => Module, { nullable: true })
  @Property({ ref: () => Module })
  module?: Ref<Module>;

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
export class CourseTermAttendee extends TimeStamps {
  @Field(() => ObjectId)
  id: ObjectId;

  @Field(() => UserStubUnion)
  @Property({ type: () => UserStub })
  user: UserStub;

  @Field(() => CourseTerm)
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
