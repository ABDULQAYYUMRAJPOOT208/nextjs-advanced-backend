// ./app/api/tasks/[id]/complete/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { addCompletionEmailJob } from '@/lib/queues/emailQueue';
import redis from '@/lib/redis';
import { publisher, TASK_UPDATE_CHANNEL } from '@/lib/pubsub';

const CACHE_KEY = 'tasks:all';

export async function POST(
  request: Request,
  { params }: { params: { id: string } } // Next.js way to get dynamic route ID
) {
  const taskId = params.id;
  // NOTE: In a real app, you'd get the current user ID from a session or token.
  const userId = 'system-admin-001'; 

  try {
    // 1. Update Persistent DB (PostgreSQL)
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { isCompleted: true },
    });

    // 2. Invalidate Cache
    await redis.del(CACHE_KEY);

    // 3. Publish Real-Time Update (Via Pub/Sub to WebSocket Server)
    await publisher.publish(
      TASK_UPDATE_CHANNEL,
      JSON.stringify({ type: 'TASK_COMPLETED', task: updatedTask })
    );

    // 4. Add the ASYNCHRONOUS Job to the Queue!
    // The API request finishes here, *before* the email is sent.
    await addCompletionEmailJob(taskId, userId);

    // 5. Respond to the Client
    return NextResponse.json({
      task: updatedTask,
      message: 'Task completed. Email notification queued for background processing.',
    });
  } catch (error) {
    console.error('Task completion error:', error);
    return NextResponse.json(
      { error: 'Failed to complete task' },
      { status: 500 }
    );
  }
}