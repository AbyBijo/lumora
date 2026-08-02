import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AlertTriangle, CheckCircle2, Layers, Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MasteryRing } from '@/components/mastery-ring';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { dayKey, addDays, startOfDay } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function MasteryPage() {
  const user = await getSessionUser();
  if (!user) redirect('/signin');

  const curricula = await prisma.curriculum.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      modules: { orderBy: { order: 'asc' } },
      _count: { select: { flashcards: true } },
    },
  });

  // 14-day activity (review logs + lesson activity).
  const since = addDays(new Date(), -13);
  const [reviewLogs, progressRows] = await Promise.all([
    prisma.reviewLog.findMany({ where: { userId: user.id, reviewedAt: { gte: since } }, select: { reviewedAt: true } }),
    prisma.userProgress.findMany({ where: { userId: user.id, lastStudied: { gte: since } }, select: { lastStudied: true } }),
  ]);
  const activity = new Map<string, number>();
  for (let i = 0; i < 14; i++) {
    const d = addDays(startOfDay(), -13 + i);
    activity.set(dayKey(d), 0);
  }
  for (const r of reviewLogs) {
    const k = dayKey(r.reviewedAt);
    if (activity.has(k)) activity.set(k, activity.get(k)! + 1);
  }
  for (const p of progressRows) {
    if (!p.lastStudied) continue;
    const k = dayKey(p.lastStudied);
    if (activity.has(k)) activity.set(k, activity.get(k)! + 1);
  }
  const activityData = Array.from(activity.entries()).map(([date, count]) => ({ date, count }));
  const maxActivity = Math.max(1, ...activityData.map((a) => a.count));

  const overall =
    curricula.length > 0
      ? curricula.reduce((s, c) => s + c.masteryScore, 0) / curricula.length
      : 0;

  const weakModules = curricula
    .flatMap((c) =>
      c.modules.map((m) => ({ ...m, moduleTitle: m.title, curriculumId: c.id, curriculumTitle: c.title }))
    )
    .filter((m) => m.masteryScore < 0.6)
    .sort((a, b) => a.masteryScore - b.masteryScore);

  if (curricula.length === 0) {
    return (
      <div className="animate-fade-in">
        <h1 className="mb-7 text-2xl font-semibold tracking-tight">Mastery</h1>
        <EmptyState
          icon={<Layers className="h-5 w-5" />}
          title="No mastery data yet"
          description="Mastery is built from your quiz answers and flashcard reviews. Upload a document and start studying to see your retention analytics here."
          action={
            <Link href="/upload">
              <Button>Upload a document</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight">Mastery</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Retention is the metric that matters. Lumora measures it per concept, module, and curriculum.
        </p>
      </div>

      {/* Overview */}
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Card className="flex flex-col items-center justify-center py-6">
          <MasteryRing value={overall} size={150} stroke={12} label="overall" />
          <p className="mt-3 text-xs text-muted-foreground">across {curricula.length} curriculum{curricula.length === 1 ? '' : 's'}</p>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-success" /> Last 14 days
            </CardTitle>
            <CardDescription>Reviews and lessons per day</CardDescription>
          </CardHeader>
          <div className="flex h-28 items-end gap-1.5">
            {activityData.map((a) => {
              const h = Math.max(4, Math.round((a.count / maxActivity) * 96));
              const isToday = a.date === dayKey(new Date());
              return (
                <div key={a.date} className="group flex flex-1 flex-col items-center gap-1" title={`${a.date}: ${a.count}`}>
                  <div
                    className={cn('w-full rounded-sm transition-all', isToday ? 'bg-primary' : a.count > 0 ? 'bg-primary/35' : 'bg-muted')}
                    style={{ height: h }}
                  />
                  <span className="text-[8px] text-muted-foreground/60">
                    {new Date(a.date + 'T00:00:00').toLocaleDateString('en-US', { day: 'numeric' })}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Per-curriculum modules */}
      <div className="space-y-6">
        {curricula.map((c) => (
          <section key={c.id}>
            <div className="mb-3 flex items-center justify-between">
              <Link href={`/curricula/${c.id}`} className="text-sm font-semibold tracking-tight hover:text-primary">
                {c.title}
              </Link>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {Math.round(c.masteryScore * 100)}% overall
              </span>
            </div>
            <div className="space-y-2.5">
              {c.modules.map((m) => (
                <Link
                  key={m.id}
                  href={`/curricula/${c.id}`}
                  className="group block rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-medium">{m.title}</span>
                    <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                      {Math.round(m.masteryScore * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={m.masteryScore}
                    className="mt-2.5"
                    tone={m.masteryScore >= 0.85 ? 'success' : m.masteryScore >= 0.4 ? undefined : 'warning'}
                  />
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Weak areas */}
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-accent" /> Weak areas
            </CardTitle>
            <CardDescription>Modules below 60% — “Cram mode” targets these</CardDescription>
          </CardHeader>
          {weakModules.length === 0 ? (
            <p className="py-3 text-xs text-muted-foreground">Nothing below 60% — impressive retention.</p>
          ) : (
            <ul className="space-y-2">
              {weakModules.slice(0, 6).map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate">
                    <span className="font-medium">{m.moduleTitle}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{m.curriculumTitle}</span>
                  </span>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {Math.round(m.masteryScore * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Study habits
            </CardTitle>
          </CardHeader>
          <ul className="space-y-2.5 text-sm">
            {[
              { label: 'Documents ingested', value: curricula.length },
              { label: 'Modules', value: curricula.reduce((s, c) => s + c.modules.length, 0) },
              { label: 'Flashcards', value: curricula.reduce((s, c) => s + c._count.flashcards, 0) },
              { label: 'Reviews logged', value: reviewLogs.length + progressRows.length },
            ].map((r) => (
              <li key={r.label} className="flex items-center justify-between">
                <span className="text-muted-foreground">{r.label}</span>
                <span className="font-mono tabular-nums">{r.value}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Tip: review weak modules with flashcards in Cram mode, then retake their quizzes.
          </p>
        </Card>
      </div>
    </div>
  );
}
