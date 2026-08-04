import { z } from 'zod';
import { apiHandler } from '@/lib/server/api';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const querySchema = z.object({
  curriculumId: z.string().optional(),
  mode: z.enum(['review', 'cram']).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

/**
 * GET /api/flashcards/due?curriculumId&mode=review|cram&limit
 *  - review: cards due now (SRS-priority, oldest first)
 *  - cram:   all cards, including new ones (newest first)
 */
export const GET = apiHandler({
  auth: true,
  query: querySchema,
  handler: async ({ query, user }) => {
    const limit = query.limit ?? 40;
    const where: { userId: string; curriculumId?: string } = { userId: user!.id };
    if (query.curriculumId) where.curriculumId = query.curriculumId;

    const cards = await prisma.flashcard.findMany({
      where: query.mode === 'cram' ? where : { ...where, dueDate: { lte: new Date() } },
      orderBy: query.mode === 'cram' ? { dueDate: 'desc' } : { dueDate: 'asc' },
      take: limit,
      include: { sourceChunk: { select: { text: true } } },
    });

    return {
      cards: cards.map((c) => ({
        id: c.id,
        front: c.front,
        back: c.back,
        sourceRef: c.sourceRef,
        sourceText: c.sourceChunk?.text ?? '',
        interval: c.interval,
        dueDate: c.dueDate,
      })),
      total: cards.length,
    };
  },
});
