import client, { Connection, Channel } from "amqplib";
import env from "dotenv";

env.config();

type RoutingKey =
  | "user.delete"
  | "user.new"
  | "mail.registration"
  | "mail.reset"
  | "mail.conference.invoice"
  | "mail.conference.coAuthor";

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

  static async createChannel() {
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
    } catch (error) {
      console.log(
        "Can not initialize a connection to RMQ server! Trying again in 15s..."
      );
      this.connection = undefined;
      setTimeout(() => this.init(), 1000 * 15);
    }
  }

  static produceMessage(msg: string, key: RoutingKey) {
    this.channel.publish(exchange, key, Buffer.from(msg), { persistent: true });
  }
}

export default Messagebroker;
