import { randomUUID } from "crypto";
import { ObjectId } from "mongodb";
import { ClientSession } from "mongoose";
import { Service } from "typedi";
import { ActivityEvent } from "../../entitites/Review";
import { Repository } from "../../repositories/base.repository";
import { requestContext } from "../../util/requestContext";
import { CtxUser } from "../../util/types";

@Service()
export class ActivityService {
  private readonly events = new Repository(ActivityEvent);
  async record(
    actor: CtxUser | string,
    action: string,
    conference?: ObjectId,
    submission?: ObjectId,
    changes: Record<string, unknown> = {},
    session?: ClientSession,
  ) {
    return this.events.create(
      {
        actor: typeof actor === "string" ? actor : String(actor.id),
        actorName: typeof actor === "string" ? undefined : actor.name,
        originalActor:
          typeof actor === "string" ? undefined : actor.originalActorId,
        requestId: requestContext.getStore()?.requestId || randomUUID(),
        action,
        conference,
        submission,
        changes,
      },
      { session },
    );
  }
  async read(
    actor: CtxUser | string,
    action: string,
    conference?: ObjectId,
    submission?: ObjectId,
  ) {
    const key = `${typeof actor === "string" ? actor : actor.id}:${action}:${conference}:${submission}`;
    const context = requestContext.getStore();
    if (context?.events.has(key)) return;
    context?.events.add(key);
    try {
      await this.record(actor, action, conference, submission);
    } catch {
      console.error(
        JSON.stringify({
          event: "activity.read_write_failed",
          action,
          conference,
          submission,
        }),
      );
    }
  }
  async list(conference: ObjectId, submission?: ObjectId, before?: ObjectId) {
    return this.events.findAll(
      {
        conference,
        ...(submission ? { submission } : {}),
        ...(before ? { _id: { $lt: before } } : {}),
      },
      null,
      { sort: { _id: -1 }, limit: 100 },
    );
  }
}
