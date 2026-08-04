import Link from 'next/link';
import {
  BookOpen,
  Flame,
  Upload,
  Clock,
  Layers,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Play,
} from 'lucide-react';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getDashboard } from '@/lib/services/analytics';
import { MasteryRing } from '@/components/mastery-ring';
import { ReviewChart } from '@/components/review-chart';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { EmptyState } from '@/components/ui/empty-state';
import { formatRelative } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getSessionUser();
  const data = await getDashboard(user!.id);

  // Next thing to study: first incomplete lesson across curricula.
  const nextLesson = await prisma.lesson.findFirst({
    where: {
      module: { curriculum: { userId: user!.id, status: 'approved' } },
      progress: { none: { userId: user!.id, completed: true } },
    },
    orderBy: [{ module: { order: 'asc' } }, { order: 'asc' }],
    include: { module: { include: { curriculum: true } } },
  });

  const hasCurricula = data.curricula.length > 0;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Good {greeting()}, {user?.name?.split(' ')[0] ?? 'learner'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasCurricula
              ? nextLesson
                ? 'Pick up where you left off — your next lesson is ready.'
                : 'You are all caught up. Time to review or add something new.'
              : 'Upload a document to start your first learning path.'}
          </p>
        </div>
        {hasCurricula && nextLesson ? (
          <Link href={`/study/${nextLesson.id}`}>
            <Button size="lg">
              <Play className="h-4 w-4" />
              Continue learning
            </Button>
          </Link>
        ) : (
          <Link href="/upload">
            <Button size="lg">
              <Upload className="h-4 w-4" />
              Upload a document
            </Button>
          </Link>
        )}
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-center justify-between">
          <div>
            <CardTitle className="text-muted-foreground">Overall mastery</CardTitle>
            <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">
              {data.overallMastery != null ? `${Math.round(data.overallMastery * 100)}%` : '—'}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">across {data.curricula.length} curriculum{data.curricula.length === 1 ? '' : 's'}</p>
          </div>
          <MasteryRing value={data.overallMastery ?? 0} size={64} stroke={6} />
        </Card>

        <Card>
          <CardTitle className="text-muted-foreground">Study streak</CardTitle>
          <p className="mt-1 flex items-center gap-2 font-mono text-2xl font-semibold tabular-nums">
            <Flame className="h-5 w-5 text-accent" />
            {data.streak.current} day{data.streak.current === 1 ? '' : 's'}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            best {data.streak.best} · ~{data.minutesStudied} min studied
          </p>
        </Card>

        <Card>
          <CardTitle className="text-muted-foreground">Reviews due</CardTitle>
          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">{data.stats.cardsDue}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            of {data.stats.cardsTotal} flashcards ·{' '}
            <Link href="/flashcards" className="text-primary hover:underline">
              review now
            </Link>
          </p>
        </Card>

        <Card>
          <CardTitle className="text-muted-foreground">Lessons completed</CardTitle>
          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">
            {data.stats.lessonsCompleted}
            <span className="text-sm text-muted-foreground">/{data.stats.lessonsTotal}</span>
          </p>
          <Progress value={data.stats.lessonsTotal ? data.stats.lessonsCompleted / data.stats.lessonsTotal : 0} className="mt-2.5" />
        </Card>
      </div>

      {/* Upcoming reviews + weak areas */}
      <div className="mb-6 grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Upcoming reviews</CardTitle>
            <Link href="/flashcards" className="link-quiet text-xs font-medium">
              Review mode →
            </Link>
          </CardHeader>
          <ReviewChart data={data.dueByDay} className="h-28 px-1 pt-2" />
          <p className="mt-3 text-xs text-muted-foreground">
            SM-2 spacing schedules each card just before you would forget it.
          </p>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-accent" />
              Weak areas
            </CardTitle>
          </CardHeader>
          {data.weakAreas.length === 0 ? (
            <p className="py-4 text-xs text-muted-foreground">
              No modules yet — upload a document to build your first curriculum.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {data.weakAreas.slice(0, 4).map((w) => (
                <li key={w.moduleId}>
                  <Link href={`/curricula/${w.curriculumId}`} className="group block rounded-lg border border-border p-2.5 transition-colors hover:border-primary/40">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-medium">{w.moduleTitle}</span>
                      <span className="font-mono text-xs tabular-nums text-muted-foreground">
                        {Math.round(w.mastery * 100)}%
                      </span>
                    </div>
                    <Progress
                      value={w.mastery}
                      tone={w.mastery < 0.3 ? 'warning' : undefined}
                      className="mt-2"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Curricula */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight">Your curriculums</h2>
        <Link href="/upload" className="link-quiet text-xs font-medium">
          + New
        </Link>
      </div>

      {!hasCurricula ? (
        <EmptyState
          icon={<Upload className="h-5 w-5" />}
          title="Start with a document"
          description="Drop in a PDF, Word file, text, or web article. Lumora parses it, builds a structured curriculum with quizzes and flashcards, and starts scheduling your reviews."
          action={
            <Link href="/upload">
              <Button>
                <Upload className="h-4 w-4" />
                Upload your first document
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.curricula.map((c) => (
            <Link key={c.id} href={`/curricula/${c.id}`} className="group">
              <Card className="transition-all hover:border-primary/40 hover:shadow-glow">
                <CardHeader>
                  <div>
                    <CardTitle className="group-hover:text-primary">{c.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1.5">
                      <BookOpen className="h-3 w-3" />
                      {c.documentTitle}
                    </CardDescription>
                  </div>
                  <Badge tone={c.status === 'approved' ? 'success' : 'warning'}>
                    {c.status === 'approved' ? 'Learning' : 'Draft'}
                  </Badge>
                </CardHeader>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{c.moduleCount} modules · {c.lessonsCompleted}/{c.lessonsTotal} lessons</span>
                  <span className="font-mono tabular-nums">{Math.round(c.mastery * 100)}% mastered</span>
                </div>
                <Progress
                  value={c.mastery}
                  className="mt-3"
                  tone={c.mastery >= 0.85 ? 'success' : undefined}
                />
                <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    updated {formatRelative(c.updatedAt)}
                  </span>
                  {c.dueCards > 0 && (
                    <span className="flex items-center gap-1 font-medium text-primary">
                      <Sparkles className="h-3 w-3" /> {c.dueCards} review{c.dueCards === 1 ? '' : 's'} due
                    </span>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Recent activity */}
      {data.recentActivity.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold tracking-tight">Recent activity</h2>
          <Card>
            <ul className="divide-y divide-border">
              {data.recentActivity.map((a) => (
                <li key={a.id} className="flex items-center gap-3 py-2.5 text-sm">
                  {a.kind === 'flashcard' ? (
                    <Sparkles className="h-4 w-4 shrink-0 text-primary" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                  )}
                  <span className="min-w-0 flex-1 truncate">{a.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatRelative(a.at)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {/* Meta row */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5" />
          {data.stats.documents} document{data.stats.documents === 1 ? '' : 's'} · {data.stats.quizzesAnswered} quiz answers logged
        </span>
        <span>
          Press <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono">⌥</kbd> +{' '}
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono">d</kbd> for dashboard,
          <kbd className="ml-1 rounded border border-border bg-muted px-1.5 py-0.5 font-mono">u</kbd> upload,
          <kbd className="ml-1 rounded border border-border bg-muted px-1.5 py-0.5 font-mono">f</kbd> flashcards,
          <kbd className="ml-1 rounded border border-border bg-muted px-1.5 py-0.5 font-mono">m</kbd> mastery
        </span>
      </div>
    </div>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Night owl';
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}
