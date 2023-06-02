import { getModelForClass, pre, prop as Property } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { ArgumentValidationError, Field, ID, ObjectType } from "type-graphql";
import { ObjectId } from "mongodb";

import { Ref } from "../util/types";
import { Conference } from "./Conference";
import { Section } from "./Section";
import { User } from "./User";
import Messagebroker from "../util/rmq";
import File from "./File";

@ObjectType({ isAbstract: true })
class Translation {
  @Field()
  @Property()
  language: string;
}

@ObjectType()
class SubmissionTranslation extends Translation implements Partial<Submission> {
  @Field()
  @Property()
  name: string;

  @Field()
  @Property()
  abstract: string;

  @Field(() => [String])
  @Property({ type: () => String })
  keywords: string[];
}

@pre<Submission>("save", async function () {
  if (this.isNew) {
    const submissionExists = await getModelForClass(Submission)
      .findOne({
        name: this.name,
      })
      .exec();
    if (submissionExists)
      throw new ArgumentValidationError([
        {
          target: Submission, // Object that was validated.
          property: "submission.name", // Object's property that haven't pass validation.
          value: this.name, // Value that haven't pass a validation.
          constraints: {
            // Constraints that failed validation with error messages.
            nameExists: "Submission with provided name already exists!",
          },
          //children?: ValidationError[], // Contains all nested validation errors of the property
        },
      ]);
  }
})
@ObjectType({ description: "Submission entity model type" })
export class Submission extends TimeStamps {
  @Field(() => ID)
  id: ObjectId;

  @Field()
  @Property()
  name: string;

  @Field()
  @Property()
  abstract: string;

  @Field(() => [String])
  @Property({ type: () => String })
  keywords: string[];

  @Field({ nullable: true })
  @Property({ type: () => File, _id: false })
  file?: File;

  @Field(() => Conference)
  @Property({ ref: () => Conference })
  conference: Ref<Conference>;

  @Field(() => Section)
  @Property({ ref: () => Section })
  section: Ref<Section>;

  @Field(() => [User])
  @Property({ ref: () => User })
  authors: Ref<User>[];

  @Field(() => [SubmissionTranslation])
  @Property({ type: () => SubmissionTranslation, _id: false })
  translations: SubmissionTranslation[];

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
}
