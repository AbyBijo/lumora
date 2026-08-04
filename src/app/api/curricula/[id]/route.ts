import { z } from 'zod';
import { apiHandler } from '@/lib/server/api';
import { AppError } from '@/lib/server/errors';
import { prisma } from '@/lib/db';
import { getCurriculumWithProgress } from '@/lib/services/curriculum';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const paramsSchema = z.object({ id: z.string().min(1) });

/** GET /api/curricula/[id] → full annotated tree with progress. */
export const GET = apiHandler({
  auth: true,
  params: paramsSchema,
  handler: async ({ params, user }) => {
    const tree = await getCurriculumWithProgress(user!.id, params.id);
    if (!tree) throw AppError.notFound('Curriculum not found.');
    return { curriculum: tree };
  },
});

const patchSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['draft', 'approved']).optional(),
  })
  .optional();

/** PATCH /api/curricula/[id] → rename, edit description, approve. */
export const PATCH = apiHandler({
  auth: true,
  params: paramsSchema,
  body: patchSchema,
  handler: async ({ params, body, user }) => {
    const existing = await prisma.curriculum.findFirst({
      where: { id: params.id, userId: user!.id },
    });
    if (!existing) throw AppError.notFound('Curriculum not found.');

    const updated = await prisma.curriculum.update({
      where: { id: params.id },
      data: {
        title: body?.title ?? existing.title,
        description: body?.description ?? existing.description,
        status: body?.status ?? existing.status,
      },
    });
    return { curriculum: updated };
  },
});
