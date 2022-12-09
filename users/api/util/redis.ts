import { Context } from "./auth";

const client = createClient({ url: "redis://redis:6379" });

export const initRedis = async () => {
  await client.connect();

  client.on("error", (err: any) => console.log("Redis Client Error", err));

  return client;
};

const ONE_DAY = 60 * 60 * 24;

export const rateLimit: (limit?: number) => MiddlewareFn<Context> =
  (limit = 50) =>
  async ({ context: { req }, info }, next) => {
    const key = `rate-limit:${info.fieldName}:${req.ip}`;

    const current = await client.incr(key);
    if (current > limit) {
      throw new Error("you're doing that too much");
    } else if (current === 1) {
      await client.expire(key, ONE_DAY);
    }

    return next();
  };
