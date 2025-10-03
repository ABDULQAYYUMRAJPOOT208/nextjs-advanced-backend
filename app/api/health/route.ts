import { NextResponse } from 'next/server';
import redis from '@/lib/redis';
import prisma from '@/lib/prisma';

export async function GET() {
  const checks: { [key: string]: boolean } = {};
  let status = 200;

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.postgres = true;
  } catch (e) {
    checks.postgres = false;
    status = 503; 
  }

  try {
    const redisResponse = await redis.ping();
    checks.redis = redisResponse === 'PONG';
    if (!checks.redis) status = 503;
  } catch (e) {
    checks.redis = false;
    status = 503;
  }

  if (status !== 200) {
    return NextResponse.json({ status: 'DOWN', checks }, { status });
  }
  
  return NextResponse.json({ status: 'UP', checks }, { status: 200 });
}