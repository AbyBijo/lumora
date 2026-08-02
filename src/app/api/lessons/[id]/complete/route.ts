import { z } from 'zod';
import { apiHandler } from '@/lib/server/api';
import { completeLesson } from '@/lib/services/study';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const paramsSchema = z.object({ id: z.string().min(1) });
const bodySchema = z.object({ completed: z.boolean().optional() });

/** POST /api/lessons/[id]/complete → mark a lesson complete. */
export const POST = apiHandler({
  auth: true,
  params: paramsSchema,
  body: bodySchema,
  handler: async ({ params, body, user }) => {
    const record = await completeLesson(user!.id, params.id, body.completed !== false);
    return { record };
  },
});
