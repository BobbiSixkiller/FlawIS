import { Service } from "typedi";
import * as amqp from "amqplib";

export type RoutingKey =
  | "user.delete"
  | "user.new"
  | "mail.registration"
  | "mail.reset"
  | "mail.conference.invoice"
  | "mail.conference.coAuthor"
  | "mail.internships.newOrg"
  | "mail.internships.applied"
  | "mail.internships.eligible"
  | "mail.internships.accepted"
  | "mail.internships.rejected"
  | "mail.internships.admin"
  | "mail.internships.org";

const uri = process.env.RMQ_URI || "amqp://rabbitmq:5672";
const exchange = process.env.RMQ_EXCHANGE || "FlawIS";

@Service()
export class RmqService {
  private connection?: amqp.ChannelModel;
  private channel?: amqp.Channel;

  constructor() {
    this.init(); // Initialize connection and channel on service creation
  }

  private async createConnection() {
    try {
      if (!this.connection) {
        this.connection = await amqp.connect(uri);

        this.connection?.on("error", (err) => {
          console.error("RMQ Error:", err);
          this.connection = undefined;
          this.retryInit();
        });

        this.connection?.on("close", () => {
          console.error(
            "Connection to RMQ server closed! Trying to re-establish..."
          );
          this.connection = undefined;
          this.retryInit();
        });
      }
    } catch (error) {
      console.error("Error connecting to RMQ:", error);
      this.retryInit();
    }
  }

  private async createChannel() {
    try {
      if (!this.channel && this.connection) {
        this.channel = await this.connection.createChannel();
        await this.channel?.assertExchange(exchange, "topic", {
          durable: false,
        });
      }
    } catch (error) {
      console.error("Error creating channel:", error);
      this.retryInit();
    }
  }

  private async init() {
    await this.createConnection();
    await this.createChannel();
  }

  private retryInit() {
    console.error("Retrying RMQ initialization in 15 seconds...");
    setTimeout(() => this.init(), 1000 * 15);
  }

  async produceMessage(msg: string, key: RoutingKey) {
    if (!this.channel) {
      console.error("Channel is not initialized. Retrying...");
      await this.init();
    }

    if (this.channel) {
      this.channel.publish(exchange, key, Buffer.from(msg), {
        persistent: true,
      });
    } else {
      console.error("Failed to publish message: RMQ channel is unavailable.");
    }
  }
}
