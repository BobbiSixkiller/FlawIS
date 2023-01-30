"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initRedis = exports.client = void 0;
const redis_1 = require("redis");
exports.client = (0, redis_1.createClient)({ url: "redis://redis:6379" });
const initRedis = async () => {
    await exports.client.connect();
    exports.client.on("error", (err) => console.log("Redis Client Error", err));
    return exports.client;
};
exports.initRedis = initRedis;
