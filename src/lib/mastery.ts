import { clamp } from '@/lib/utils';

/**
 * Mastery math.
 *
 * Lumora measures mastery at four levels, each derived bottom-up:
 *   question → concept → lesson → module → curriculum
 *
 *  - A quiz answer updates the MasteryRecord of the question it belongs to
 *    (rolling EMA of correctness).
 *  - A concept's mastery is the average of its linked question records,
 *    blended with the SRS state of its flashcard.
 *  - Module mastery = weighted average of its lessons' concept/question scores.
 *  - Curriculum mastery = weighted average of module mastery.
 */

export interface MasteryInputs {
  score: number; // 0..1
  attempts: number;
}

/** Convert a raw score into a mastery level label. */
export function masteryLabel(m: number): 'Not started' | 'Learning' | 'Developing' | 'Solid' | 'Mastered' {
  if (m < 0.05) return 'Not started';
  if (m < 0.35) return 'Learning';
  if (m < 0.65) return 'Developing';
  if (m < 0.85) return 'Solid';
  return 'Mastered';
}

export function masteryColor(m: number): 'slate' | 'amber' | 'indigo' | 'emerald' {
  if (m < 0.05) return 'slate';
  if (m < 0.35) return 'amber';
  if (m < 0.65) return 'indigo';
  return 'emerald';
}

/** Combine child mastery scores (weighted by attempts where available). */
export function aggregateMastery(children: { score: number; attempts: number }[]): number {
  const active = children.filter((c) => c.attempts > 0 || c.score > 0);
  if (active.length === 0) return 0;
  const totalWeight = active.reduce((s, c) => s + Math.max(1, c.attempts), 0);
  const weighted = active.reduce((s, c) => s + c.score * Math.max(1, c.attempts), 0);
  return clamp(weighted / totalWeight, 0, 1);
}

export function masteryTone(m: number): string {
  if (m >= 0.85) return 'text-emerald-400';
  if (m >= 0.6) return 'text-indigo-300';
  if (m >= 0.3) return 'text-amber-300';
  return 'text-slate-400';
}
