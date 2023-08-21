import { MiddlewareFn } from "type-graphql";
import { Context } from "../util/auth";
import { client } from "../util/redis";

const ONE_DAY = 60 * 60 * 24;

export const RateLimit: (limit?: number) => MiddlewareFn<Context> =
  (limit = 50) =>
  async ({ context: { req }, info }, next) => {
    const key = `rate-limit:${info.fieldName}:${req.ips[req.ips.length - 1]}`;

    const current = await client.incr(key);
    if (current > limit) {
      throw new Error("you're doing that too much, try it again later");
    } else if (current === 1) {
      await client.expire(key, ONE_DAY);
    }

    return next();
  };
