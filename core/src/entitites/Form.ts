import { Index, Ref, Severity, prop as Property } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { Field, Int, ObjectType, registerEnumType } from "type-graphql";
import { ObjectId } from "mongodb";
import { JSONObject } from "../util/scalars";

export enum FieldType {
  Text = "TEXT",
  Textarea = "TEXTAREA",
  Select = "SELECT",
  RadioGroup = "RADIO_GROUP",
  FileUpload = "FILE_UPLOAD",
}

registerEnumType(FieldType, {
  name: "FieldType",
  description: "Supported shared form field types",
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

  /**
   * Only meaningful when type === FILE_UPLOAD.
   */
  @Field(() => Int, { nullable: true })
  @Property()
  minFiles?: number;

  @Field(() => Int, { nullable: true })
  @Property()
  maxFiles?: number;
}

/**
 * Immutable, shared form version. Bindings pin consumers to a version.
 */
@ObjectType()
@Index({ definition: 1, version: 1 }, { unique: true })
export class Form extends TimeStamps {
  @Field(() => ObjectId)
  id: ObjectId;

  @Field(() => ObjectId)
  @Property({ required: true })
  definition: ObjectId;

  @Field(() => ObjectId, { nullable: true })
  course?: ObjectId;

  @Field(() => Int)
  @Property()
  version: number;

  @Field(() => [FormField])
  @Property({ type: () => [FormField], default: [] })
  fields: FormField[];

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
}

@ObjectType()
export class FormSubmission extends TimeStamps {
  @Field(() => ObjectId)
  id: ObjectId;

  @Field(() => ObjectId)
  @Property({ ref: () => Form })
  form: ObjectId;

  @Field(() => Int)
  @Property()
  formVersion: number;

  @Field(() => JSONObject)
  @Property({ type: () => Map, allowMixed: Severity.ALLOW })
  answers: Map<string, string | string[]>;

  @Field(() => Int)
  @Property({ default: 1 })
  revision: number;

  @Field()
  @Property({ default: false })
  submitted: boolean;

  @Field()
  createdAt: Date;
  @Field()
  updatedAt: Date;
}

@ObjectType()
export class FormDefinition extends TimeStamps {
  @Field(() => ObjectId) id: ObjectId;
  @Field() @Property({ required: true, trim: true }) name: string;
  @Field() @Property({ default: "" }) description: string;
  @Field() @Property({ default: false }) archived: boolean;
  @Field(() => Int) @Property({ default: 0 }) latestVersion: number;
  @Property({ required: true }) createdBy: ObjectId;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
}

@Index({ context: 1, owner: 1 }, { unique: true })
export class FormBinding extends TimeStamps {
  @Property({ required: true, enum: ["COURSE", "REVIEW"] }) context: string;
  @Property({ required: true }) owner: ObjectId;
  @Property({ required: true }) form: ObjectId;
}

@Index({ context: 1, subject: 1 }, { unique: true })
export class FormAnswer extends FormSubmission {
  @Property({ required: true, enum: ["COURSE", "REVIEW"] }) context: string;
  @Property({ required: true }) subject: ObjectId;
  @Property({ required: true }) respondent: string;
}

@Index({ answer: 1, revision: 1 }, { unique: true })
export class FormAnswerRevision extends TimeStamps {
  @Property({ required: true }) answer: ObjectId;
  @Property({ required: true }) revision: number;
  @Property({ required: true }) form: ObjectId;
  @Property({ required: true }) actor: string;
  @Property({ type: () => Map, allowMixed: Severity.ALLOW }) answers: Map<
    string,
    string | string[]
  >;
  @Property() submitted: boolean;
}
