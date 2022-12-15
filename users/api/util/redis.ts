import { MiddlewareFn } from "type-graphql";
import { createClient } from "redis";
import { Context } from "./auth";

export const client = createClient({ url: "redis://redis:6379" });

export const initRedis = async () => {
  await client.connect();

  client.on("error", (err: any) => console.log("Redis Client Error", err));

  return client;
};
