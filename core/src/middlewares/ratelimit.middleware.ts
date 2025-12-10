import { MiddlewareFn } from "type-graphql";
import { Context } from "../util/auth";
import Container from "typedi";
import { I18nService } from "../services/i18n.service";
import { RedisService } from "../services/redis.service";

const TEN_MIN = 10 * 60;

export const RateLimit: (limit?: number) => MiddlewareFn<Context> =
  (limit = 50) =>
  async ({ context: { req }, info }, next) => {
    const key = `rate-limit:${info.fieldName}:${req.ips[req.ips.length - 1]}`;

    const current = await Container.get(RedisService).incr(key);
    if (current > limit) {
      throw new Error(
        Container.get(I18nService).translate("ratelimit", {
          ns: "common",
        })
      );
    } else if (current === 1) {
      await Container.get(RedisService).expire(key, TEN_MIN);
    }

    return next();
  };
