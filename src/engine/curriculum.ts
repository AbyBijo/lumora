import type { ParsedDocument, GeneratedCurriculum, GeneratedLesson, GeneratedModule, ParsedBlock } from '@/types';
import { extractConcepts, buildDefinitionPool } from './concepts';
import { generateQuizzes } from './quizzes';
import { splitSentences } from './text';

/**
 * Curriculum assembly (local engine).
 *
 * Strategy:
 *  1. If the source has a heading outline → modules map to top-level sections,
 *     lessons to subsections. This honors the document's own structure.
 *  2. If not → the document is split proportionally into a small number of
 *     modules and lessons, each a contiguous reading unit.
 *  3. Every lesson gets content, objectives, key concepts, and quizzes — all
 *     cited to the exact source chunk they came from.
 */

interface Group {
  title: string;
  description: string;
  level: number; // the heading level used as the module boundary
  blocks: ParsedBlock[];
}

function splitIntoUnits(text: string, n: number): string[] {
  const sentences = splitSentences(text);
  if (sentences.length <= n) return sentences.map((s) => s).filter(Boolean);
  const target = Math.ceil(sentences.length / n);
  const units: string[] = [];
  for (let i = 0; i < sentences.length; i += target) {
    units.push(sentences.slice(i, i + target).join(' '));
  }
  return units;
}

export function assembleCurriculum(doc: ParsedDocument): GeneratedCurriculum {
  const blocks = doc.blocks ?? [];
  const allText = doc.chunks.map((c) => c.text).join(' ');
  const docPool = buildDefinitionPool(allText);

  const headingBlocks = blocks.filter((b) => b.level > 0);
  const h1s = headingBlocks.filter((b) => b.level === 1);
  const h2s = headingBlocks.filter((b) => b.level === 2);

  let groups: Group[];

  if (h1s.length >= 2) {
    // h1 headings = modules; h2+ = lessons.
    groups = groupByTopLevel(blocks, 1);
  } else if (h1s.length === 1 && h2s.length >= 2) {
    // Single h1 (the document title) → h2 headings = modules.
    groups = groupByTopLevel(blocks, 2);
  } else if (h2s.length >= 2) {
    // No h1 but several h2 → modules = h2.
    groups = groupByTopLevel(blocks, 2);
  } else if (headingBlocks.length >= 2) {
    // Any headings at all → one module per heading block group.
    groups = groupByTopLevel(blocks, Math.min(...headingBlocks.map((b) => b.level)));
  } else {
    // No usable outline — proportional split.
    const moduleCount = Math.min(4, Math.max(2, Math.ceil(doc.chunks.length / 4)));
    const moduleUnits = splitIntoUnits(allText, moduleCount);
    groups = moduleUnits.map((mu, mi) => ({
      title: `Module ${mi + 1}`,
      description: makeDescription(mu),
      level: 0,
      blocks: [{ level: 0, text: mu }],
    }));
    if (groups.length === 0) {
      groups = [{ title: doc.title, description: makeDescription(allText), level: 0, blocks: [{ level: 0, text: allText }] }];
    }
  }

  let modules: GeneratedModule[] = groups.map((g, gi) => {
    const lessons = buildLessonsForGroup(g, doc, docPool, gi);
    return {
      title: g.title,
      description: g.description || makeDescription(g.blocks.map((b) => b.text).join(' ')),
      lessons,
    };
  });

  // Prune empty modules / lessons.
  modules = modules
    .map((m) => ({ ...m, lessons: m.lessons.filter((l) => l.content.trim()) }))
    .filter((m) => m.lessons.length > 0);

  if (modules.length === 0) {
    modules = [
      {
        title: doc.title,
        description: 'Full document',
        lessons: [buildLesson(allText, doc.title, doc, docPool)],
      },
    ];
  }

  return {
    title: doc.title,
    description: makeDescription(allText),
    modules,
  };
}

/**
 * Group blocks into sections by a given heading level.
 * A section = its own heading block + every block until the next heading of
 * the same level (deeper headings and body text belong to the section).
 */
function groupByTopLevel(blocks: ParsedBlock[], level: number): Group[] {
  const groups: Group[] = [];
  let current: Group | null = null;
  const pending: ParsedBlock[] = []; // higher-level intro (e.g. document title)

  for (const b of blocks) {
    if (b.level === level) {
      if (current) groups.push(current);
      current = { title: b.title ?? 'Untitled', description: '', level, blocks: [b] };
    } else if (b.level > level) {
      if (current) current.blocks.push(b);
      else pending.push(b);
    } else {
      pending.push(b); // level < level, or body text before any heading
    }
  }
  if (current) groups.push(current);

  // Attach intro text (document title + preamble) to the first section.
  if (pending.length > 0 && groups.length > 0) {
    groups[0].blocks = [...pending, ...groups[0].blocks];
  }
  return groups;
}

function buildLessonsForGroup(
  g: Group,
  doc: ParsedDocument,
  docPool: { term: string; fragment: string }[],
  _moduleIndex: number
): GeneratedLesson[] {
  const boundaryText = g.blocks.filter((b) => b.level === g.level).map((b) => b.text).join(' ').trim();
  const deeper = g.blocks.filter((b) => b.level > g.level);
  const bodyText = g.blocks.filter((b) => b.level === 0).map((b) => b.text).join(' ').trim();
  const intro = [boundaryText, bodyText].filter(Boolean).join(' ').trim();

  const lessons: GeneratedLesson[] = [];

  if (deeper.length >= 1) {
    // Each deeper heading becomes a lesson; section intro attaches to the first.
    let lead = intro;
    for (const d of deeper) {
      const body = [lead, d.text].filter(Boolean).join('\n\n').trim();
      lessons.push(buildLesson(body || d.text, d.title ?? 'Lesson', doc, docPool));
      lead = '';
    }
  } else {
    // No deeper headings → split the section's own text into study-sized lessons.
    const units = splitIntoUnits(intro || g.title, 2);
    lessons.push(
      ...units.map((u, i) =>
        buildLesson(u, i === 0 && g.level > 0 ? g.title : `Lesson ${i + 1}`, doc, docPool)
      )
    );
  }

  return lessons;
}

function buildLesson(
  body: string,
  title: string,
  doc: ParsedDocument,
  docPool: { term: string; fragment: string }[]
): GeneratedLesson {
  const bodyText = body.replace(/\s+/g, ' ').trim();
  const sentences = splitSentences(bodyText);

  // Build citation scope: sentence → (sourceRef, chunkIndex)
  const scope: { sentence: string; sourceRef: string; sourceChunkIndex: number }[] = [];
  for (const chunk of doc.chunks) {
    for (const s of splitSentences(chunk.text)) {
      const ref = chunk.page
        ? `§ p.${chunk.page}`
        : chunk.section
          ? `§ ${chunk.section}`
          : `§ chunk ${chunk.index + 1}`;
      scope.push({ sentence: s, sourceRef: ref, sourceChunkIndex: chunk.index });
    }
  }

  const concepts = extractConcepts(bodyText, scope, 6);
  const quizzes = generateQuizzes(bodyText, scope, docPool, 4);
  const objectives = makeObjectives(concepts, sentences);

  const primaryRef = scope[0]?.sourceRef ?? '';
  const primaryChunk = scope[0]?.sourceChunkIndex ?? 0;

  return {
    title: title.replace(/\s*[.:\s]+$/, ''),
    content: bodyText,
    objectives,
    sourceRef: primaryRef,
    sourceChunkIndex: primaryChunk,
    concepts,
    quizzes,
  };
}

function makeObjectives(
  concepts: { name: string }[],
  sentences: string[]
): string[] {
  const objs: string[] = [];
  if (concepts.length >= 1) objs.push(`Define ${concepts[0].name} in your own words.`);
  if (concepts.length >= 2) objs.push(`Explain how ${concepts[1].name} relates to the other ideas in this lesson.`);
  const verb = sentences.length > 3 ? 'Summarize' : 'Describe';
  if (sentences.length >= 2) objs.push(`${verb} the key takeaway of this lesson in one or two sentences.`);
  if (concepts.length >= 3) objs.push(`Use ${concepts[2].name} correctly in a sentence.`);
  return objs.slice(0, 3);
}

function makeDescription(text: string): string {
  const t = text.replace(/\s+/g, ' ').trim();
  return t.length > 220 ? t.slice(0, 217).trimEnd() + '…' : t;
}
