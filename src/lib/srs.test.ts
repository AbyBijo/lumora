import { describe, it, expect } from 'vitest';
import { reviewSrsCard, nextQuizReview, masteryFromOutcomes, type SrsState } from './srs';

const base: SrsState = { repetitions: 0, interval: 0, easeFactor: 2.5, dueDate: new Date() };

describe('SM-2 reviewSrsCard', () => {
  it('first "good" sets interval to 1 day', () => {
    const r = reviewSrsCard(base, 'good');
    expect(r.repetitions).toBe(1);
    expect(r.interval).toBe(1);
    expect(r.easeFactor).toBeGreaterThan(2.5);
  });

  it('second "good" sets interval to 3 days', () => {
    const r = reviewSrsCard({ repetitions: 1, interval: 1, easeFactor: 2.5 }, 'good');
    expect(r.repetitions).toBe(2);
    expect(r.interval).toBe(3);
  });

  it('subsequent "good" multiplies interval by ease factor', () => {
    const r = reviewSrsCard({ repetitions: 2, interval: 3, easeFactor: 2.5 }, 'good');
    expect(r.interval).toBe(Math.round(3 * 2.52)); // ease +0.02
  });

  it('"again" resets repetitions and interval and lowers ease', () => {
    const r = reviewSrsCard({ repetitions: 5, interval: 30, easeFactor: 2.5 }, 'again');
    expect(r.repetitions).toBe(0);
    expect(r.interval).toBe(0);
    expect(r.easeFactor).toBeCloseTo(2.3, 5);
  });

  it('ease factor never drops below the floor', () => {
    const r = reviewSrsCard({ repetitions: 0, interval: 0, easeFactor: 1.3 }, 'again');
    expect(r.easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  it('"easy" first review jumps to 3 days', () => {
    const r = reviewSrsCard(base, 'easy');
    expect(r.interval).toBe(3);
  });

  it('"hard" grows interval slowly and lowers ease', () => {
    const r = reviewSrsCard({ repetitions: 2, interval: 3, easeFactor: 2.5 }, 'hard');
    expect(r.interval).toBe(Math.max(1, Math.round(3 * 1.2)));
    expect(r.easeFactor).toBeLessThan(2.5);
  });

  it('due date advances by the interval', () => {
    const now = new Date('2026-08-01T12:00:00Z');
    // repetitions=1 → this is the second "good" review → interval 3 days.
    const r = reviewSrsCard({ ...base, repetitions: 1, interval: 1, easeFactor: 2.5 }, 'good', now);
    expect(r.interval).toBe(3);
    expect(r.dueDate.getTime()).toBe(now.getTime() + 3 * 86400000);
  });

  it('tolerates garbage state', () => {
    const r = reviewSrsCard({ repetitions: -5, interval: NaN, easeFactor: 0 }, 'good');
    expect(Number.isFinite(r.interval)).toBe(true);
    expect(r.easeFactor).toBeGreaterThanOrEqual(1.3);
  });
});

describe('nextQuizReview', () => {
  it('correct answers schedule like "good"', () => {
    const r = nextQuizReview(true, null);
    expect(r.interval).toBe(1);
  });
  it('wrong answers reset like "again"', () => {
    const r = nextQuizReview(false, { repetitions: 3, interval: 10, easeFactor: 2.5 });
    expect(r.repetitions).toBe(0);
    expect(r.interval).toBe(0);
  });
});

describe('masteryFromOutcomes', () => {
  it('returns 0 for no outcomes', () => {
    expect(masteryFromOutcomes([])).toBe(0);
  });
  it('all correct → high mastery', () => {
    expect(masteryFromOutcomes([true, true, true])).toBeGreaterThan(0.9);
  });
  it('all wrong → 0', () => {
    expect(masteryFromOutcomes([false, false])).toBe(0);
  });
  it('recent outcomes weigh more than old ones', () => {
    // Same history, differing only in the latest outcome: the sequence ending
    // in a correct answer must score higher (EMA moves 40% toward the newest).
    const endsCorrect = masteryFromOutcomes([true, true, false, false, true]);
    const endsWrong = masteryFromOutcomes([true, true, false, false, false]);
    expect(endsCorrect).toBeGreaterThan(endsWrong);
  });
});
