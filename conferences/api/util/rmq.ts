import { getModelForClass } from "@typegoose/typegoose";
import client, { Connection, Channel, Message } from "amqplib";
import env from "dotenv";
import { Attendee } from "../entities/Attendee";
import { User } from "../entities/User";

env.config();

type RoutingKey =
  | "user.new"
  | "user.delete"
  | "user.update.personal"
  | "user.update.billings"
  | "mail.conference.invoice"
  | "mail.conference.coAuthor";

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

      this.connection.on("error", (err) => {
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
    await this.consumeMessages([
      "user.delete",
      "user.new",
      "user.update.personal",
    ]);
  }

  private static async consumeMessages(keys: RoutingKey[]) {
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
      case "user.new":
        return await getModelForClass(User).create({
          _id: user.id,
          email: user.email,
          name: user.name,
        });
      case "user.update.personal":
        return await getModelForClass(User).updateOne(
          {
            _id: user.id,
          },
          { $set: { email: user.email, name: user.name } }
        );
      case "user.delete":
        return await Promise.all([
          getModelForClass(Attendee).deleteMany({ user: user.id }),
          getModelForClass(User).deleteOne({ _id: user.id }),
        ]);

      default:
        return console.log("Message with unhandled routing key!");
    }
  }
}

export default Messagebroker;
