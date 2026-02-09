import { Index, Ref, prop as Property } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { Field, Int, ObjectType, registerEnumType } from "type-graphql";
import { ObjectId } from "mongodb";
import { Course } from "./Course";

export enum FieldType {
  Text = "TEXT",
  Textarea = "TEXTAREA",
  Select = "SELECT",
}

registerEnumType(FieldType, {
  name: "FieldType",
  description: "Supported registration form field types",
});

@ObjectType()
export class SelectOption {
  @Field()
  @Property()
  value: string;

  @Field()
  @Property()
  text: string;
}

@ObjectType()
export class FormField {
  @Field(() => ObjectId)
  id: ObjectId;

  @Field(() => FieldType)
  @Property({ enum: FieldType, type: String, required: true })
  type: FieldType;

  @Field()
  @Property()
  label: string;

  @Field(() => Boolean)
  @Property({ default: false })
  required: boolean;

  @Field({ nullable: true })
  @Property()
  placeholder?: string;

  @Field({ nullable: true })
  @Property()
  helpText?: string;

  /**
   * Only meaningful when type === SELECT.
   * Using objects gives you stable value + display text.
   */
  @Field(() => [SelectOption], { nullable: true })
  @Property({ type: () => [SelectOption], _id: false, default: undefined })
  selectOptions?: SelectOption[];
}

/**
 * Versioned form definition per course.
 * - unique (course, version)
 * - fast "latest version" query via (course, version desc)
 */
@ObjectType()
@Index({ course: 1, version: 1 }, { unique: true })
@Index({ course: 1, version: -1 })
export class Form extends TimeStamps {
  @Field(() => ObjectId)
  id: ObjectId;

  @Field(() => ObjectId)
  @Property({ ref: () => Course })
  course: Ref<Course>;

  @Field(() => Int)
  @Property()
  version: number;

  @Field(() => [FormField])
  @Property({ type: () => [FormField], _id: false, default: [] })
  fields: FormField[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
