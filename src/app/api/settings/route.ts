import { z } from 'zod';
import { apiHandler } from '@/lib/server/api';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z
  .object({
    theme: z.enum(['dark', 'light']).optional(),
    provider: z.enum(['local', 'openai', 'anthropic']).optional(),
    model: z.string().max(200).optional(),
    streakGoalDays: z.number().int().min(1).max(90).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'Nothing to update.' });

/** PATCH /api/settings — update the signed-in user's preferences. */
export const PATCH = apiHandler({
  auth: true,
  body: bodySchema,
  handler: async ({ body, user }) => {
    const settings = await prisma.userSettings.upsert({
      where: { userId: user!.id },
      create: { userId: user!.id, ...body },
      update: body,
    });
    return { settings };
  },
});
