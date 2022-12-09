import { createClient } from "redis";

export const initRedis = async () => {
  const client = createClient({ url: "redis://redis:6379" });

  await client.connect();

  client.on("error", (err: any) => console.log("Redis Client Error", err));

  return client;
};
