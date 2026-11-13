import "reflect-metadata";
import assert from "node:assert/strict";
import test from "node:test";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import mongoose from "mongoose";
import { getModelForClass } from "@typegoose/typegoose";
import * as amqp from "amqplib";
import { RmqService, notificationExchange } from "../src/services/rmq.service";
import { Notification } from "../src/entitites/Notification";
import { Repository } from "../src/repositories/base.repository";
const uri = process.env.REVIEW_TEST_MONGODB_URI,
  broker = process.env.REVIEW_TEST_RABBITMQ_URI;
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
async function connect() {
  for (let attempt = 0; ; attempt++) {
    try {
      return await amqp.connect(broker!);
    } catch (error) {
      if (attempt > 40) throw error;
      await delay(250);
    }
  }
}
test(
  process.env.REVIEW_TEST_RABBIT_CONTAINER
    ? "durable outbox survives broker restart and claims each delivery once"
    : "durable outbox publishes persistent messages and claims each delivery once (no broker restart)",
  { skip: !uri || !broker, timeout: 60000 },
  async () => {
    assert.equal(process.env.REVIEW_TEST_ENVIRONMENT, "staging");
    assert.equal(new URL(uri!).protocol, "mongodb:");
    assert.equal(new URL(broker!).protocol, "amqp:");
    assert.ok(
      new URL(uri!).hostname === "127.0.0.1",
      "Connect to the test target through loopback (on its host or through a tunnel).",
    );
    assert.ok(
      new URL(broker!).hostname === "127.0.0.1",
      "Connect to the test target through loopback (on its host or through a tunnel).",
    );
    assert.equal(new URL(uri!).port, "27018");
    assert.equal(new URL(broker!).port, "5673");
    assert.equal(new URL(broker!).pathname, "/flawis-review-tests");
    const container = process.env.REVIEW_TEST_RABBIT_CONTAINER;
    if (container) {
      assert.equal(container, "flawis-staging-rabbitmq-1");
      const { stdout } = await promisify(execFile)("docker", ["inspect", container]);
      const labels = JSON.parse(stdout)[0].Config.Labels;
      assert.equal(labels["com.docker.compose.project"], "flawis-staging");
      assert.equal(labels["com.docker.compose.service"], "rabbitmq");
    }
    process.env.SECRET = "isolated-notification-test";
    process.env.RMQ_URI = broker;
    process.env.RMQ_EXCHANGE = "FlawIS.review-worker-test";
    await mongoose.connect(uri!, { dbName: "flawis_notifications_test" });
    await mongoose.connection.dropDatabase();
    await getModelForClass(Notification).init();
    let dispatcher = new RmqService();
    let connection: amqp.ChannelModel | undefined;
    try {
      // The vhost persists between runs, including after an interrupted test.
      // Initialize the topology before clearing only its fixture review queue.
      await dispatcher.flush();
      await dispatcher.stop();
      connection = await connect();
      const cleanupChannel = await connection.createChannel();
      await cleanupChannel.purgeQueue("flawis.mail.review.v2");
      await connection.close();
      connection = undefined;
      const id = await dispatcher.produceMessage(
        JSON.stringify({
          name: "Test",
          email: "recipient@example.test",
          text: "Test",
        }),
        "mail.review",
      );
      const jobs = new Repository(Notification);
      assert.equal((await jobs.findOne({ _id: id }))!.state, "PENDING");
      await dispatcher.flush();
      assert.equal((await jobs.findOne({ _id: id }))!.state, "QUEUED");
      await dispatcher.stop();
      if (container) {
        await promisify(execFile)("docker", ["restart", container], {
          timeout: 30000,
        });
      } else {
        console.info("Broker restart not requested; validating the transport without a restart.");
      }
      connection = await connect();
      const channel = await connection.createConfirmChannel();
      const message = await channel.get("flawis.mail.review.v2", {
        noAck: false,
      });
      assert.ok(message);
      assert.equal(message.properties.messageId, id);
      assert.equal(message.properties.deliveryMode, 2);
      const body = JSON.parse(message.content.toString());
      dispatcher = new RmqService();
      await dispatcher.flush();
      assert.equal(
        await dispatcher.claim(
          new mongoose.Types.ObjectId(id) as any,
          body._notificationAttempt,
        ),
        true,
      );
      assert.equal(
        await dispatcher.claim(
          new mongoose.Types.ObjectId(id) as any,
          body._notificationAttempt,
        ),
        false,
      );
      await new Promise<void>((resolve, reject) =>
        channel.publish(
          notificationExchange(),
          "notification.result",
          Buffer.from(
            JSON.stringify({
              id,
              attempt: body._notificationAttempt,
              success: true,
            }),
          ),
          { persistent: true },
          (error) => (error ? reject(error) : resolve()),
        ),
      );
      channel.ack(message);
      for (
        let i = 0;
        i < 40 && (await jobs.findOne({ _id: id }))!.state !== "SENT";
        i++
      )
        await delay(50);
      assert.equal((await jobs.findOne({ _id: id }))!.state, "SENT");
      // A late or duplicated failure cannot undo a successful delivery.
      await dispatcher.applyResult({
        id,
        attempt: body._notificationAttempt,
        success: false,
        retryable: true,
      });
      assert.equal((await jobs.findOne({ _id: id }))!.state, "SENT");
      const uncertain = await jobs.create({
        routingKey: "mail.review",
        payload: "encrypted",
        state: "SENDING",
        leaseUntil: new Date(0),
      });
      await dispatcher.flush();
      assert.equal(
        (await jobs.findOne({ _id: uncertain._id }))!.state,
        "UNKNOWN",
      );
    } finally {
      await dispatcher.stop().catch(() => undefined);
      await connection?.close().catch(() => undefined);
      await mongoose.disconnect();
    }
  },
);
