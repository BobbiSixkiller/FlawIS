import client, { Connection, Channel, Message } from "amqplib";
import send from "./lib";

import env from "dotenv";

env.config();

type RoutingKey = "mail.#" | "mail.registration" | "mail.forgotPassword";

interface Locale {
  locale: string;
}

interface User extends Locale {
  name: string;
  email: string;
  token: string;
}
//implement invocie interface
interface Invoice extends Locale {
  payer: Object;
  issuer: Object;
  body: Object;
}

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
          await this.triggerMsgResponse(msg);
          this.channel.ack(msg);
        }
      },
      { noAck: false }
    );
  }

  produceMessage(msg: string, key: RoutingKey) {
    this.channel.publish("FlawIS", key, Buffer.from(msg), { persistent: true });
  }

  private async triggerMsgResponse(msg: Message) {
    console.log(" [x] %s:'%s'", msg.fields.routingKey, msg.content.toString());
    let data: User;

    switch (msg.fields.routingKey as RoutingKey) {
      case "mail.registration":
        data = JSON.parse(msg.content.toString());
        return await send(
          data.locale,
          "user/activation",
          "no-reply@flaw.uniba.sk",
          data.email,
          data,
          []
        );
      case "mail.forgotPassword":
        data = JSON.parse(msg.content.toString());
        return await send(
          data.locale,
          "user/forgotPassword",
          "no-reply@flaw.uniba.sk",
          data.email,
          data,
          []
        );

      default:
        return console.log("Message with unhandled routing key!");
    }
  }
}

const messageBroker = new Messagebroker();

export default messageBroker;
