import { apiHandler } from '@/lib/server/api';
import { getDashboard } from '@/lib/services/analytics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/dashboard → mastery, streaks, due reviews, weak areas, curricula. */
export const GET = apiHandler({
  auth: true,
  handler: async ({ user }) => {
    const dashboard = await getDashboard(user!.id);
    return { dashboard };
  },
});
