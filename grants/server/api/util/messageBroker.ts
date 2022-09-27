import { getModelForClass } from "@typegoose/typegoose";
import client, { Connection, Channel } from "amqplib";
import env from "dotenv";
import { User } from "../entitites/User";

env.config();

type RoutingKey =
  | "email"
  | "user.delete"
  | "user.new"
  | "user.update.email"
  | "user.update.billings"
  | "user.#"
  | "user.*";

class Messagebroker {
  private connection: Connection;
  private channel: Channel;

  async init() {
    this.connection = await client.connect(
      process.env.RABBITMQ_URL || "amqp://username:password@localhost:5672"
    );
    this.channel = await this.connection.createChannel();
    await this.channel.assertExchange("FlawIS", "topic", { durable: false });
  }

  async consumeMessages(keys: RoutingKey[]) {
    const q = await this.channel.assertQueue("", { durable: true });
    console.log(" [*] Receiving messages with keys:", keys.toString());

    keys.forEach((key) => this.channel.bindQueue(q.queue, "FlawIS", key));

    this.channel.consume(
      q.queue,
      async (msg) => {
        if (msg) {
          console.log(
            " [x] %s:'%s'",
            msg.fields.routingKey,
            msg.content.toString()
          );
          const user: User = JSON.parse(msg.content.toString());
          await getModelForClass(User).deleteOne({ _id: user.id });
          this.channel.ack(msg);
        }
      },
      { noAck: false }
    );
  }

  produceMessage(msg: string, key: RoutingKey) {
    this.channel.publish("FlawIS", key, Buffer.from(msg), { persistent: true });
  }
}

const messageBroker = new Messagebroker();

export default messageBroker;
