import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/server/api';
import { signOut } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** POST /api/auth/logout — revoke the current session and clear the cookie. */
export const POST = apiHandler({
  auth: true,
  handler: async () => {
    await signOut();
    const res = NextResponse.json({ data: { ok: true } });
    res.cookies.delete('lumora_session');
    return res;
  },
});
