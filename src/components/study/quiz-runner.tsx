'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  BookOpenCheck,
  Quote,
  Target,
  Lightbulb,
  ChevronDown,
  Sparkles,
  Play,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Markdown } from '@/components/ui/markdown';
import { Input, Textarea } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { answerQuiz, completeLesson } from '@/lib/api/study';

interface QuizDTO {
  id: string;
  type: 'mcq' | 'fill-blank' | 'short-answer';
  question: string;
  options: string[] | null;
  answer: string;
  explanation: string;
  sourceRef: string;
  sourceText: string;
}

interface Feedback {
  correct: boolean;
  explanation: string;
  sourceRef: string;
  sourceText: string;
}

type Stage = 'lesson' | 'quiz' | 'results';

export function QuizRunner({
  lessonId,
  lessonTitle,
  moduleTitle,
  curriculumId,
  quizzes,
  objectives,
  content,
  concepts,
  progress,
  nextLessonId,
  prevLessonId,
  curriculumStatus,
}: {
  lessonId: string;
  lessonTitle: string;
  moduleTitle: string;
  curriculumId: string;
  quizzes: QuizDTO[];
  objectives: string[];
  content: string;
  concepts: { name: string; definition: string; sourceRef: string }[];
  progress: { completed: boolean; score: number; attempts: number } | null;
  nextLessonId: string | null;
  prevLessonId: string | null;
  curriculumStatus: string;
}) {
  const router = useRouter();
  const [stage, setStage] = React.useState<Stage>('lesson');
  const [qIndex, setQIndex] = React.useState(0);
  const [answer, setAnswer] = React.useState('');
  const [selected, setSelected] = React.useState<number | null>(null);
  const [feedback, setFeedback] = React.useState<Feedback | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [results, setResults] = React.useState<{ correct: boolean; question: string; answer: string }[]>([]);
  const [marked, setMarked] = React.useState(false);
  const [showConcepts, setShowConcepts] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const q = quizzes[qIndex];
  const isLast = qIndex === quizzes.length - 1;

  const submit = React.useCallback(async () => {
    if (!q) return;
    const given = q.type === 'mcq' ? q.options?.[selected ?? -1] ?? '' : answer.trim();
    if (!given) return;
    setSubmitting(true);
    try {
      const data = await answerQuiz(q.id, given);
      setFeedback({
        correct: data.result.correct,
        explanation: data.result.explanation,
        sourceRef: data.result.sourceRef,
        sourceText: data.result.sourceText,
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }, [q, selected, answer]);

  // Keyboard shortcuts for the quiz.
  React.useEffect(() => {
    if (stage !== 'quiz' || !q || feedback) return;
    const onKey = (e: KeyboardEvent) => {
      if (q.type === 'mcq' && q.options) {
        const n = Number(e.key);
        if (n >= 1 && n <= q.options.length) {
          e.preventDefault();
          setSelected(n - 1);
        }
      }
      if (e.key === 'Enter' && selected !== null) {
        e.preventDefault();
        submit();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stage, q, feedback, selected, answer, submit]);

  const next = async () => {
    if (!q) return;
    if (feedback) {
      setResults((r) => [...r, { correct: feedback.correct, question: q.question, answer: q.answer }]);
    }
    setFeedback(null);
    setSelected(null);
    setAnswer('');
    if (isLast) {
      setStage('results');
      // Mark complete server-side happens implicitly via answers; reflect locally.
    } else {
      setQIndex((i) => i + 1);
    }
  };

  const markComplete = async () => {
    setMarked(true);
    await completeLesson(lessonId).catch(() => undefined);
    router.refresh();
  };

  const correctCount = results.filter((r) => r.correct).length;

  // ── Lesson stage ──────────────────────────────────────────────────────────
  if (stage === 'lesson') {
    return (
      <div className="space-y-6 animate-slide-up">
        {curriculumStatus !== 'approved' && (
          <div className="rounded-xl border border-warning/30 bg-warning/8 px-4 py-3 text-xs text-foreground/80">
            <p className="flex items-center gap-2">
              <Target className="h-3.5 w-3.5 text-accent" />
              This curriculum is a draft. You can preview lessons now — approve it on the curriculum page to unlock flashcards and full SRS reviews.
            </p>
          </div>
        )}

        {/* Objectives */}
        {objectives.length > 0 && (
          <div className="surface-card p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight">
              <Target className="h-4 w-4 text-primary" /> Learning objectives
            </h2>
            <ul className="space-y-2">
              {objectives.map((o, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                  {o}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Content */}
        <div className="surface-card p-6">
          <Markdown content={content} />
          <div className="mt-5 flex items-center gap-2 border-t border-border pt-4 text-[11px] text-muted-foreground">
            <Quote className="h-3.5 w-3.5" />
            Content synthesized from the source
            {quizzes[0]?.sourceRef && <span className="font-mono">{quizzes[0].sourceRef}</span>}
            — answers below cite their exact passage.
          </div>
        </div>

        {/* Concepts */}
        {concepts.length > 0 && (
          <div className="surface-card p-5">
            <button
              onClick={() => setShowConcepts((s) => !s)}
              className="flex w-full items-center justify-between text-sm font-semibold tracking-tight"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Key concepts ({concepts.length})
              </span>
              <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', showConcepts && 'rotate-180')} />
            </button>
            {showConcepts && (
              <dl className="mt-4 space-y-3 animate-fade-in">
                {concepts.map((c) => (
                  <div key={c.name} className="rounded-lg border border-border bg-card-2/50 p-3">
                    <dt className="text-sm font-semibold">{c.name}</dt>
                    <dd className="mt-1 text-xs leading-relaxed text-muted-foreground">{c.definition}</dd>
                    {c.sourceRef && <dd className="mt-1 font-mono text-[10px] text-muted-foreground/70">§ {c.sourceRef}</dd>}
                  </div>
                ))}
              </dl>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/25 bg-primary/5 px-5 py-4">
          <div>
            <p className="text-sm font-semibold">Active recall check</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {quizzes.length} questions · instant feedback · source traceable
              {progress?.attempts ? ` · previously scored ${Math.round(progress.score * 100)}%` : ''}
            </p>
          </div>
          <Button onClick={() => setStage('quiz')} size="lg">
            <Play className="h-4 w-4" /> Start quiz
          </Button>
        </div>

        <div className="flex items-center justify-between text-xs">
          {prevLessonId ? (
            <Link href={`/study/${prevLessonId}`} className="link-quiet flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Previous lesson
            </Link>
          ) : (
            <span />
          )}
          <Link href={`/curricula/${curriculumId}`} className="link-quiet">
            Back to curriculum
          </Link>
        </div>
      </div>
    );
  }

  // ── Results stage ──────────────────────────────────────────────────────────
  if (stage === 'results') {
    const pct = quizzes.length ? correctCount / quizzes.length : 0;
    return (
      <div className="space-y-6 animate-slide-up">
        <div className="surface-card p-8 text-center">
          <div
            className={cn(
              'mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full',
              pct >= 0.7 ? 'bg-success/10 text-success' : pct >= 0.4 ? 'bg-accent/10 text-accent' : 'bg-danger/10 text-danger'
            )}
          >
            {pct >= 0.7 ? <CheckCircle2 className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
          </div>
          <h2 className="text-xl font-semibold tracking-tight">
            {pct >= 0.7 ? 'Nice recall!' : pct >= 0.4 ? 'Getting there' : 'Worth another pass'}
          </h2>
          <p className="mt-1.5 font-mono text-3xl font-semibold tabular-nums">
            {correctCount}<span className="text-muted-foreground">/{quizzes.length}</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {pct >= 0.7
              ? 'Strong retrieval. The spaced-repetition system will schedule these concepts for review.'
              : 'Incorrect answers are flagged for review — that is exactly how memory strengthens.'}
          </p>

          <div className="mx-auto mt-6 flex max-w-sm flex-wrap items-center justify-center gap-2">
            <Button
              onClick={async () => {
                await markComplete();
                if (nextLessonId) router.push(`/study/${nextLessonId}`);
              }}
              size="lg"
            >
              {marked ? 'Marked complete ✓' : 'Complete lesson'}
              {nextLessonId && <ArrowRight className="h-4 w-4" />}
            </Button>
            {!nextLessonId && (
              <Link href={`/curricula/${curriculumId}`}>
                <Button variant="secondary" size="lg">
                  Back to curriculum
                </Button>
              </Link>
            )}
          </div>
          {nextLessonId && (
            <p className="mt-2 text-xs text-muted-foreground">
              Next up: continue to the next lesson in {moduleTitle}
            </p>
          )}
        </div>

        <div className="surface-card p-5">
          <h3 className="mb-3 text-sm font-semibold tracking-tight">Question breakdown</h3>
          <ul className="space-y-2">
            {results.map((r, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                {r.correct ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                )}
                <div className="min-w-0">
                  <p className="text-muted-foreground line-clamp-1">{r.question}</p>
                  <p className="text-xs text-muted-foreground/80">
                    {r.correct ? 'Correct' : <>Answer: <span className="text-foreground">{r.answer}</span></>}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // ── Quiz stage ─────────────────────────────────────────────────────────────
  if (!q) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-5 animate-fade-in">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <Progress value={(qIndex + (feedback ? 1 : 0)) / quizzes.length} className="flex-1" />
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {qIndex + 1}/{quizzes.length}
        </span>
      </div>

      <div key={q.id} className="surface-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <Badge tone="primary">
            {q.type === 'mcq' ? 'Multiple choice' : q.type === 'fill-blank' ? 'Fill in the blank' : 'Short answer'}
          </Badge>
          {!feedback && q.type === 'mcq' && (
            <span className="text-[10px] text-muted-foreground">press 1–4 to select · Enter to submit</span>
          )}
        </div>

        <p className="text-base font-medium leading-relaxed">{q.question}</p>

        {error && (
          <div className="mt-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
            {error}
          </div>
        )}

        {!feedback ? (
          <div className="mt-5 space-y-2">
            {q.type === 'mcq' && q.options ? (
              q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all focus-ring',
                    selected === i
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-card-2/40 hover:border-primary/40 hover:bg-card-2'
                  )}
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-border font-mono text-[10px] text-muted-foreground">
                    {i + 1}
                  </span>
                  {opt}
                </button>
              ))
            ) : q.type === 'fill-blank' ? (
              <Input
                autoFocus
                placeholder="Type your answer…"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                className="h-11"
              />
            ) : (
              <Textarea
                autoFocus
                rows={3}
                placeholder="Answer in your own words…"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
            )}

            <div className="flex justify-end pt-2">
              <Button onClick={submit} loading={submitting} disabled={q.type === 'mcq' ? selected === null : !answer.trim()}>
                Check answer
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-4 animate-fade-in">
            {/* Feedback */}
            <div
              className={cn(
                'flex items-start gap-3 rounded-lg border px-4 py-3',
                feedback.correct ? 'border-success/30 bg-success/8' : 'border-danger/30 bg-danger/8'
              )}
            >
              {feedback.correct ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
              )}
              <div>
                <p className="text-sm font-semibold">{feedback.correct ? 'Correct' : 'Not quite'}</p>
                {!feedback.correct && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Expected: <span className="text-foreground">{q.answer}</span>
                  </p>
                )}
                {feedback.explanation && (
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{feedback.explanation}</p>
                )}
              </div>
            </div>

            {/* Source panel — traceability */}
            <div className="rounded-lg border border-border bg-card-2/50 p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                  <BookOpenCheck className="h-3.5 w-3.5 text-primary" />
                  View in source
                  {feedback.sourceRef && <span className="font-mono">{feedback.sourceRef}</span>}
                </span>
                <Lightbulb className="h-3.5 w-3.5 text-accent" />
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                “{feedback.sourceText || 'Source passage unavailable.'}”
              </p>
            </div>

            <div className="flex justify-end">
              <Button onClick={next} size="lg">
                {isLast ? 'See results' : 'Next question'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-[11px] text-muted-foreground">
        {lessonTitle} · {moduleTitle}
      </p>
    </div>
  );
}
