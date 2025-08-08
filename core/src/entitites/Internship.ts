import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { Field, ObjectType, registerEnumType } from "type-graphql";
import { ObjectId } from "mongodb";
import { Index, Pre, prop as Property } from "@typegoose/typegoose";
import { Ref } from "@typegoose/typegoose/lib/types";
import { StudyProgramme, User } from "./User";
import { getAcademicYear } from "../util/helpers";
import { Address } from "./Billing";

export enum Status {
  Applied = "APPLIED",
  Eligible = "ELIGIBLE",
  Accepted = "ACCEPTED",
  Rejected = "REJECTED",
}

registerEnumType(Status, {
  name: "Status",
  description: "Intern status",
});

@ObjectType({ description: "User stub type" })
export class StudentReference implements Partial<User> {
  @Field(() => ObjectId, { description: "User document id" })
  id: ObjectId;

  @Field()
  @Property()
  name: string;

  @Field()
  @Property()
  email: string;

  @Field()
  @Property()
  telephone: string;

  @Field(() => StudyProgramme)
  @Property({ type: Number, enum: StudyProgramme })
  studyProgramme: StudyProgramme;

  @Field(() => Address)
  @Property({ type: () => Address, _id: false })
  address: Address;

  @Field({ nullable: true })
  avatarUrl?: string;
}

@Index({ internship: 1, "user._id": 1, status: 1 })
@Index({ "user._id": 1, createdAt: 1, status: 1 })
@ObjectType({
  description: "Ovject type representing student who applies for an internship",
})
export class Intern extends TimeStamps {
  @Field(() => ObjectId)
  id: ObjectId;

  @Field(() => StudentReference)
  @Property({ type: () => StudentReference })
  user: StudentReference;

  @Field(() => ObjectId)
  @Property({ ref: () => Internship })
  internship: Ref<Internship>;

  @Field()
  @Property()
  organization: string;

  @Field(() => Status)
  @Property({ enum: Status, type: String, default: Status.Applied })
  status: Status;

  @Field(() => [String])
  @Property({ type: () => [String], default: [] })
  fileUrls: string[];

  @Field(() => String, { nullable: true })
  @Property()
  organizationFeedbackUrl?: string;

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
}

@Pre<Internship>("save", async function () {
  if (this.isNew) {
    const { academicYear } = getAcademicYear();

    this.academicYear = academicYear;
  }
})
@Index({ createdAt: 1, user: 1 }) // Index for queries utilizing createdAt
@Index({ academicYear: 1, user: 1 }) // Index for student queries utilizing academicYear and context user
@Index({ academicYear: 1, organization: 1 }) // Index for admin query, displaying internships in a give year optionally filtering by org
@ObjectType({ description: "Internship object type" })
export class Internship extends TimeStamps {
  @Field(() => ObjectId)
  id: ObjectId;

  @Property()
  language: string;

  @Field()
  @Property()
  organization: string;

  @Field()
  @Property()
  academicYear: string;

  @Field({
    description: "String representation of internship listing's HTML page",
  })
  @Property()
  description: string;

  @Field(() => ObjectId)
  @Property({ ref: () => User })
  user: Ref<User>;

  @Field(() => Intern, { nullable: true })
  myApplication?: Intern;

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
}
