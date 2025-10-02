// app/api/health/route.ts
import { NextResponse } from 'next/server';
import redis from '@/lib/redis';
import prisma from '@/lib/prisma';

export async function GET() {
  const checks: { [key: string]: boolean } = {};
  let status = 200;

  // 1. Check PostgreSQL (Run a simple query)
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.postgres = true;
  } catch (e) {
    checks.postgres = false;
    status = 503; // Service Unavailable
  }

  // 2. Check Redis (Ping command)
  try {
    const redisResponse = await redis.ping();
    checks.redis = redisResponse === 'PONG';
    if (!checks.redis) status = 503;
  } catch (e) {
    checks.redis = false;
    status = 503;
  }

  // 3. Overall Status
  if (status !== 200) {
    return NextResponse.json({ status: 'DOWN', checks }, { status });
  }
  
  return NextResponse.json({ status: 'UP', checks }, { status: 200 });
}