import Redis from "ioredis";
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

export const publisher = new Redis(REDIS_URL);
export const subscriber = new Redis(REDIS_URL);

export const TASK_UPDATE_CHANNEL = "task:updates";

console.log("Pub / Sub clients initialized successfully");
