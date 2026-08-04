import { z } from 'zod';
import { apiHandler } from '@/lib/server/api';
import { LIMITS } from '@/lib/server/rate-limit';
import { changePassword } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(8).max(128),
});

/** POST /api/auth/change-password — verify current, set new, revoke other sessions. */
export const POST = apiHandler({
  auth: true,
  body: bodySchema,
  limit: LIMITS.auth,
  handler: async ({ body }) => {
    await changePassword(body);
    return { ok: true };
  },
});
