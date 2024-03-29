// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { getModelForClass } from "@typegoose/typegoose";
import client, { Connection, Channel, Message } from "amqplib";
import env from "dotenv";
import { unlink } from "fs";
import { join } from "path";
import { User, File } from "../entities/File";

env.config();

type RoutingKey =
  | "file.delete"
  | "user.new"
  | "user.delete"
  | "user.update.personal";

const uri = process.env.RMQ_URI || "amqp://rabbitmq:5672";
const exchange = process.env.RMQ_EXCHANGE || "FlawIS";

class Messagebroker {
  private static connection?: Connection;
  private static channel: Channel;

  private static async createConnection() {
    try {
      if (!this.connection) {
        this.connection = await client.connect(uri);
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
      await this.channel.assertExchange(exchange, "topic", { durable: false });
    }
    return this.channel;
  }

  static async init() {
    try {
      await this.createConnection();
      await this.createChannel();
      await this.consumeMessages(["file.delete", "user.update.personal"]);
    } catch (error) {
      console.log(
        "Can not initialize a connection to RMQ server! Trying again in 15s..."
      );
      this.connection = undefined;
      setTimeout(() => this.init(), 1000 * 15);
    }
  }

  private static async consumeMessages(keys: RoutingKey[]) {
    const q = await this.channel.assertQueue("", { durable: true });
    console.log(" [*] Receiving messages with keys:", keys.toString());

    keys.forEach((key) => this.channel.bindQueue(q.queue, exchange, key));

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
    this.channel.publish(exchange, key, Buffer.from(msg), { persistent: true });
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
      case "file.delete":
        const file: Pick<File, "id" | "path"> = JSON.parse(
          msg.content.toString()
        );
        unlink(join(process.cwd() + file.path), async (err) => {
          if (err) {
            console.log(err);
          }
          await getModelForClass(File).deleteOne({ _id: file.id });
        });
        return;

      default:
        return console.log(
          "Message with unhandled routing key: " + msg.fields.routingKey
        );
    }
  }
}

export default Messagebroker;
