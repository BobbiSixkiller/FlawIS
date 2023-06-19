import { createClient } from "redis";

export const client = createClient({ url: "redis://redis:6379" });

export const initRedis = async () => {
  await client.connect();

  client.on("connect", () => console.log("Redis client connected!"));

  client.on("error", (err: any) => console.log("Redis Client Error", err));

  return client;
};
