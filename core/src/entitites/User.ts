import { Field, ObjectType, registerEnumType } from "type-graphql";
import { ObjectId } from "mongodb";
import { Index, pre, prop as Property } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { hash } from "bcrypt";
import { signJwt } from "../util/auth";
import { Address, Billing } from "./Billing";

export enum Access {
  Admin = "ADMIN",
  ConferenceAttendee = "CONFERENCE_ATTENDEE",
  CourseAttendee = "COURSE_ATTENDEE",
  Organization = "ORGANIZATION",
  Student = "STUDENT",
}

registerEnumType(Access, {
  name: "Access", // this one is mandatory
  description: "User access inside the FLAWIS system", // this one is optional
});

export enum StudyProgramme {
  Bachelor1 = 1,
  Bachelor2 = 2,
  Bachelor3 = 3,
  Master1 = 4,
  Master2 = 5,
}

registerEnumType(StudyProgramme, {
  name: "StudyProgramme",
  description: "Student user account StudyProgramme",
});

@pre<User>("save", async function () {
  if ((this.isNew && this.password) || this.isModified("password")) {
    this.password = await hash(String(this.password), 12);
  }
})
@Index({ name: "text", email: "text" })
@ObjectType({ description: "The user model entity" })
export class User extends TimeStamps {
  @Field(() => ObjectId)
  id: ObjectId;

  @Field()
  @Property({ unique: true })
  email: string;

  @Property()
  password?: string;

  @Field()
  @Property()
  name: string;

  @Field(() => Address, { nullable: true })
  @Property({ type: () => Address, _id: false })
  address?: Address;

  @Field({ nullable: true })
  @Property()
  telephone?: string;

  @Field({ nullable: true })
  @Property()
  organization?: string;

  @Field(() => [Billing], { nullable: "items" })
  @Property({ type: () => [Billing], _id: false, default: [] })
  billings: Billing[];

  @Field(() => [Access])
  @Property({
    type: String, // Typegoose expects this to be a string type as it stores enums as strings
    enum: Access, // Make sure to link the Access enum here
  })
  access: Access[];

  @Field(() => String, { nullable: true })
  @Property()
  cvUrl?: string;

  @Field(() => String, { nullable: true })
  @Property()
  avatarUrl?: string;

  @Field(() => StudyProgramme, { nullable: true })
  @Property({ type: Number, enum: StudyProgramme })
  studyProgramme?: StudyProgramme;

  @Field()
  @Property({ default: false })
  verified: boolean;

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;

  @Field()
  token(): string {
    return (
      "Bearer " +
      signJwt(
        {
          id: this.id,
          email: this.email,
          name: this.name,
          access: this.access,
        },
        { expiresIn: "24h" }
      )
    );
  }
}

@ObjectType()
export class UserStub implements Partial<User> {
  @Field()
  id: ObjectId;

  @Field()
  @Property()
  name: string;

  @Field()
  @Property()
  email: string;
}
