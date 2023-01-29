"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typegoose_1 = require("@typegoose/typegoose");
const amqplib_1 = __importDefault(require("amqplib"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = require("../entitites/User");
dotenv_1.default.config();
class Messagebroker {
    static async createConnection() {
        if (!this.connection) {
            this.connection = await amqplib_1.default.connect(process.env.RABBITMQ_URI || "amqp://rabbitmq:5672");
        }
        this.connection.on("error", (err) => {
            console.log(err);
            this.connection = undefined;
            setTimeout(this.createConnection, 1000 * 60);
        });
        this.connection.on("close", () => {
            console.log("Connection to RMQ server closed! Trying to establish new one...");
            this.connection = undefined;
            setTimeout(this.createConnection, 1000 * 60);
        });
        return this.connection;
    }
    static async createChannel() {
        if (!this.channel && this.connection) {
            this.channel = await this.connection.createChannel();
            await this.channel.assertExchange("FlawIS", "topic", { durable: false });
        }
        return this.channel;
    }
    static async init() {
        await this.createConnection();
        await this.createChannel();
    }
    static async consumeMessages(keys) {
        const q = await this.channel.assertQueue("", { durable: true });
        console.log(" [*] Receiving messages with keys:", keys.toString());
        keys.forEach((key) => this.channel.bindQueue(q.queue, "FlawIS", key));
        this.channel.consume(q.queue, async (msg) => {
            if (msg) {
                await this.triggerMsgResponse(msg);
                this.channel.ack(msg);
            }
        }, { noAck: false });
    }
    static produceMessage(msg, key) {
        this.channel.publish("FlawIS", key, Buffer.from(msg), { persistent: true });
    }
    static async triggerMsgResponse(msg) {
        console.log(" [x] %s:'%s'", msg.fields.routingKey, msg.content.toString());
        const user = JSON.parse(msg.content.toString());
        switch (msg.fields.routingKey) {
            case "user.update.billings":
                return await (0, typegoose_1.getModelForClass)(User_1.User).updateOne({ _id: user.id }, { $set: { updatedAt: user.updatedAt } });
            default:
                return console.log("Message with unhandled routing key!");
        }
    }
}
exports.default = Messagebroker;
