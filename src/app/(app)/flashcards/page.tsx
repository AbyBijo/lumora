import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Sparkles, Flame } from 'lucide-react';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { DeckLauncher } from '@/components/flashcards/deck-launcher';
import { formatRelative } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function FlashcardsPage({ searchParams }: { searchParams: { curriculumId?: string; mode?: string } }) {
  const user = await getSessionUser();
  if (!user) redirect('/signin');

  const curricula = await prisma.curriculum.findMany({
    where: { userId: user.id, status: 'approved' },
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: { select: { flashcards: true } },
    },
  });

  const dueByCurriculum = await prisma.flashcard.groupBy({
    by: ['curriculumId'],
    where: { userId: user.id, dueDate: { lte: new Date() } },
    _count: true,
  });
  const dueMap = new Map(dueByCurriculum.map((d) => [d.curriculumId, d._count]));
  const totalDue = dueByCurriculum.reduce((s, d) => s + d._count, 0);

  // Direct launch when a curriculum is specified.
  if (searchParams.curriculumId) {
    const target = curricula.find((c) => c.id === searchParams.curriculumId);
    if (target) {
      return (
        <div className="animate-fade-in">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">Flashcard review</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              <Link href="/flashcards" className="link-quiet underline-offset-2 hover:underline">All decks</Link>
              {' · '}{target.title}
            </p>
          </div>
          <DeckLauncher
            curriculumId={target.id}
            curriculumTitle={target.title}
            initialMode={searchParams.mode === 'cram' ? 'cram' : 'review'}
          />
        </div>
      );
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight">Flashcards</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Spaced repetition with SM-2 scheduling — review what you are about to forget, exactly on time.
        </p>
      </div>

      {curricula.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="h-5 w-5" />}
          title="No approved curriculums yet"
          description="Approve a curriculum to unlock its flashcard deck. Upload a document, generate, and approve to begin."
          action={
            <Link href="/upload">
              <Button>Upload a document</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {curricula.map((c) => {
            const due = dueMap.get(c.id) ?? 0;
            return (
              <Card key={c.id} className="flex flex-col">
                <CardHeader>
                  <div>
                    <CardTitle>{c.title}</CardTitle>
                    <CardDescription>{c._count.flashcards} cards</CardDescription>
                  </div>
                  <Badge tone={due > 0 ? 'warning' : 'success'}>
                    {due > 0 ? `${due} due` : 'caught up'}
                  </Badge>
                </CardHeader>
                <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Flame className="h-3.5 w-3.5 text-accent" />
                    last updated {formatRelative(c.updatedAt)}
                  </span>
                  <DeckLauncher
                    curriculumId={c.id}
                    curriculumTitle={c.title}
                    initialMode="review"
                    buttonLabel={due > 0 ? `Review ${due}` : 'Review'}
                    buttonVariant={due > 0 ? 'primary' : 'secondary'}
                    compact
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {totalDue > 0 && (
        <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 px-5 py-4 text-sm">
          <p className="font-medium">💡 {totalDue} card{totalDue === 1 ? '' : 's'} due today</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Short, frequent reviews beat long cramming sessions. Even 2 minutes keeps the streak alive.
          </p>
        </div>
      )}
    </div>
  );
}
