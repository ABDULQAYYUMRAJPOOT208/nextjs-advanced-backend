import { Worker } from "bullmq";
import { connection } from "../lib/queues/emailQueue";
import prisma from "@/lib/prisma";

const emailWorker = new Worker(
  "email-notfications",
  async (job) => {
    const { taskId, userId } = job.data;
    console.log(
      "Worker prcessing job >> ",
      job.id,
      " for Task Id: >> ",
      taskId
    );

    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
      });
      if (!task) {
        throw new Error("Task not found");
      }
      console.log(
        `Simulating external email api call for task >> "${task.title}" to user >> ${userId}`
      );
      await new Promise((resolve) => setTimeout(resolve, 5000));
      console.log("Email sent successfully for task, ", taskId);
      return { status: "success", sentTo: userId, taskTitle: task.title };
    } catch (err) {
      console.error(`Job ${job.id} failed >> `, err);
      throw err;
    }
  },
  {
    connection,
    concurrency: 5,
  }
);

emailWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

emailWorker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed >> `, err);
});

emailWorker.on("error", (err) => {
  console.error("Worker error >> ", err);
});

console.log("Email worker initialized successfully");
