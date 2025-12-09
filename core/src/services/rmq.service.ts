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
  | "mail.internships.org"
  | "mail.courses.applied"
  | "mail.courses.eligible"
  | "mail.courses.accepted"
  | "mail.courses.rejected";

const uri = process.env.RMQ_URI || "amqp://rabbitmq:5672?frameMax=131072";
const exchange = process.env.RMQ_EXCHANGE || "FlawIS";

@Service()
export class RmqService {
  private connection?: amqp.ChannelModel; // FIXED TYPE
  private channel?: amqp.Channel;
  private initializing: Promise<void> | null = null;

  constructor() {
    this.init(); // Initialize connection and channel on service creation
  }

  private async createConnection() {
    try {
      if (!this.connection) {
        this.connection = await amqp.connect(uri, {
          frameMax: 131072,
        });

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
    if (this.initializing) return this.initializing;
    this.initializing = (async () => {
      await this.createConnection();
      await this.createChannel();
    })();
    await this.initializing;
    this.initializing = null;
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
      try {
        this.channel.publish(exchange, key, Buffer.from(msg), {
          persistent: true,
        });
      } catch (err) {
        console.error("Failed to publish RMQ message:", err);
        // Optionally retry or queue message locally
      }
    } else {
      console.error("Failed to publish message: RMQ channel is unavailable.");
    }
  }
}
