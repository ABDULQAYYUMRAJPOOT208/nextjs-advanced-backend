import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { addCompletionEmailJob } from '@/lib/queues/emailQueue';
import redis from '@/lib/redis';
import { publisher, TASK_UPDATE_CHANNEL } from '@/lib/pubsub';

const CACHE_KEY = 'tasks:all';

export async function POST(
  request: Request,
  { params }: { params: { id: string } } 
) {
  const taskId = params.id;
  const userId = 'system-admin-001'; 

  try {
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { isCompleted: true },
    });

    await redis.del(CACHE_KEY);

    await publisher.publish(
      TASK_UPDATE_CHANNEL,
      JSON.stringify({ type: 'TASK_COMPLETED', task: updatedTask })
    );

    await addCompletionEmailJob(taskId, userId);

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