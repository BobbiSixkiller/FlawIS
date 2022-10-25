import { getModelForClass } from "@typegoose/typegoose";
import client, { Connection, Channel, Message } from "amqplib";
import env from "dotenv";
import { User } from "../entitites/User";

env.config();

type RoutingKey =
  | "user.delete"
  | "user.new"
  | "user.update.email"
  | "user.update.billings"
  | "mail.registration"
  | "mail.forgotPassword";

class Messagebroker {
  private static connection: Connection;
  private static channel: Channel;

  static async createConnection() {
    if (!this.connection) {
      this.connection = await client.connect(
        process.env.RABBITMQ_URL || "amqp://rabbitmq:5672"
      );
    }
    return this.connection;
  }

  static async createChannel() {
    if (!this.channel) {
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange("FlawIS", "topic", { durable: false });
    }
    return this.channel;
  }

  static async init() {
    await this.createConnection();
    await this.createChannel();
  }

  static async consumeMessages(keys: RoutingKey[]) {
    const q = await this.channel.assertQueue("", { durable: true });
    console.log(" [*] Receiving messages with keys:", keys.toString());

    keys.forEach((key) => this.channel.bindQueue(q.queue, "FlawIS", key));

    this.channel.consume(
      q.queue,
      async (msg) => {
        if (msg) {
          await this.triggerMsgResponse(msg);
          this.channel.ack(msg);
        }
      },
      { noAck: false }
    );
  }

  static produceMessage(msg: string, key: RoutingKey) {
    this.channel.publish("FlawIS", key, Buffer.from(msg), { persistent: true });
  }

  private static async triggerMsgResponse(msg: Message) {
    console.log(" [x] %s:'%s'", msg.fields.routingKey, msg.content.toString());
    const user: User = JSON.parse(msg.content.toString());

    switch (msg.fields.routingKey as RoutingKey) {
      case "user.update.billings":
        return await getModelForClass(User).updateOne(
          { _id: user.id },
          { $set: { updatedAt: user.updatedAt } }
        );

      default:
        return console.log("Message with unhandled routing key!");
    }
  }
}

export default Messagebroker;
