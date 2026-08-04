import { z } from 'zod';
import { apiHandler } from '@/lib/server/api';
import { reviewFlashcard } from '@/lib/services/study';
import { SRS_RATINGS } from '@/lib/srs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const paramsSchema = z.object({ id: z.string().min(1) });
const bodySchema = z.object({
  rating: z.enum(SRS_RATINGS.map((r) => r.value) as ['again', 'hard', 'good', 'easy']),
});

/** POST /api/flashcards/[id]/review { rating } → SM-2 transition. */
export const POST = apiHandler({
  auth: true,
  params: paramsSchema,
  body: bodySchema,
  handler: async ({ params, body, user }) => {
    const card = await reviewFlashcard(user!.id, params.id, body.rating);
    return {
      card: {
        id: card.id,
        interval: card.interval,
        easeFactor: card.easeFactor,
        repetitions: card.repetitions,
        dueDate: card.dueDate,
      },
    };
  },
});
