import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  FileText,
  Sparkles,
  ListChecks,
  Circle,
  Quote,
} from 'lucide-react';
import { getSessionUser } from '@/lib/auth';
import { getCurriculumWithProgress } from '@/lib/services/curriculum';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MasteryRing } from '@/components/mastery-ring';
import { ApproveBar } from '@/components/curriculum/approve-bar';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function CurriculumPage({ params, searchParams }: { params: { id: string }; searchParams: { generated?: string } }) {
  const user = await getSessionUser();
  const tree = await getCurriculumWithProgress(user!.id, params.id);
  if (!tree) notFound();

  const isDraft = tree.status === 'draft';

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge tone={isDraft ? 'warning' : 'success'}>
              {isDraft ? 'Draft — review before studying' : 'Approved'}
            </Badge>
            <Badge tone="muted">
              <FileText className="h-3 w-3" /> {tree.document.title}
            </Badge>
            <Badge tone="muted">
              <Sparkles className="h-3 w-3" /> {tree.totals.flashcards} flashcards
            </Badge>
            <Badge tone="muted">{tree.totals.quizzes} questions</Badge>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{tree.title}</h1>
          {tree.description && (
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {tree.description}
            </p>
          )}
        </div>
        <div className="flex flex-col items-center gap-1">
          <MasteryRing value={tree.overallMastery} size={96} stroke={8} label="mastery" />
          <span className="text-[10px] text-muted-foreground">
            {tree.totals.lessonsCompleted}/{tree.totals.lessons} lessons done
          </span>
        </div>
      </div>

      {searchParams.generated && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-success/25 bg-success/8 px-4 py-3 text-sm animate-fade-in">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          <div>
            <p className="font-medium">Curriculum generated.</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Review the structure below, then approve it to start learning. You can edit module and lesson titles at any time.
            </p>
          </div>
        </div>
      )}

      <ApproveBar curriculumId={tree.id} status={tree.status} />

      {/* Modules */}
      <div className="mt-6 space-y-5">
        {tree.modules.map((m, mi) => (
          <ModuleSection key={m.id} module={m} index={mi} />
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 border-t border-border pt-5 text-xs text-muted-foreground">
        <p className="flex items-center gap-1.5">
          <Quote className="h-3.5 w-3.5" />
          Every lesson, question, and flashcard cites the exact passage it came from — hover
          <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 font-mono">
            § source
          </span>
          for a preview.
        </p>
      </div>
    </div>
  );
}

function ModuleSection({ module, index }: { module: any; index: number }) {
  const done = module.lessons.filter((l: any) => l.progress.completed).length;
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 font-mono text-xs font-semibold text-primary">
            {index + 1}
          </span>
          <h2 className="text-sm font-semibold tracking-tight">{module.title}</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-muted-foreground">
            {done}/{module.lessons.length} lessons
          </span>
          <Progress value={done / Math.max(1, module.lessons.length)} className="w-20" />
          <span className="w-10 text-right font-mono text-[11px] tabular-nums text-muted-foreground">
            {Math.round(module.mastery * 100)}%
          </span>
        </div>
      </div>

      <div className="space-y-2.5">
        {module.lessons.map((lesson: any) => {
          const q = lesson.quizzes.length;
          const k = lesson.concepts.length;
          const complete = lesson.progress.completed;
          return (
            <Link
              key={lesson.id}
              href={`/study/${lesson.id}`}
              className={cn(
                'group flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3.5 transition-all',
                'hover:border-primary/40 hover:shadow-card'
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border',
                  complete ? 'border-success/40 bg-success/10 text-success' : 'border-border text-muted-foreground/50'
                )}
              >
                {complete ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3 w-3" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium group-hover:text-primary">{lesson.title}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ListChecks className="h-3 w-3" /> {q} quiz{q === 1 ? '' : 'zes'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> {k} concept{k === 1 ? '' : 's'}
                  </span>
                  {lesson.sourceRef && (
                    <span className="flex items-center gap-1 font-mono">
                      <BookOpen className="h-3 w-3" /> {lesson.sourceRef}
                    </span>
                  )}
                  {lesson.progress.score > 0 && (
                    <span className="font-mono tabular-nums text-primary">
                      {Math.round(lesson.progress.score * 100)}% score
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
