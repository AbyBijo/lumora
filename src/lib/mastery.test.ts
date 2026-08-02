import { describe, it, expect } from 'vitest';
import { aggregateMastery, masteryLabel, masteryColor } from './mastery';

describe('aggregateMastery', () => {
  it('is zero for no active children', () => {
    expect(aggregateMastery([])).toBe(0);
    expect(aggregateMastery([{ score: 0, attempts: 0 }])).toBe(0);
  });

  it('averages scores', () => {
    const m = aggregateMastery([
      { score: 1, attempts: 1 },
      { score: 0, attempts: 1 },
    ]);
    expect(m).toBeCloseTo(0.5, 5);
  });

  it('weights by attempts', () => {
    const m = aggregateMastery([
      { score: 1, attempts: 4 },
      { score: 0, attempts: 1 },
    ]);
    expect(m).toBeGreaterThan(0.75);
    expect(m).toBeLessThan(0.85);
  });

  it('clamps to [0, 1]', () => {
    expect(aggregateMastery([{ score: 2, attempts: 1 }])).toBeLessThanOrEqual(1);
  });
});

describe('masteryLabel', () => {
  it('labels buckets', () => {
    expect(masteryLabel(0)).toBe('Not started');
    expect(masteryLabel(0.3)).toBe('Learning');
    expect(masteryLabel(0.5)).toBe('Developing');
    expect(masteryLabel(0.7)).toBe('Solid');
    expect(masteryLabel(0.9)).toBe('Mastered');
  });
});

describe('masteryColor', () => {
  it('maps levels to tones', () => {
    expect(masteryColor(0.01)).toBe('slate');
    expect(masteryColor(0.3)).toBe('amber');
    expect(masteryColor(0.6)).toBe('indigo');
    expect(masteryColor(0.9)).toBe('emerald');
  });
});
