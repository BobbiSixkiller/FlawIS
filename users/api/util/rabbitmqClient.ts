// import amqp, { Connection } from "amqplib/callback_api";

// type RoutingKey = "email" | "user.update" | "user.delete" | "user.new";

// const createMQProducer = (amqpUrl: string, exchange: string) => {
//   console.log("Connecting to RabbitMQ...");
//   let ch: any;
//   amqp.connect(amqpUrl, (errorConnect: Error, connection: Connection) => {
//     if (errorConnect) {
//       console.log("Error connecting to RabbitMQ: ", errorConnect);
//       return;
//     }

//     connection.createChannel((errorChannel, channel) => {
//       if (errorChannel) {
//         console.log("Error creating channel: ", errorChannel);
//         return;
//       }
//       ch = channel.assertExchange("FlawIS", "topic", {           durable: false });
//       console.log("Connected to RabbitMQ");
//     });
//   });

//   return (msg: string, binding: RoutingKey) => {
//     console.log("Produce message to RabbitMQ...");
//     ch.publish(exchange, binding, Buffer.from(msg), { persistent: true });
//   };
// };

// export default createMQProducer;

import client, { Connection, Channel, ConsumeMessage } from "amqplib";
import env from "dotenv";

env.config();

type RoutingKey = "email" | "user.update" | "user.delete" | "user.new";

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

  produceMessage(msg: string, key: RoutingKey) {
    this.channel.publish("FlawIS", key, Buffer.from(msg), { persistent: true });
  }

  consumeMessages() {
    // ...
  }
}

const messageBroker = new Messagebroker();

export default messageBroker;
