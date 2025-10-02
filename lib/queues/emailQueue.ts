import { Queue } from "bullmq";
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const redisHost = new URL(REDIS_URL).hostname;
const redisPort = new URL(REDIS_URL).port;
export const connection = {
  host: redisHost,
  port: parseInt(redisPort),
};

export const emailQueue = new Queue("email-notfications", {
  connection,
});

export const addCompletionEmailJob = async (taskId: string, userId: string) => {
  await emailQueue.add(
    "sendCompletionEmail",
    {
      taskId,
      userId,
    },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
    }
  );
  console.log(`Job for Task ${taskId} added to the queue`);
};
