'use client';

import * as React from 'react';
import {
  ArrowLeft,
  BookOpenCheck,
  Check,
  ChevronDown,
  Flame,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SRS_RATINGS, type SrsRating } from '@/lib/srs';
import { getDueCards, reviewCard } from '@/lib/api/flashcards';

interface CardDTO {
  id: string;
  front: string;
  back: string;
  sourceRef: string | null;
  sourceText: string;
  interval: number;
  dueDate: string;
}

const RATING_STYLES: Record<SrsRating, { border: string; bg: string; label: string }> = {
  again: { border: 'border-danger/40 hover:border-danger hover:bg-danger/10', bg: 'bg-danger/10 text-danger', label: 'Again' },
  hard: { border: 'border-accent/40 hover:border-accent hover:bg-accent/10', bg: 'bg-accent/10 text-accent', label: 'Hard' },
  good: { border: 'border-primary/40 hover:border-primary hover:bg-primary/10', bg: 'bg-primary/10 text-primary', label: 'Good' },
  easy: { border: 'border-success/40 hover:border-success hover:bg-success/10', bg: 'bg-success/10 text-success', label: 'Easy' },
};

export function Deck({
  curriculumId,
  curriculumTitle,
  mode,
  onExit,
}: {
  curriculumId: string;
  curriculumTitle: string;
  mode: 'review' | 'cram';
  onExit: () => void;
}) {
  const [cards, setCards] = React.useState<CardDTO[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [index, setIndex] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const [showSource, setShowSource] = React.useState(false);
  const [rated, setRated] = React.useState<SrsRating | null>(null);
  const [session, setSession] = React.useState<{ total: number; again: number; good: number; done: boolean }>({
    total: 0,
    again: 0,
    good: 0,
    done: false,
  });

  React.useEffect(() => {
    (async () => {
      try {
        const data = await getDueCards({ curriculumId, mode, limit: 60 });
        setCards(data.cards);
        setSession((s) => ({ ...s, total: data.total }));
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [curriculumId, mode]);

  // Keyboard: space flips, 1–4 rates.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (loading || cards.length === 0 || session.done) return;
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        if (!flipped) setFlipped(true);
      }
      if (flipped && !rated) {
        const n = Number(e.key);
        if (n >= 1 && n <= 4) rate(SRS_RATINGS[n - 1].value);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, cards, flipped, rated, session.done]);

  const rate = async (r: SrsRating) => {
    if (rated) return;
    setRated(r);
    const card = cards[index];
    await reviewCard(card.id, r).catch(() => undefined);
    setSession((s) => ({
      ...s,
      again: s.again + (r === 'again' ? 1 : 0),
      good: s.good + (r !== 'again' ? 1 : 0),
    }));
    setTimeout(() => {
      if (index + 1 >= cards.length) {
        setSession((s) => ({ ...s, done: true }));
      } else {
        setIndex((i) => i + 1);
        setFlipped(false);
        setRated(null);
        setShowSource(false);
      }
    }, 550);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center text-sm text-muted-foreground">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        Loading your review queue…
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-danger/30 bg-danger/10 px-5 py-8 text-center text-sm text-danger">
        {error}
      </div>
    );
  }

  // Session summary
  if (session.done) {
    const pct = session.total ? session.good / session.total : 0;
    return (
      <div className="mx-auto max-w-xl animate-slide-up">
        <div className="surface-card p-8 text-center">
          <div
            className={cn(
              'mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full',
              pct >= 0.8 ? 'bg-success/10 text-success' : pct >= 0.5 ? 'bg-accent/10 text-accent' : 'bg-danger/10 text-danger'
            )}
          >
            <Check className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight">Session complete</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {cards.length} card{cards.length === 1 ? '' : 's'} reviewed · {session.again} marked “again”
          </p>
          <div className="mx-auto mt-5 max-w-xs">
            <Progress value={pct} tone={pct >= 0.8 ? 'success' : undefined} />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {session.again === 0
              ? 'Flawless. Intervals grow automatically — next reviews land days from now.'
              : 'Cards you missed will return tomorrow. That is the spaced-repetition contract.'}
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Button variant="secondary" onClick={onExit}>
              <ArrowLeft className="h-4 w-4" /> Done
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="mx-auto max-w-xl animate-fade-in">
        <div className="surface-card p-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success">
            <Check className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">Nothing due right now</h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
            {mode === 'review'
              ? 'All cards are scheduled for future dates. Come back when SM-2 says you are about to forget.'
              : 'This deck has no cards yet. Generate a curriculum from a document first.'}
          </p>
          <div className="mt-6 flex justify-center gap-2">
            {mode === 'review' ? (
              <Button variant="secondary" onClick={() => onExit()}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            ) : (
              <Button variant="secondary" onClick={onExit}>
                Back
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const card = cards[index];
  const pct = cards.length ? (index + (rated ? 1 : 0)) / cards.length : 0;

  return (
    <div className="mx-auto max-w-xl space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onExit}>
          <ArrowLeft className="h-3.5 w-3.5" /> Exit
        </Button>
        <Progress value={pct} className="flex-1" />
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {index + 1}/{cards.length}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <Badge tone={mode === 'cram' ? 'warning' : 'primary'}>
          <Flame className="h-3 w-3" />
          {mode === 'cram' ? 'Cram mode' : 'Review mode'}
        </Badge>
        <span className="text-[11px] text-muted-foreground">
          {card.interval === 0 ? 'new card' : `interval ${card.interval}d`}
        </span>
      </div>

      {/* Card */}
      <div
        onClick={() => !rated && setFlipped((f) => !f)}
        className={cn(
          'relative min-h-72 cursor-pointer select-none rounded-2xl border bg-card p-8 shadow-card transition-all',
          !rated && 'hover:border-primary/40',
          rated === 'again' && 'border-danger/50',
          rated === 'hard' && 'border-accent/50',
          rated === 'good' && 'border-primary/50',
          rated === 'easy' && 'border-success/50'
        )}
      >
        <div className="absolute left-4 top-4 text-[10px] uppercase tracking-widest text-muted-foreground/60">
          {flipped ? 'Answer' : 'Question'}
        </div>
        {!flipped ? (
          <div className="flex min-h-56 items-center justify-center text-center">
            <p className="max-w-md text-lg font-medium leading-relaxed">{card.front}</p>
          </div>
        ) : (
          <div className="flex min-h-56 flex-col items-center justify-center text-center animate-fade-in">
            <p className="max-w-md text-base leading-relaxed">{card.back}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowSource((s) => !s);
              }}
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <BookOpenCheck className="h-3.5 w-3.5" />
              View in source
              {card.sourceRef && <span className="font-mono">{card.sourceRef}</span>}
              <ChevronDown className={cn('h-3 w-3 transition-transform', showSource && 'rotate-180')} />
            </button>
            {showSource && card.sourceText && (
              <p className="mt-3 rounded-lg border border-border bg-card-2/60 px-4 py-3 text-left text-xs leading-relaxed text-muted-foreground animate-fade-in">
                “{card.sourceText}”
              </p>
            )}
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="grid grid-cols-4 gap-2">
        {SRS_RATINGS.map((r, i) => (
          <button
            key={r.value}
            disabled={Boolean(rated)}
            onClick={() => rate(r.value)}
            className={cn(
              'rounded-xl border px-2 py-3 text-center transition-all focus-ring disabled:opacity-60',
              rated === r.value ? RATING_STYLES[r.value].bg : RATING_STYLES[r.value].border
            )}
          >
            <span className="block font-mono text-[10px] text-muted-foreground">{i + 1}</span>
            <span className="mt-0.5 block text-sm font-medium">{RATING_STYLES[r.value].label}</span>
          </button>
        ))}
      </div>

      <p className="text-center text-[11px] text-muted-foreground">
        {flipped ? 'Rate how well you recalled it' : 'Click the card or press Space to reveal'}
        {' · '}
        <span className="flex items-center justify-center gap-1">
          <Sparkles className="h-3 w-3" /> {curriculumTitle}
        </span>
      </p>
    </div>
  );
}
