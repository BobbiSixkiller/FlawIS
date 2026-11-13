import { Index, Severity, prop as Property } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { ObjectId } from "mongodb";
import { Field, Int, ObjectType } from "type-graphql";
import { Form } from "./Form";
import { JSONObject } from "../util/scalars";

@ObjectType()
@Index({ email: 1 }, { unique: true })
export class Reviewer extends TimeStamps {
  @Field(() => ObjectId) id: ObjectId;
  @Field() @Property({ required: true, trim: true }) name: string;
  @Field()
  @Property({ required: true, trim: true, lowercase: true })
  email: string;
  @Field() @Property({ default: "" }) institution: string;
  @Field() @Property({ default: "" }) department: string;
  @Field(() => [String])
  @Property({ type: () => [String], default: [] })
  languages: string[];
  @Field(() => [String])
  @Property({ type: () => [String], default: [] })
  expertise: string[];
  @Field() @Property({ default: "" }) notes: string;
  @Field() @Property({ default: false }) archived: boolean;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
}

@ObjectType()
@Index({ conference: 1, user: 1, section: 1 }, { unique: true })
@Index({ user: 1, conference: 1 })
export class ReviewGrant extends TimeStamps {
  @Field(() => ObjectId) id: ObjectId;
  @Field(() => ObjectId) @Property({ required: true }) conference: ObjectId;
  @Field(() => ObjectId) @Property({ required: true }) user: ObjectId;
  @Field(() => ObjectId, { nullable: true }) @Property() section?: ObjectId;
}

@ObjectType()
@Index({ conference: 1 }, { unique: true })
export class ReviewSettings extends TimeStamps {
  @Field(() => Form, { nullable: true }) questionnaire?: Form;
  @Field(() => ObjectId) id: ObjectId;
  @Field(() => ObjectId) @Property({ required: true }) conference: ObjectId;
  @Field() @Property({ default: false }) enabled: boolean;
  @Field(() => Int)
  @Property({ default: 2, min: 1, max: 10 })
  requiredReviews: number;
  @Field(() => ObjectId, { nullable: true }) @Property() form?: ObjectId;
  @Field({ nullable: true }) @Property() recommendationField?: string;
  @Field(() => [String])
  @Property({ type: () => [String], default: [] })
  authorFields: string[];
  @Field(() => JSONObject)
  @Property({ type: () => Object, allowMixed: Severity.ALLOW, default: {} })
  sectionRequirements: Record<string, string>;
  @Field() @Property({ default: false }) remindersEnabled: boolean;
  @Field() @Property({ default: "" }) instructions: string;
  @Field() @Property({ default: "" }) signature: string;
  @Field() @Property({ default: "" }) replyTo: string;
  @Field(() => ObjectId, { nullable: true })
  @Property()
  templateFile?: ObjectId;
}

@Index({ conference: 1, reviewer: 1 }, { unique: true })
export class ReviewerEligibility extends TimeStamps {
  @Property({ required: true }) conference: ObjectId;
  @Property({ required: true }) reviewer: ObjectId;
  @Property({ type: () => [ObjectId], default: [] })
  participatedSections: ObjectId[];
  @Property({ type: () => [ObjectId], default: [] })
  guarantorSections: ObjectId[];
  @Property({ type: () => [ObjectId], default: [] }) conflicts: ObjectId[];
}

@ObjectType()
@Index({ submission: 1 }, { unique: true })
@Index({ conference: 1, section: 1, updatedAt: -1 })
export class SubmissionReview extends TimeStamps {
  @Field(() => ObjectId) id: ObjectId;
  @Field(() => ObjectId) @Property({ required: true }) submission: ObjectId;
  @Field(() => ObjectId) @Property({ required: true }) conference: ObjectId;
  @Field(() => ObjectId) @Property({ required: true }) section: ObjectId;
  @Property({ type: () => [ObjectId], default: [] }) authorIds: ObjectId[];
  @Property({ type: () => [String], default: [] }) authorEmails: string[];
  @Field(() => Int) @Property({ default: 0 }) revision: number;
  @Field(() => Int) @Property({ default: 0 }) roundNumber: number;
  @Field(() => ObjectId, { nullable: true })
  @Property()
  currentRound?: ObjectId;
  @Field(() => ObjectId, { nullable: true })
  @Property()
  currentVersion?: ObjectId;
  @Field()
  @Property({
    default: "PENDING",
    enum: ["PENDING", "ACCEPTED", "REJECTED", "WITHDRAWN"],
  })
  decision: string;
  @Field() @Property({ default: "" }) decisionReason: string;
  @Field() @Property({ default: "" }) formalNotes: string;
  @Field() @Property({ default: false }) formalApproved: boolean;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
}

@ObjectType()
@Index({ submission: 1, number: 1 }, { unique: true })
export class ManuscriptVersion extends TimeStamps {
  @Field(() => ObjectId) id: ObjectId;
  @Field(() => ObjectId) @Property({ required: true }) submission: ObjectId;
  @Field(() => Int) @Property({ required: true }) number: number;
  @Field(() => ObjectId) @Property({ required: true }) file: ObjectId;
  @Field(() => ObjectId, { nullable: true })
  @Property()
  anonymousFile?: ObjectId;
  @Field() @Property({ default: false }) anonymousApproved: boolean;
  @Property() uploadedBy: string;
  @Property() approvedBy?: ObjectId;
  @Field() createdAt: Date;
}

@ObjectType()
@Index({ review: 1, number: 1 }, { unique: true })
export class ReviewRound extends TimeStamps {
  @Field(() => ObjectId) id: ObjectId;
  @Field(() => ObjectId) @Property({ required: true }) review: ObjectId;
  @Field(() => Int) @Property({ required: true }) number: number;
  @Field(() => Int) @Property({ required: true }) requiredReviews: number;
  @Field(() => ObjectId) @Property({ required: true }) form: ObjectId;
  @Field() @Property({ required: true }) recommendationField: string;
  @Field(() => [String])
  @Property({ type: () => [String], default: [] })
  authorFields: string[];
  @Field(() => ObjectId, { nullable: true })
  @Property()
  templateFile?: ObjectId;
  @Field(() => ObjectId, { nullable: true }) @Property() manuscript?: ObjectId;
  @Field(() => ObjectId, { nullable: true })
  @Property()
  anonymousFile?: ObjectId;
  @Field({ nullable: true }) @Property() startedAt?: Date;
}

@ObjectType()
@Index(
  { round: 1, slot: 1 },
  { unique: true, partialFilterExpression: { active: true } },
)
@Index(
  { round: 1, reviewer: 1 },
  { unique: true, partialFilterExpression: { active: true } },
)
@Index({ tokenHash: 1 }, { sparse: true, unique: true })
@Index({ reviewer: 1, _id: -1 })
@Index({ review: 1, round: 1 })
export class ReviewAssignment extends TimeStamps {
  @Field(() => ObjectId) id: ObjectId;
  @Field(() => ObjectId) @Property({ required: true }) round: ObjectId;
  @Field(() => ObjectId) @Property({ required: true }) review: ObjectId;
  @Field(() => ObjectId) @Property({ required: true }) reviewer: ObjectId;
  @Field(() => Int) @Property({ required: true }) slot: number;
  @Field() @Property({ required: true }) name: string;
  @Field() @Property({ required: true }) email: string;
  @Field() @Property({ default: "ASSIGNED" }) status: string;
  @Field() @Property({ default: true }) active: boolean;
  @Field() @Property({ required: true }) deadline: Date;
  @Field() @Property({ default: "" }) conflictReason: string;
  @Field({ nullable: true }) @Property() recommendation?: string;
  @Field({ nullable: true }) @Property() submittedAt?: Date;
  @Property() tokenHash?: string;
  @Property() tokenEncrypted?: string;
  @Property() expiresAt?: Date;
  @Property() reminderBeforeAt?: Date;
  @Property() reminderAfterAt?: Date;
}

@ObjectType()
@Index({ round: 1, fingerprint: 1 }, { unique: true })
@Index({ submission: 1, createdAt: -1 })
export class FeedbackRelease extends TimeStamps {
  @Field(() => ObjectId) id: ObjectId;
  @Field(() => ObjectId) @Property({ required: true }) submission: ObjectId;
  @Field(() => ObjectId) @Property({ required: true }) round: ObjectId;
  @Property({ required: true }) fingerprint: string;
  @Field(() => JSONObject)
  @Property({ allowMixed: Severity.ALLOW, type: () => Object })
  feedback: Record<string, unknown>;
  @Field() createdAt: Date;
}

@ObjectType()
@Index({ tokenHash: 1 }, { unique: true })
@Index({ submission: 1, createdAt: -1 })
export class RevisionRequest extends TimeStamps {
  @Field(() => ObjectId) id: ObjectId;
  @Field(() => ObjectId) @Property({ required: true }) submission: ObjectId;
  @Field() @Property({ required: true }) instructions: string;
  @Field() @Property({ required: true }) deadline: Date;
  @Field() @Property({ default: "REQUESTED" }) status: string;
  @Field() @Property({ default: "" }) note: string;
  @Field(() => ObjectId, { nullable: true })
  @Property()
  receivedVersion?: ObjectId;
  @Property({ required: true }) tokenHash: string;
  @Property() expiresAt: Date;
  @Field() createdAt: Date;
}

@ObjectType()
@Index({ submission: 1, createdAt: -1 })
@Index({ assignment: 1, createdAt: -1 })
export class ReviewFile extends TimeStamps {
  @Field(() => ObjectId, { nullable: true }) @Property() assignment?: ObjectId;
  @Field(() => ObjectId) id: ObjectId;
  @Field(() => ObjectId, { nullable: true }) @Property() submission?: ObjectId;
  @Field(() => ObjectId) @Property({ required: true }) conference: ObjectId;
  @Property({ required: true }) bucket: string;
  @Property({ required: true }) objectName: string;
  @Field() @Property({ required: true }) kind: string;
  @Field() @Property({ required: true }) filename: string;
  @Field() @Property({ required: true }) contentType: string;
  @Field(() => Int) @Property({ required: true }) size: number;
  @Property({ required: true }) checksum: string;
  @Property() actor: string;
}

@ObjectType()
@Index({ conference: 1, _id: -1 })
@Index({ submission: 1, _id: -1 })
export class ActivityEvent extends TimeStamps {
  @Field(() => ObjectId) id: ObjectId;
  @Field(() => ObjectId, { nullable: true }) @Property() conference?: ObjectId;
  @Field(() => ObjectId, { nullable: true }) @Property() submission?: ObjectId;
  @Field() @Property({ required: true }) actor: string;
  @Field({ nullable: true }) @Property() actorName?: string;
  @Field({ nullable: true }) @Property() originalActor?: string;
  @Field() @Property({ required: true }) action: string;
  @Field() @Property({ required: true }) requestId: string;
  @Field(() => JSONObject)
  @Property({ allowMixed: Severity.ALLOW, type: () => Object, default: {} })
  changes: Record<string, unknown>;
  @Field() createdAt: Date;
}
