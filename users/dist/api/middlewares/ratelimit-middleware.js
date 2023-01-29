"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimit = void 0;
const redis_1 = require("../util/redis");
const ONE_DAY = 60 * 60 * 24;
const RateLimit = (limit = 50) => async ({ context: { req }, info }, next) => {
    const key = `rate-limit:${info.fieldName}:${req.ip}`;
    const current = await redis_1.client.incr(key);
    if (current > limit) {
        throw new Error("you're doing that too much");
    }
    else if (current === 1) {
        await redis_1.client.expire(key, ONE_DAY);
    }
    return next();
};
exports.RateLimit = RateLimit;
