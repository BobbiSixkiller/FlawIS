// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { getModelForClass } from "@typegoose/typegoose";
import client, { Connection, Channel, Message } from "amqplib";
import env from "dotenv";
import User, { File } from "../entities/File";

env.config();

type RoutingKey =
  | "file.delete"
  | "user.new"
  | "user.delete"
  | "user.update.personal";

class Messagebroker {
  private static connection?: Connection;
  private static channel: Channel;

  private static async createConnection() {
    try {
      if (!this.connection) {
        this.connection = await client.connect(
          process.env.RABBITMQ_URI || "amqp://rabbitmq:5672"
        );
      }

      this.connection.on("error", (err: any) => {
        console.log("RMQ Error: ", err);
        this.connection = undefined;
        setTimeout(() => this.createConnection(), 1000 * 15);
      });

      this.connection.on("close", () => {
        console.log(
          "Connection to RMQ server closed! Trying to establish new one..."
        );
        this.connection = undefined;
        setTimeout(() => this.createConnection(), 1000 * 15);
      });
    } catch (error) {
      console.log("Catch error: ", error);
      this.connection = undefined;
      setTimeout(() => this.createConnection(), 1000 * 15);
    }
  }

  private static async createChannel() {
    if (!this.channel && this.connection) {
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange("FlawIS", "topic", { durable: false });
    }
    return this.channel;
  }

  static async init() {
    await this.createConnection();
    await this.createChannel();
    await this.consumeMessages(["file.delete", "user.update.personal"]);
  }

  private static async consumeMessages(keys: RoutingKey[]) {
    const q = await this.channel.assertQueue("", { durable: true });
    console.log(" [*] Receiving messages with keys:", keys.toString());

    keys.forEach((key) => this.channel.bindQueue(q.queue, "FlawIS", key));

    this.channel.consume(
      q.queue,
      async (msg: client.ConsumeMessage | null) => {
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

    switch (msg.fields.routingKey as RoutingKey) {
      case "user.update.personal":
        const user: User = JSON.parse(msg.content.toString());

        return await getModelForClass(File).updateOne(
          {
            "user.id": user.id,
          },
          { $set: { email: user.email } }
        );
      case "user.delete":
        const deletedUser: User = JSON.parse(msg.content.toString());

        return await getModelForClass(User).deleteOne({ _id: deletedUser.id });

      default:
        return console.log("Message with unhandled routing key!");
    }
  }
}

export default Messagebroker;
