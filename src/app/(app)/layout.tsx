import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { currentStreak } from '@/lib/services/analytics';
import { AppShell } from '@/components/app-shell';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect('/signin');

  const logs = await prisma.reviewLog.findMany({
    where: { userId: user.id },
    select: { reviewedAt: true },
    orderBy: { reviewedAt: 'desc' },
    take: 1000,
  });
  const streak = currentStreak(logs.map((l) => l.reviewedAt));

  return <AppShell streak={streak}>{children}</AppShell>;
}
