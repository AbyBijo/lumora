import type { GeneratedQuiz, QuizType } from '@/types';
import { extractConcepts, definitionFragment } from './concepts';
import { splitSentences, tokenize } from './text';

/**
 * Local active-recall generation.
 *
 * Every question is built from the source itself: a definitional sentence
 * becomes a MCQ / fill-blank / short-answer item, and the correct answer is
 * always a verbatim (or near-verbatim) passage from the document. Distractors
 * come from *other* real definitions in the same document — never invented.
 */

interface ScopeSentence {
  sentence: string;
  sourceRef: string;
  sourceChunkIndex: number;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function blankTerm(sentence: string, term: string): string {
  const re = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
  return sentence.replace(re, '_____');
}

/** Turn a definitional sentence into a crisp question about the term. */
function shortAnswerFrom(sentence: string, term: string): string {
  // "Spaced repetition is a method ..." → "What is spaced repetition?"
  const re = new RegExp(`^\\s*(?:in short|basically|generally)?\\s*${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+(is|are)\\s+`, 'i');
  if (re.test(sentence)) {
    return `What is ${term}?`;
  }
  const m = sentence.match(/^(.{5,80}?)\s+(is|are|refers to|means)\s/i);
  if (m) {
    return `Complete: "${m[1].trim()} ${m[2]} ______."`;
  }
  return `What is ${term}?`;
}

function makeMcq(
  sentence: string,
  term: string,
  fullDefinition: string,
  distractors: { term: string; fragment: string }[],
  sourceRef: string,
  sourceChunkIndex: number
): GeneratedQuiz | null {
  if (distractors.length < 3) return null;
  const question = `Which of the following best describes ${term}?`;
  const correctFragment = definitionFragment(sentence, term);
  if (correctFragment.length < 12) return null;
  const options = shuffle([
    ...distractors.slice(0, 3).map((d) => d.fragment),
    correctFragment,
  ]);
  if (new Set(options).size < 4) return null;
  const answer = correctFragment;
  const explanation = `From the source: “${sentence}” (${sourceRef}). The other options describe: ${distractors
    .slice(0, 3)
    .map((d) => `${d.term} — ${truncate(d.fragment, 80)}`)
    .join('; ')}. Correct definition in full: ${fullDefinition}`;
  return { type: 'mcq', question, options, answer, explanation, sourceRef, sourceChunkIndex };
}

function makeFillBlank(
  sentence: string,
  term: string,
  answer: string,
  sourceRef: string,
  sourceChunkIndex: number
): GeneratedQuiz {
  return {
    type: 'fill-blank',
    question: `Fill in the blank: ${blankTerm(sentence, term)}`,
    answer,
    explanation: `From the source: “${sentence}” (${sourceRef}).`,
    sourceRef,
    sourceChunkIndex,
  };
}

function makeShortAnswer(
  sentence: string,
  term: string,
  answer: string,
  sourceRef: string,
  sourceChunkIndex: number
): GeneratedQuiz {
  return {
    type: 'short-answer',
    question: shortAnswerFrom(sentence, term),
    answer,
    explanation: `From the source: “${sentence}” (${sourceRef}).`,
    sourceRef,
    sourceChunkIndex,
  };
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n - 1).trimEnd() + '…';
}

/**
 * Generate 3–5 mixed active-recall questions for a lesson.
 * @param body        lesson text
 * @param scope       sentence → citation mapping
 * @param docPool     document-wide definition pool (distractors)
 * @param count       target question count
 */
export function generateQuizzes(
  body: string,
  scope: ScopeSentence[],
  docPool: { term: string; fragment: string }[],
  count = 4
): GeneratedQuiz[] {
  const sentences = splitSentences(body);
  const concepts = extractConcepts(body, scope, Math.max(count + 1, 6));

  const out: GeneratedQuiz[] = [];
  const usedFragments = new Set<string>();

  for (const c of concepts) {
    if (out.length >= count) break;
    const term = c.name;
    const frag = c.definition;
    if (usedFragments.has(frag)) continue;

    const distractorPool = docPool.filter(
      (d) => d.term.toLowerCase() !== term.toLowerCase() && !d.fragment.includes(term)
    );
    const shuffledPool = shuffle(distractorPool);

    // Prefer 2 MCQ + fill-blank + short-answer mix per lesson.
    const remaining = count - out.length;
    const type: QuizType =
      remaining >= 3 && shuffledPool.length >= 3 ? 'mcq'
      : remaining >= 2 ? 'fill-blank'
      : 'short-answer';

    const sentence = scope.find((s) => s.sentence.includes(term))?.sentence ?? c.sourceSentence;

    let q: GeneratedQuiz | null = null;
    if (type === 'mcq') {
      q = makeMcq(sentence, term, frag, shuffledPool, c.sourceRef, c.sourceChunkIndex);
      if (!q) {
        // Not enough good distractors → fill-blank instead.
        q = makeFillBlank(sentence, term, frag, c.sourceRef, c.sourceChunkIndex);
      }
    } else if (type === 'fill-blank') {
      q = makeFillBlank(sentence, term, frag, c.sourceRef, c.sourceChunkIndex);
    } else {
      q = makeShortAnswer(sentence, term, frag, c.sourceRef, c.sourceChunkIndex);
    }

    if (q) {
      usedFragments.add(frag);
      out.push(q);
    }
  }

  // Fallback: if the heuristic found too few concepts, synthesize cloze items
  // from salient sentences.
  if (out.length < 2 && sentences.length > 0) {
    for (const s of sentences) {
      if (out.length >= count) break;
      const words = tokenize(s).filter((w) => w.length > 5 && !/^(which|about|their|these|those|there|would|could|should|because|however|although|through|between|another|during|before|after|people|things|something|anything)$/.test(w));
      if (words.length < 2) continue;
      const key = pick(words);
      const blanked = s.replace(new RegExp(`\\b${key}\\b`, 'i'), '_____');
      if (blanked === s) continue;
      out.push({
        type: 'fill-blank',
        question: `Fill in the blank: ${blanked}`,
        answer: key,
        explanation: `From the source: “${s}” (${scope[0]?.sourceRef ?? ''}).`,
        sourceRef: scope[0]?.sourceRef ?? '',
        sourceChunkIndex: scope[0]?.sourceChunkIndex ?? 0,
      });
    }
  }

  return out.slice(0, count);
}

/** Flashcards: one per concept, plus a card per quiz for concept-poor lessons. */
export function generateFlashcardsFromConcepts(
  concepts: { name: string; definition: string; sourceRef: string; sourceChunkIndex: number }[],
  quizzes?: { question: string; answer: string; explanation: string; sourceRef: string; sourceChunkIndex: number }[]
): { front: string; back: string; sourceRef: string; sourceChunkIndex: number }[] {
  const cards = concepts.map((c) => ({
    front: `What is ${c.name}?`,
    back: c.definition,
    sourceRef: c.sourceRef,
    sourceChunkIndex: c.sourceChunkIndex,
  }));
  if (cards.length === 0 && quizzes) {
    for (const q of quizzes) {
      const front = q.question.replace(/\s*_____\s*/g, ' ______ ').trim();
      const back = `${q.answer}${q.explanation ? ` — ${q.explanation.replace(/^From the source:/, 'Source:')}` : ''}`;
      cards.push({ front, back, sourceRef: q.sourceRef, sourceChunkIndex: q.sourceChunkIndex });
    }
  }
  return cards;
}
