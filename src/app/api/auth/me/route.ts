import { apiHandler } from '@/lib/server/api';
import { me } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/auth/me — current user + settings. */
export const GET = apiHandler({
  auth: true,
  handler: async () => me(),
});
