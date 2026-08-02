import { z } from 'zod';
import { apiHandler } from '@/lib/server/api';
import { AppError } from '@/lib/server/errors';
import { prisma } from '@/lib/db';
import { generateCurriculum } from '@/engine';
import { createCurriculumFromResult } from '@/lib/services/curriculum';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const paramsSchema = z.object({ id: z.string().min(1) });
const bodySchema = z
  .object({
    provider: z.enum(['local', 'openai', 'anthropic']).optional(),
  })
  .optional();

/**
 * POST /api/documents/[id]/generate
 * Runs the Document → Curriculum pipeline and persists the result.
 * Body: { provider?: 'local' | 'openai' | 'anthropic' }
 */
export const POST = apiHandler({
  auth: true,
  params: paramsSchema,
  body: bodySchema,
  handler: async ({ params, body, user }) => {
    const document = await prisma.document.findFirst({
      where: { id: params.id, userId: user!.id },
      include: { chunks: { orderBy: { index: 'asc' } } },
    });
    if (!document) throw AppError.notFound('Document not found.');

    const existing = await prisma.curriculum.findUnique({ where: { documentId: document.id } });
    if (existing) {
      return { curriculumId: existing.id, reused: true };
    }

    await prisma.document.update({ where: { id: document.id }, data: { status: 'processing' } });

    let blocks: { level: number; title?: string; text: string }[] = [];
    try {
      blocks = document.structure ? (JSON.parse(document.structure) as typeof blocks) : [];
    } catch {
      blocks = [];
    }

    const parsed = {
      title: document.title,
      fileType: document.fileType as 'pdf' | 'docx' | 'txt' | 'md' | 'url',
      sourceUrl: document.sourceUrl ?? undefined,
      chunks: document.chunks.map((c) => ({
        index: c.index,
        text: c.text,
        section: c.section ?? undefined,
        page: c.page ?? undefined,
        startChar: c.startChar ?? 0,
        endChar: c.endChar ?? 0,
      })),
      blocks,
      outline: blocks.filter((b) => b.title).map((b) => b.title!),
      wordCount: document.chunks.reduce((s, c) => s + c.text.split(/\s+/).length, 0),
    };

    try {
      const result = await generateCurriculum(parsed, { prefer: body?.provider });
      const curriculum = await createCurriculumFromResult(user!.id, document.id, result);
      return {
        curriculumId: curriculum.id,
        engine: result.meta.engine,
        durationMs: result.meta.durationMs,
        modules: curriculum.totalModules,
        flashcards: result.flashcards.length,
      };
    } catch (e) {
      await prisma.document
        .update({ where: { id: document.id }, data: { status: 'failed', error: (e as Error).message } })
        .catch(() => undefined);
      throw e;
    }
  },
});
