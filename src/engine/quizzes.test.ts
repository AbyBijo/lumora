import { describe, it, expect } from 'vitest';
import { generateQuizzes, generateFlashcardsFromConcepts } from './quizzes';
import { buildDefinitionPool, extractConcepts } from './concepts';
import { splitSentences } from './text';

const BODY = [
  'Working memory is the small amount of information that a person can hold in mind and manipulate at one time.',
  'Sensory memory holds raw sensory information for less than a second.',
  'Long-term memory is the vast store of knowledge and experiences that persists for years.',
  'Retrieval practice is the act of recalling information from memory rather than simply re-reading it.',
  'Spaced repetition is the practice of reviewing material at gradually increasing intervals.',
  'Interleaving is the practice of mixing different topics within a single study session.',
].join(' ');

function makeScope(body: string) {
  return splitSentences(body).map((sentence, i) => ({
    sentence,
    sourceRef: `§ p.${(i % 3) + 1}`,
    sourceChunkIndex: i,
  }));
}

describe('generateQuizzes', () => {
  it('produces the requested number of questions with citations', () => {
    const scope = makeScope(BODY);
    const pool = buildDefinitionPool(BODY);
    const quizzes = generateQuizzes(BODY, scope, pool, 4);
    expect(quizzes.length).toBeGreaterThanOrEqual(3);
    expect(quizzes.length).toBeLessThanOrEqual(4);
    for (const q of quizzes) {
      expect(q.question.length).toBeGreaterThan(5);
      expect(q.answer.length).toBeGreaterThan(3);
      expect(q.sourceRef).toBeTruthy();
      expect(q.explanation).toBeTruthy();
    }
  });

  it('MCQ options are 4 distinct real definitions', () => {
    const scope = makeScope(BODY);
    const pool = buildDefinitionPool(BODY);
    const quizzes = generateQuizzes(BODY, scope, pool, 6);
    const mcqs = quizzes.filter((q) => q.type === 'mcq');
    expect(mcqs.length).toBeGreaterThan(0);
    for (const q of mcqs) {
      expect(q.options).toBeDefined();
      expect(q.options!.length).toBe(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.options).toContain(q.answer);
    }
  });

  it('never invents a correct answer — it is always a source fragment', () => {
    const scope = makeScope(BODY);
    const pool = buildDefinitionPool(BODY);
    const quizzes = generateQuizzes(BODY, scope, pool, 6);
    for (const q of quizzes) {
      const inSource = BODY.toLowerCase().includes(q.answer.toLowerCase().slice(0, 30));
      expect(inSource).toBe(true);
    }
  });
});

describe('extractConcepts', () => {
  it('finds definitional concepts from the source', () => {
    const scope = makeScope(BODY);
    const concepts = extractConcepts(BODY, scope, 6);
    expect(concepts.length).toBeGreaterThanOrEqual(4);
    for (const c of concepts) {
      expect(c.name.length).toBeGreaterThan(2);
      expect(c.definition.length).toBeGreaterThan(10);
      expect(c.sourceRef).toBeTruthy();
    }
  });
});

describe('generateFlashcardsFromConcepts', () => {
  it('builds front/back pairs from concepts', () => {
    const scope = makeScope(BODY);
    const concepts = extractConcepts(BODY, scope, 5);
    const cards = generateFlashcardsFromConcepts(concepts);
    expect(cards.length).toBe(concepts.length);
    for (const c of cards) {
      expect(c.front).toContain('What is');
      expect(c.back.length).toBeGreaterThan(10);
      expect(c.sourceRef).toBeTruthy();
    }
  });

  it('falls back to quiz cards when a lesson has no concepts', () => {
    const scope = makeScope(BODY);
    const pool = buildDefinitionPool(BODY);
    const quizzes = generateQuizzes(BODY, scope, pool, 3);
    const cards = generateFlashcardsFromConcepts([], quizzes);
    expect(cards.length).toBeGreaterThan(0);
  });
});
