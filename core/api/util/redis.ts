import { createClient } from "redis";

export const client = createClient({ url: "redis://redis:6379" });

client.on("error", (err: any) => {
  console.log("Redis Client Error", err);
});

export const initRedis = () => {
  const connectToRedis = async () => {
    try {
      await client.connect();
      console.log("Redis client connected!");
    } catch (error) {
      console.error("Error connecting to Redis:", error);
      // Retry after an error occurs
      setTimeout(connectToRedis, 1000 * 15);
    }
  };

  // Start the initial connection attempt
  connectToRedis();
};
