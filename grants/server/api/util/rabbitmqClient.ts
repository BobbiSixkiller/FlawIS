import { getModelForClass } from "@typegoose/typegoose";
import amqp, { Message } from "amqplib/callback_api";
import { User } from "../entitites/User";

type RoutingKey =
  | "email"
  | "user.update"
  | "user.delete"
  | "user.new"
  | "user.*";

const createMQConsumer = (
  amqpURl: string,
  exchange: string,
  keys: RoutingKey[]
) => {
  console.log("Connecting to RabbitMQ...");
  return () => {
    amqp.connect(amqpURl, (errConn, conn) => {
      if (errConn) {
        throw errConn;
      }

      conn.createChannel((errChan, chan) => {
        if (errChan) {
          throw errChan;
        }

        console.log("Connected to RabbitMQ");
        chan.assertExchange(exchange, "topic", {
          durable: false,
        });
        chan.assertQueue(
          "",
          {
            durable: true,
          },
          function (errQueue, q) {
            if (errQueue) {
              throw errQueue;
            }
            console.log("[*] Receiving messages from queue.");

            keys.forEach(function (key) {
              chan.bindQueue(q.queue, exchange, key);
            });

            chan.consume(
              q.queue,
              async function (msg: Message | null) {
                if (msg) {
                  console.log(
                    " [x] %s: '%s'",
                    msg.fields.routingKey,
                    JSON.parse(msg.content.toString())
                  );
                  const user: User = JSON.parse(msg.content.toString());
                  await getModelForClass(User).updateOne(
                    { _id: user?.id },
                    {
                      _id: user?.id,
                      email: user?.email,
                    },
                    { upsert: true }
                  );
                  chan.ack(msg);
                }
              },
              {
                noAck: false,
              }
            );
          }
        );
      });
    });
  };
};

export default createMQConsumer;
