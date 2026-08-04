/**
 * Lumora SRS — spaced repetition scheduling.
 *
 * Core algorithm: SM-2 (SuperMemo 2) with the standard 2020s modifications
 * (separate "hard" rating, minimum ease floor, first-interval ladder).
 *
 * Every retention artifact in Lumora — flashcards and quiz questions — carries
 * SM-2 state, so retention is a first-class primitive, not an afterthought.
 */

export type SrsRating = 'again' | 'hard' | 'good' | 'easy';

export interface SrsState {
  repetitions: number; // consecutive successful reviews
  interval: number; // days until next review
  easeFactor: number; // 1.3 .. ~2.8
  dueDate: Date;
}

export const SRS_RATINGS: { value: SrsRating; label: string; hotkey: string }[] = [
  { value: 'again', label: 'Again', hotkey: '1' },
  { value: 'hard', label: 'Hard', hotkey: '2' },
  { value: 'good', label: 'Good', hotkey: '3' },
  { value: 'easy', label: 'Easy', hotkey: '4' },
];

const MIN_EASE = 1.3;
const DAY_MS = 86400000;

export function reviewSrsCard(
  state: Pick<SrsState, 'repetitions' | 'interval' | 'easeFactor'>,
  rating: SrsRating,
  now: Date = new Date()
): SrsState {
  let { repetitions, interval, easeFactor } = state;
  if (!Number.isFinite(easeFactor) || easeFactor <= 0) easeFactor = 2.5;
  if (!Number.isFinite(interval) || interval < 0) interval = 0;
  if (!Number.isFinite(repetitions) || repetitions < 0) repetitions = 0;

  switch (rating) {
    case 'again':
      // Lapse: reset the repetition count, review again very soon.
      repetitions = 0;
      interval = 0;
      easeFactor = Math.max(MIN_EASE, easeFactor - 0.2);
      break;
    case 'hard': {
      repetitions += 1;
      interval = interval === 0 ? 1 : Math.max(1, Math.round(interval * 1.2));
      easeFactor = Math.max(MIN_EASE, easeFactor - 0.15);
      break;
    }
    case 'good': {
      repetitions += 1;
      if (repetitions === 1) interval = 1;
      else if (repetitions === 2) interval = 3;
      else interval = Math.max(1, Math.round(interval * easeFactor));
      easeFactor = Math.max(MIN_EASE, easeFactor + 0.02);
      break;
    }
    case 'easy': {
      repetitions += 1;
      if (repetitions === 1) interval = 3;
      else if (repetitions === 2) interval = 7;
      else interval = Math.max(1, Math.round(interval * easeFactor * 1.3));
      easeFactor = Math.max(MIN_EASE, easeFactor + 0.08);
      break;
    }
  }

  return {
    repetitions,
    interval,
    easeFactor,
    dueDate: new Date(now.getTime() + interval * DAY_MS),
  };
}

/** Same SM-2 machinery reused for quiz-driven concept scheduling. */
export function nextQuizReview(
  wasCorrect: boolean,
  state: Pick<SrsState, 'repetitions' | 'interval' | 'easeFactor'> | null
): SrsState {
  return reviewSrsCard(
    state ?? { repetitions: 0, interval: 0, easeFactor: 2.5 },
    wasCorrect ? 'good' : 'again'
  );
}

/**
 * A mastery score (0..1) from a series of quiz outcomes.
 * Exponential moving average, weighted toward recent performance.
 */
export function masteryFromOutcomes(outcomes: boolean[]): number {
  if (outcomes.length === 0) return 0;
  let m = outcomes[0] ? 1 : 0;
  for (let i = 1; i < outcomes.length; i++) {
    const target = outcomes[i] ? 1 : 0;
    m = m + (target - m) * 0.4; // recent outcomes matter more
  }
  return Math.round(m * 100) / 100;
}
