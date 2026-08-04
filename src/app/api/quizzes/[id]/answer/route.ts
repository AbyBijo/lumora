import { z } from 'zod';
import { apiHandler } from '@/lib/server/api';
import { answerQuiz } from '@/lib/services/study';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const paramsSchema = z.object({ id: z.string().min(1) });
const bodySchema = z.object({ answer: z.string().min(1).max(4000) });

/** POST /api/quizzes/[id]/answer → instant, sourced feedback + mastery update. */
export const POST = apiHandler({
  auth: true,
  params: paramsSchema,
  body: bodySchema,
  handler: async ({ params, body, user }) => {
    const result = await answerQuiz(user!.id, params.id, body.answer);
    return { result };
  },
});
