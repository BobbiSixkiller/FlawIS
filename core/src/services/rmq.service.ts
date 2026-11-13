import { Service } from "typedi";
import * as amqp from "amqplib";
import { ObjectId } from "mongodb";
import { ClientSession } from "mongoose";
import { Notification } from "../entitites/Notification";
import { Repository } from "../repositories/base.repository";
import { seal, unseal } from "../util/secrets";

export const MAIL_KEYS = [
  "mail.registration",
  "mail.reset",
  "mail.conference.invoice",
  "mail.conference.coAuthor",
  "mail.internships.newOrg",
  "mail.internships.applied",
  "mail.internships.eligible",
  "mail.internships.accepted",
  "mail.internships.rejected",
  "mail.internships.admin",
  "mail.internships.org",
  "mail.courses.applied",
  "mail.courses.eligible",
  "mail.courses.accepted",
  "mail.courses.rejected",
  "mail.review",
] as const;
export type RoutingKey = (typeof MAIL_KEYS)[number];
export const notificationExchange = () =>
  process.env.RMQ_EXCHANGE || "FlawIS.notifications.v2";

@Service()
export class RmqService {
  private connection?: amqp.ChannelModel;
  private channel?: amqp.ConfirmChannel;
  private initializing?: Promise<void>;
  private flushing = false;
  private timer?: ReturnType<typeof setInterval>;
  private readonly jobs = new Repository(Notification);

  async produceMessage(
    msg: string,
    routingKey: RoutingKey,
    session?: ClientSession,
  ) {
    const data = JSON.parse(msg);
    const job = await this.jobs.create(
      {
        routingKey,
        payload: seal(msg),
        resourceId: String(
          data.courseId || data.internId || data.submissionId || "",
        ),
        conferenceId: data.conferenceId,
        submissionId: data.submissionId,
        assignmentId: data.assignmentId,
      },
      { session },
    );
    return String(job._id);
  }

  start() {
    if (this.timer) return;
    void this.flush();
    this.timer = setInterval(() => void this.flush(), 5000);
    this.timer.unref();
  }

  async stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    const channel = this.channel,
      connection = this.connection;
    this.channel = undefined;
    this.connection = undefined;
    await channel?.close().catch(() => undefined);
    await connection?.close().catch(() => undefined);
  }

  private async connect() {
    if (this.channel) return;
    if (this.initializing) return this.initializing;
    this.initializing = (async () => {
      const connection = await amqp.connect(
        process.env.RMQ_URI || "amqp://rabbitmq:5672?frameMax=131072",
      );
      this.connection = connection;
      connection.on("error", () => undefined);
      connection.on("close", () => {
        if (this.connection === connection) {
          this.channel = undefined;
          this.connection = undefined;
        }
      });
      try {
        const channel = await connection.createConfirmChannel();
        channel.on("error", () => {
          this.channel = undefined;
        });
        channel.on("close", () => {
          this.channel = undefined;
        });
        await channel.assertExchange(notificationExchange(), "topic", {
          durable: true,
        });
        await channel.assertExchange(
          `${notificationExchange()}.dead`,
          "topic",
          { durable: true },
        );
        await channel.assertQueue("flawis.notifications.dead.v2", {
          durable: true,
          autoDelete: false,
        });
        await channel.bindQueue(
          "flawis.notifications.dead.v2",
          `${notificationExchange()}.dead`,
          "#",
        );
        for (const key of MAIL_KEYS) {
          const queue = `flawis.${key}.v2`;
          await channel.assertQueue(queue, {
            durable: true,
            autoDelete: false,
            arguments: {
              "x-dead-letter-exchange": `${notificationExchange()}.dead`,
            },
          });
          await channel.bindQueue(queue, notificationExchange(), key);
        }
        await channel.assertQueue("flawis.notifications.results.v2", {
          durable: true,
          autoDelete: false,
          arguments: {
            "x-dead-letter-exchange": `${notificationExchange()}.dead`,
          },
        });
        await channel.bindQueue(
          "flawis.notifications.results.v2",
          notificationExchange(),
          "notification.result",
        );
        await channel.prefetch(10);
        await channel.consume(
          "flawis.notifications.results.v2",
          async (message) => {
            if (!message) return;
            let outcome;
            try {
              outcome = JSON.parse(message.content.toString());
              if (
                !ObjectId.isValid(outcome.id) ||
                !Number.isInteger(outcome.attempt) ||
                typeof outcome.success !== "boolean"
              )
                throw new Error("Invalid result");
            } catch {
              channel.nack(message, false, false);
              return;
            }
            try {
              await this.applyResult(outcome);
              channel.ack(message);
            } catch {
              channel.nack(message, false, true);
            }
          },
        );
        channel.on("return", (message) => {
          const id = message.properties.messageId;
          if (id && ObjectId.isValid(id))
            void this.jobs
              .findOneAndUpdate(
                { _id: new ObjectId(id), state: "QUEUED" },
                {
                  $set: {
                    state: "PENDING",
                    nextAttemptAt: new Date(Date.now() + 60000),
                    lastError: "No queue is bound for this notification.",
                  },
                },
              )
              .catch(() => undefined);
        });
        this.channel = channel;
      } catch (error) {
        await connection.close().catch(() => undefined);
        if (this.connection === connection) this.connection = undefined;
        throw error;
      }
    })().finally(() => {
      this.initializing = undefined;
    });
    return this.initializing;
  }

  async claim(id: ObjectId, attempt: number) {
    const result = await this.jobs.findOneAndUpdate(
      { _id: id, attempt, state: "QUEUED" },
      { $set: { state: "SENDING", leaseUntil: new Date(Date.now() + 300000) } },
      { new: true },
    );
    return Boolean(result);
  }

  async applyResult(input: {
    id: string;
    attempt: number;
    success: boolean;
    retryable?: boolean;
    uncertain?: boolean;
    error?: string;
  }) {
    if (!ObjectId.isValid(input.id) || !Number.isInteger(input.attempt))
      throw new Error("Invalid notification outcome.");
    const retry = !input.success && input.retryable && input.attempt < 4;
    await this.jobs.findOneAndUpdate(
      { _id: new ObjectId(input.id), attempt: input.attempt, state: "SENDING" },
      {
        $set: {
          state: input.success
            ? "SENT"
            : input.uncertain
              ? "UNKNOWN"
              : retry
                ? "PENDING"
                : "FAILED",
          ...(input.success ? { sentAt: new Date() } : {}),
          nextAttemptAt: new Date(
            Date.now() +
              Math.min(1800000, 60000 * 5 ** Math.max(0, input.attempt - 1)),
          ),
          lastError: input.error?.slice(0, 500),
        },
        $unset: { leaseUntil: 1 },
      },
    );
  }

  async flush() {
    if (this.flushing) return;
    this.flushing = true;
    try {
      await this.connect();
      await this.jobs.updateMany(
        { state: "SENDING", leaseUntil: { $lt: new Date() } },
        {
          $set: {
            state: "UNKNOWN",
            lastError: "Delivery lease expired; verify before resending.",
          },
        },
      );
      // A confirmed publish can race a process crash before the state is visible.
      await this.jobs.updateMany(
        { state: "QUEUED", updatedAt: { $lt: new Date(Date.now() - 600000) } },
        { $set: { state: "PENDING" } },
      );
      const jobs = await this.jobs.findAll(
        { state: "PENDING", nextAttemptAt: { $lte: new Date() } },
        null,
        { limit: 50, sort: { createdAt: 1 } },
      );
      for (const job of jobs) {
        const claimed = await this.jobs.findOneAndUpdate(
          { _id: job._id, state: "PENDING" },
          { $set: { state: "QUEUED" }, $inc: { attempt: 1 } },
          { new: true },
        );
        if (!claimed) continue;
        const body = {
          ...JSON.parse(unseal(claimed.payload)),
          _notificationId: String(claimed._id),
          _notificationAttempt: claimed.attempt,
        };
        try {
          await new Promise<void>((resolve, reject) =>
            this.channel!.publish(
              notificationExchange(),
              claimed.routingKey,
              Buffer.from(JSON.stringify(body)),
              {
                persistent: true,
                mandatory: true,
                messageId: String(claimed._id),
                contentType: "application/json",
              },
              (error) => (error ? reject(error) : resolve()),
            ),
          );
        } catch (error) {
          await this.jobs.findOneAndUpdate(
            { _id: claimed._id, state: "QUEUED" },
            {
              $set: {
                state: "PENDING",
                nextAttemptAt: new Date(Date.now() + 10000),
              },
            },
          );
          throw error;
        }
      }
    } catch (error) {
      console.error(
        JSON.stringify({
          event: "notification.dispatch_failed",
          error: error instanceof Error ? error.message : "unknown",
        }),
      );
    } finally {
      this.flushing = false;
    }
  }
}
