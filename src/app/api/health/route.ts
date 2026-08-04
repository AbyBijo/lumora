import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/health — liveness + database connectivity probe.
 * Used by load balancers, container orchestrators, and uptime monitors.
 */
export async function GET() {
  let db = true;
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    db = false;
  }
  return NextResponse.json(
    {
      data: {
        status: db ? 'ok' : 'degraded',
        db,
        uptime: Math.round(process.uptime()),
        time: new Date().toISOString(),
      },
    },
    { status: db ? 200 : 503 }
  );
}
