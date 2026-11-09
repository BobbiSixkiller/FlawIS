import { Index, prop as Property } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { ObjectId } from "mongodb";

@Index({ state: 1, nextAttemptAt: 1 })
@Index(
  { assignmentId: 1, createdAt: -1 },
  { partialFilterExpression: { assignmentId: { $exists: true } } },
)
export class Notification extends TimeStamps {
  @Property({ required: true }) routingKey: string;
  @Property({ required: true }) payload: string;
  @Property({
    default: "PENDING",
    enum: [
      "PENDING",
      "QUEUED",
      "SENDING",
      "SENT",
      "FAILED",
      "UNKNOWN",
      "CANCELLED",
    ],
  })
  state: string;
  @Property({ default: 0 }) attempt: number;
  @Property({ default: () => new Date() }) nextAttemptAt: Date;
  @Property() leaseUntil?: Date;
  @Property() sentAt?: Date;
  @Property() lastError?: string;
  @Property() resourceId?: string;
  @Property() conferenceId?: ObjectId;
  @Property() submissionId?: ObjectId;
  @Property() assignmentId?: ObjectId;
}
