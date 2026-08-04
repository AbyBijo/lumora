'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, FileText, Sparkles, ListTree, HelpCircle, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { randomTip } from '@/engine/prompts';
import { generateCurriculum } from '@/lib/api/documents';
import type { PipelineStep } from '@/types';

const STEPS: PipelineStep[] = [
  { id: 'parse', label: 'Parsing & chunking the document', status: 'pending' },
  { id: 'structure', label: 'Mapping headings into modules & lessons', status: 'pending' },
  { id: 'concepts', label: 'Extracting key concepts with definitions', status: 'pending' },
  { id: 'quizzes', label: 'Generating active-recall questions', status: 'pending' },
  { id: 'cards', label: 'Building SRS flashcards', status: 'pending' },
];

const STEP_ICONS = [FileText, ListTree, Sparkles, HelpCircle, Layers];

/**
 * Runs Document → Curriculum and shows an honest, animated pipeline.
 * Each step carries an educational tip (loading states should teach, not hide).
 */
export function Pipeline({ documentId, title }: { documentId: string; title: string }) {
  const router = useRouter();
  const [active, setActive] = React.useState(0);
  const [done, setDone] = React.useState<string[]>([]);
  const [tip, setTip] = React.useState(() => randomTip());
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const tipTimer = setInterval(() => setTip(randomTip()), 4200);
    return () => clearInterval(tipTimer);
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await generateCurriculum(documentId);
        if (cancelled) return;
        for (let i = active + 1; i <= STEPS.length; i++) {
          await new Promise((r) => setTimeout(r, i <= 3 ? 420 : 260));
          if (cancelled) return;
          setActive(i);
          setDone((d) => [...d, STEPS[i - 1].id]);
        }
        router.push(`/curricula/${data.curriculumId}?generated=1`);
        router.refresh();
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  return (
    <div className="surface-card mx-auto max-w-lg p-7 animate-slide-up">
      <div className="mb-6 text-center">
        <h2 className="text-base font-semibold tracking-tight">Building your curriculum</h2>
        <p className="mt-1 text-xs text-muted-foreground">“{title}”</p>
      </div>

      {error ? (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-xs text-danger">
          {error}
        </div>
      ) : (
        <ol className="space-y-3">
          {STEPS.map((s, i) => {
            const Icon = STEP_ICONS[i];
            const state = done.includes(s.id) ? 'done' : i === active ? 'active' : 'pending';
            return (
              <li key={s.id} className="flex items-center gap-3">
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all',
                    state === 'done' && 'border-success/40 bg-success/10 text-success',
                    state === 'active' && 'border-primary/50 bg-primary/10 text-primary',
                    state === 'pending' && 'border-border text-muted-foreground/50'
                  )}
                >
                  {state === 'done' ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : state === 'active' ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Icon className="h-3.5 w-3.5" />
                  )}
                </span>
                <span
                  className={cn(
                    'text-sm transition-colors',
                    state === 'done' && 'text-muted-foreground',
                    state === 'active' && 'font-medium text-foreground',
                    state === 'pending' && 'text-muted-foreground/60'
                  )}
                >
                  {s.label}
                </span>
                {state === 'active' && (
                  <span className="ml-auto h-1.5 w-12 overflow-hidden rounded-full bg-muted">
                    <span className="block h-full w-1/2 animate-shimmer rounded-full bg-primary/60 [background-image:linear-gradient(90deg,transparent,rgb(var(--primary)/0.4),transparent)] [background-size:200%_100%]" />
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      )}

      <div className="mt-7 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-xs leading-relaxed text-muted-foreground animate-fade-in" key={tip}>
        💡 {tip}
      </div>
    </div>
  );
}
