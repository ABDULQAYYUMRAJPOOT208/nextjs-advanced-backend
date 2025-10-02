import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

export const redis = new Redis(REDIS_URL);

redis.on("error", (err) => console.error("Redis connection error >> ", err));
redis.on("connect", () => console.log("Redis connected successfully"));
redis.on("end", () => console.log("Redis disconnected"));

export default redis;
