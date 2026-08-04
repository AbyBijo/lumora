'use client';

import * as React from 'react';
import { Sparkles, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Deck } from '@/components/flashcards/deck';

export function DeckLauncher({
  curriculumId,
  curriculumTitle,
  initialMode = 'review',
  buttonLabel,
  buttonVariant = 'primary',
  compact,
}: {
  curriculumId: string;
  curriculumTitle: string;
  initialMode?: 'review' | 'cram';
  buttonLabel?: string;
  buttonVariant?: 'primary' | 'secondary' | 'ghost';
  compact?: boolean;
}) {
  const [launched, setLaunched] = React.useState(false);
  const [mode, setMode] = React.useState<'review' | 'cram'>(initialMode);

  if (!launched) {
    return (
      <div className={compact ? '' : 'flex flex-wrap items-center gap-3'}>
        <Button size={compact ? 'sm' : 'md'} variant={buttonVariant} onClick={() => setLaunched(true)}>
          <Sparkles className="h-3.5 w-3.5" />
          {buttonLabel ?? 'Start review'}
        </Button>
        {!compact && (
          <Button variant="ghost" size="sm" onClick={() => { setMode('cram'); setLaunched(true); }}>
            <Flame className="h-3.5 w-3.5 text-accent" />
            Cram mode (all cards)
          </Button>
        )}
      </div>
    );
  }

  return (
    <Deck
      curriculumId={curriculumId}
      curriculumTitle={curriculumTitle}
      mode={mode}
      onExit={() => setLaunched(false)}
    />
  );
}
