import { createClient } from "redis";

export const client = createClient({ url: "redis://redis:6379" });

export const initRedis = async () => {
  try {
    await client.connect();

    client.on("connect", () => console.log("Redis client connected!"));

    client.on("error", (err: any) => console.log("Redis Client Error", err));

    return client;
  } catch (error) {
    console.log("Redis init failed, retrying in 15sec...");
    setTimeout(() => initRedis(), 1000 * 15);
  }
};
