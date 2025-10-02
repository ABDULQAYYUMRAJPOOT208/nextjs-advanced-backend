import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";
import { PrismaClient } from "@/app/generated/prisma";
import redis from "@/lib/redis";
import { publisher, TASK_UPDATE_CHANNEL } from "@/lib/pubsub";
const CACHE_KEY = "tasks:all";
const CACHE_EXPIRY = 60;
const prisma = new PrismaClient();

export async function GET() {
  try {
    const cachedData = await redis.get(CACHE_KEY);
    if (cachedData) {
      console.log("Returning data from cache redis ");
      return NextResponse.json(JSON.parse(cachedData));
    }

    console.log("Fetching task from postgresql");
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: "desc" },
    });

    await redis.setex(CACHE_KEY, CACHE_EXPIRY, JSON.stringify(tasks));

    return NextResponse.json(tasks);
  } catch (err) {
    console.error("Api error : ", err);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    console.log("--- writing new task to postgresql ---");
    const newTask = await prisma.task.create({
      data: {
        title,
        description,
      },
    });

    await redis.del(CACHE_KEY);
    const message = JSON.stringify({
      type: "TASK_CREATED",
      task: newTask,
    });

    publisher.publish(TASK_UPDATE_CHANNEL, message);
    console.log(
      "-- Published update to redis Pub/Sub -- channed >> ",
      TASK_UPDATE_CHANNEL
    );
    return NextResponse.json(newTask, { status: 201 });
  } catch (err) {
    console.error("Api error : ", err);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
