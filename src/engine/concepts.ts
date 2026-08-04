import { isStopword, splitSentences } from './text';

/**
 * Local key-concept extraction.
 *
 * Strategy: find salient noun phrases by frequency + position, then attach a
 * definition harvested from the source itself (a "definitional sentence").
 * Everything is traceable — every concept carries the exact source passage.
 */

const DEFINITIONAL = /\b(is|are|was|were|refers to|is defined as|can be defined as|means|denotes|involves|describes|is characterized by|is the process of|is the practice of)\b/i;

// Overly generic terms that add no learning value.
const GENERIC_TERMS = new Set(
  `information chapter book article section idea concept study research result example way thing thing things people time day number part parts system systems model models process process effect effects practice practices method methods knowledge learning memory skill skills topic topics case cases role roles key point points note notes`.split(/\s+/)
);

interface TermCandidate {
  term: string;
  count: number;
  firstIndex: number;
  sentenceStarts: number; // how often the term starts a sentence
}

/** Extract salient noun phrases from a body of text. */
export function extractTermCandidates(text: string): TermCandidate[] {
  const sentences = splitSentences(text);
  const counts = new Map<string, { count: number; firstIndex: number; sentenceStarts: number }>();

  sentences.forEach((sent, si) => {
    const phrases = new Set<string>();

    // (a) Multi-word capitalized terms: "Working Memory", "Interleaved Practice"
    const capPhrases = sent.match(/\b([A-Z][a-zA-Z'-]+(?:\s+[A-Z][a-zA-Z'-]+){1,2})\b/g) ?? [];
    for (const p of capPhrases) phrases.add(p);

    // (b) Single capitalized nouns (not sentence-initial to avoid common-noun noise)
    const capSingles = sent.match(/\b([A-Z][a-z]{3,})\b/g) ?? [];
    const lower = sent.toLowerCase();
    for (const w of capSingles) {
      // Skip words that merely start a sentence (capitalized common nouns).
      const sentenceInitial = new RegExp(`^${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(sent);
      if (sentenceInitial && countInText(lower, w.toLowerCase()) <= 1) continue;
      phrases.add(w);
    }

    // (c) Acronyms
    const acros = sent.match(/\b([A-Z]{2,6})\b/g) ?? [];
    for (const a of acros) phrases.add(a);

    // (d) "X is ..." — the subject of a definitional sentence is usually a key term.
    const defMatch = sent.match(/^([A-Z][a-z][a-z\s'-]{2,70}?)\s+(is|are|refers to|means|denotes|involves|describes|is defined as)\s/i);
    if (defMatch) {
      const subj = defMatch[1].trim();
      if (subj.split(/\s+/).length <= 5) phrases.add(subj);
    }

    for (const p of Array.from(phrases)) {
      const key = p.toLowerCase();
      const prev = counts.get(key);
      if (prev) {
        prev.count += 1;
        prev.sentenceStarts += new RegExp(`^${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(lower) ? 1 : 0;
      } else {
        counts.set(key, { count: 1, firstIndex: si, sentenceStarts: 0 });
      }
    }
  });

  return [...counts.entries()].map(([term, info]) => ({ term, ...info }));
}

function countInText(lowerText: string, word: string): number {
  const re = new RegExp(`\\b${word}\\b`, 'g');
  return (lowerText.match(re) ?? []).length;
}

function findDefinitionSentence(term: string, sentences: string[]): string | undefined {
  const termRe = new RegExp(`\\b${escapeRegExp(term)}\\b`, 'i');
  const defs = sentences.filter((s) => termRe.test(s) && DEFINITIONAL.test(s));
  if (defs.length === 0) {
    const any = sentences.find((s) => termRe.test(s) && s.length > 40 && s.length < 340);
    return any;
  }
  // Prefer sentences where the term is the grammatical subject:
  // "Working memory is …" beats "There are three types of memory, one of which is working memory."
  const subjectMatch = defs.find((s) => new RegExp(`^${escapeRegExp(term)}\\s+(is|are|refers to|means|denotes|involves|describes)\\b`, 'i').test(s));
  if (subjectMatch) return subjectMatch;
  return defs[0];
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface ConceptSource {
  name: string;
  definition: string;
  sourceSentence: string;
  sourceRef: string;
  sourceChunkIndex: number;
}

/**
 * Rank candidates and pick the top concepts, each with a source-derived
 * definition. `scope` lets callers pass the lesson's sentences with their
 * chunk mapping for accurate citations.
 */
export function extractConcepts(
  body: string,
  scope: { sentence: string; sourceRef: string; sourceChunkIndex: number }[],
  maxConcepts: number
): ConceptSource[] {
  const sentences = splitSentences(body);
  const candidates = extractTermCandidates(body)
    .filter((c) => {
      const t = c.term;
      if (t.length < 3 || t.length > 48) return false;
      if (GENERIC_TERMS.has(t.toLowerCase())) return false;
      if (isStopword(t)) return false;
      if (/^(the|this|that|these|those|it|they|we|you|there|here)$/i.test(t)) return false;
      if (/^(this|these|those|that|such|each|every)\s/i.test(t)) return false; // "This spacing effect…" is context, not a term
      return true;
    })
    .sort((a, b) => {
      const score = (c: TermCandidate) => {
        const words = c.term.split(/\s+/).length;
        const freq = Math.min(c.count, 5);
        const posBoost = c.firstIndex < 2 ? 2.5 : 0; // early mentions matter
        const lengthBoost = words === 1 ? 0 : 2;
        const subjectBoost = c.sentenceStarts > 0 ? 1 : 0;
        return freq + posBoost + lengthBoost + subjectBoost;
      };
      return score(b) - score(a);
    });

  const seen = new Set<string>();
  const out: ConceptSource[] = [];

  for (const c of candidates) {
    if (out.length >= maxConcepts) break;
    const key = c.term.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    const defSentence = findDefinitionSentence(c.term, sentences);
    if (!defSentence) continue;

    // Locate the sentence inside scope for citation mapping.
    const hit =
      scope.find((s) => s.sentence === defSentence) ??
      scope.find((s) => s.sentence.includes(c.term)) ??
      scope[0];
    if (!hit) continue;

    const definition = condenseDefinition(defSentence, c.term);
    if (!definition) continue;

    out.push({
      name: properCase(c.term),
      definition,
      sourceSentence: defSentence,
      sourceRef: hit.sourceRef,
      sourceChunkIndex: hit.sourceChunkIndex,
    });
  }

  return out;
}

function properCase(s: string): string {
  return s
    .split(' ')
    .map((w) => (w[0] ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

/** Full definition for flashcard backs / lesson content — keeps the term. */
export function condenseDefinition(sentence: string, term: string): string {
  let s = sentence.trim();
  if (s.length > 340) {
    const idx = s.toLowerCase().indexOf(term.toLowerCase());
    s = idx >= 0 ? s.slice(idx) : s.slice(0, 340);
  }
  s = s.replace(/\s+/g, ' ').trim();
  if (!s) return '';
  if (!/[.!?]$/.test(s)) s += '.';
  return s;
}

/**
 * Compact predicate fragment ("is …" clause without the subject) — ideal for
 * MCQ answer options, so options stay short and distinct.
 */
export function definitionFragment(sentence: string, term: string, maxLen = 120): string {
  const re = new RegExp(
    `^${escapeRegExp(term)}\\s+(?:is|are|refers to|means|denotes|involves|describes|is defined as)\\s+(.+)$`,
    'i'
  );
  const m = sentence.trim().match(re);
  let frag = m ? m[1] : sentence.trim();
  // Cut at the first natural stop, keeping the fragment self-contained.
  const firstStop = frag.search(/\.\s+[A-Z]|;|\.$/);
  if (firstStop > 25) frag = frag.slice(0, firstStop + 1);
  frag = frag.trim();
  if (frag.length > maxLen) {
    frag = frag.slice(0, maxLen - 1).trimEnd() + '…';
  }
  if (frag && !/[.!?…]$/.test(frag)) frag += '.';
  return frag;
}

/** Build the definition pool used for distractor generation across a document. */
export function buildDefinitionPool(
  body: string
): { term: string; fragment: string }[] {
  const sentences = splitSentences(body);
  const candidates = extractTermCandidates(body);
  const pool: { term: string; fragment: string }[] = [];
  const seen = new Set<string>();

  for (const c of candidates) {
    const key = c.term.toLowerCase();
    if (seen.has(key) || GENERIC_TERMS.has(key) || key.length < 3) continue;
    const def = findDefinitionSentence(c.term, sentences);
    if (!def) continue;
    seen.add(key);
    const fragment = definitionFragment(def, c.term);
    if (fragment.length > 20 && fragment.length < 160) {
      pool.push({ term: properCase(c.term), fragment });
    }
  }
  return pool;
}
