import { z } from 'zod';
import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/server/api';
import { LIMITS } from '@/lib/server/rate-limit';
import { signIn, requestMetaFrom, cookieOptions } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  email: z.string().min(3).max(254),
  password: z.string().min(1).max(128),
});

/** POST /api/auth/login — verify credentials and start a session. */
export const POST = apiHandler({
  body: bodySchema,
  limit: LIMITS.auth,
  handler: async ({ body, req }) => {
    const { user, sessionToken } = await signIn(body, requestMetaFrom(req));
    const res = NextResponse.json({ data: { user } });
    res.cookies.set('lumora_session', sessionToken, cookieOptions());
    return res;
  },
});
