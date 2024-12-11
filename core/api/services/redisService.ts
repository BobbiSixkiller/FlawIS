import { createClient, RedisClientType } from "redis";
import { Service } from "typedi";

@Service()
export class RedisService {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URI || "redis://redis:6379",
    });

    this.client.on("error", (err: any) => {
      console.error("Redis Client Error:", err);
    });

    this.init();
  }

  private async connectToRedis(): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
        console.log("Redis client connected!");
      }
    } catch (error) {
      console.error("Error connecting to Redis:", error);
      setTimeout(() => this.connectToRedis(), 1000 * 15); // Retry after an error
    }
  }

  private async init(): Promise<void> {
    await this.connectToRedis();
  }

  async set(
    key: string,
    value: string,
    expiryInSeconds?: number
  ): Promise<void> {
    if (!this.client.isOpen) {
      console.warn("Redis client is not connected. Attempting to reconnect...");
      await this.connectToRedis();
    }
    await this.client.set(key, value, { EX: expiryInSeconds });
  }

  async get(key: string): Promise<string | null> {
    if (!this.client.isOpen) {
      console.warn("Redis client is not connected. Attempting to reconnect...");
      await this.connectToRedis();
    }
    return this.client.get(key);
  }

  async delete(key: string): Promise<void> {
    if (!this.client.isOpen) {
      console.warn("Redis client is not connected. Attempting to reconnect...");
      await this.connectToRedis();
    }
    await this.client.del(key);
  }

  async incr(key: string) {
    if (!this.client.isOpen) {
      console.warn("Redis client is not connected. Attempting to reconnect...");
      await this.connectToRedis();
    }
    return await this.client.incr(key);
  }

  async expire(key: string, seconds: number) {
    if (!this.client.isOpen) {
      console.warn("Redis client is not connected. Attempting to reconnect...");
      await this.connectToRedis();
    }
    return await this.client.expire(key, seconds);
  }

  async disconnect(): Promise<void> {
    if (this.client.isOpen) {
      await this.client.disconnect();
      console.log("Redis client disconnected!");
    }
  }
}
