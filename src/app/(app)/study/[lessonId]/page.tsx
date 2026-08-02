import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Badge } from '@/components/ui/badge';
import { QuizRunner } from '@/components/study/quiz-runner';

export const dynamic = 'force-dynamic';

export default async function StudyPage({ params }: { params: { lessonId: string } }) {
  const user = await getSessionUser();
  if (!user) redirect('/signin');

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.lessonId },
    include: {
      module: {
        include: {
          curriculum: { select: { id: true, title: true, status: true } },
          lessons: { orderBy: { order: 'asc' }, select: { id: true, title: true, order: true } },
        },
      },
      concepts: { orderBy: { name: 'asc' } },
      quizzes: { include: { sourceChunk: { select: { text: true } } } },
    },
  });
  if (!lesson) notFound();

  const progress = await prisma.userProgress.findUnique({
    where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } },
  });

  const siblings = lesson.module.lessons;
  const idx = siblings.findIndex((l) => l.id === lesson.id);
  const nextLesson = siblings[idx + 1] ?? null;
  const prevLesson = siblings[idx - 1] ?? null;

  const objectives = safeParse(lesson.objectives) as string[] | null;
  const quizzes = lesson.quizzes.map((q) => ({
    id: q.id,
    type: q.type as 'mcq' | 'fill-blank' | 'short-answer',
    question: q.question,
    options: safeParse(q.options) as string[] | null,
    answer: q.answer,
    explanation: q.explanation ?? '',
    sourceRef: q.sourceRef ?? '',
    sourceText: q.sourceChunk?.text ?? '',
  }));

  return (
    <div className="animate-fade-in">
      {/* Breadcrumbs */}
      <div className="mb-5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <Link href={`/curricula/${lesson.module.curriculum.id}`} className="link-quiet">
          {lesson.module.curriculum.title}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-medium text-foreground">{lesson.module.title}</span>
      </div>

      <div className="mx-auto max-w-3xl">
        {/* Lesson header */}
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <Badge tone={lesson.module.curriculum.status === 'approved' ? 'success' : 'warning'}>
              Lesson {lesson.order + 1} of {siblings.length}
            </Badge>
            {lesson.sourceRef && <Badge tone="muted">{lesson.sourceRef}</Badge>}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{lesson.title}</h1>
        </div>

        <QuizRunner
          lessonId={lesson.id}
          lessonTitle={lesson.title}
          moduleTitle={lesson.module.title}
          curriculumId={lesson.module.curriculum.id}
          quizzes={quizzes}
          objectives={objectives ?? []}
          content={lesson.content}
          concepts={lesson.concepts.map((c) => ({ name: c.name, definition: c.definition, sourceRef: c.sourceRef ?? '' }))}
          progress={progress ? { completed: progress.completed, score: progress.score, attempts: progress.attempts } : null}
          nextLessonId={nextLesson?.id ?? null}
          prevLessonId={prevLesson?.id ?? null}
          curriculumStatus={lesson.module.curriculum.status}
        />
      </div>
    </div>
  );
}

function safeParse(s: string | null): unknown {
  if (!s) return null;
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
