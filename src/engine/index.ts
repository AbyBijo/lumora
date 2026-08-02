import type { ParsedDocument, GenerationResult, GeneratedCurriculum, GeneratedModule, GeneratedLesson, GeneratedConcept, GeneratedQuiz } from '@/types';
import { generateCurriculumLocal } from './local';
import { generateFlashcardsFromConcepts } from './quizzes';
import { resolveRemoteProvider, generateJson } from './llm';
import { CURRICULUM_PROMPT, buildChunksBlock } from './prompts';
import { z } from 'zod';

export { parseDocument, ParseError } from './parse';
export { generateCurriculumLocal } from './local';
export { reviewSrsCard, nextQuizReview, masteryFromOutcomes, SRS_RATINGS } from '@/lib/srs';

/**
 * Public generation entry point. Chooses the best available engine:
 *  - explicit provider requested & configured → that provider
 *  - any remote provider configured → the first configured one
 *  - otherwise → Local Engine (no API key required)
 */
export async function generateCurriculum(
  doc: ParsedDocument,
  opts: { prefer?: 'local' | 'openai' | 'anthropic' } = {}
): Promise<GenerationResult> {
  const started = Date.now();

  if (opts.prefer && opts.prefer !== 'local') {
    try {
      const result = await generateWithProvider(doc, opts.prefer);
      return { ...result, meta: { ...result.meta, durationMs: Date.now() - started } };
    } catch (e) {
      console.warn(`[lumora] provider ${opts.prefer} failed, falling back to local engine:`, e);
    }
  }

  const remote = resolveRemoteProvider();
  if (remote && opts.prefer !== 'local') {
    try {
      const result = await generateWithProvider(doc, remote.id);
      return { ...result, meta: { ...result.meta, durationMs: Date.now() - started } };
    } catch (e) {
      console.warn(`[lumora] remote provider ${remote.id} failed, falling back to local engine:`, e);
    }
  }

  return generateCurriculumLocal(doc);
}

async function generateWithProvider(
  doc: ParsedDocument,
  providerId: 'openai' | 'anthropic'
): Promise<GenerationResult> {
  const chunksBlock = buildChunksBlock(doc.chunks);
  const prompt = CURRICULUM_PROMPT.replace('{% chunks %}', chunksBlock);
  const raw = await generateJson(providerId, CURRICULUM_PROMPT.split('\n')[0], prompt);
  const parsed = parseCurriculumJson(raw);
  const curriculum = normalizeCurriculum(parsed, doc);
  const flashcards = curriculum.modules.flatMap((m) =>
    m.lessons.flatMap((l) =>
      generateFlashcardsFromConcepts(l.concepts, l.quizzes.length >= 2 ? l.quizzes : undefined)
    )
  );
  return {
    curriculum,
    flashcards,
    meta: { engine: providerId, chunksUsed: doc.chunks.length, durationMs: 0 },
  };
}

// ── Validation & normalization of model output ───────────────────────────────

const quizSchema = z.object({
  type: z.enum(['mcq', 'fill-blank', 'short-answer']).optional(),
  question: z.string(),
  options: z.array(z.string()).optional(),
  answer: z.string(),
  explanation: z.string().optional(),
  sourceRef: z.string().optional(),
});
const conceptSchema = z.object({ name: z.string(), definition: z.string(), sourceRef: z.string().optional() });
const lessonSchema = z.object({
  title: z.string(),
  content: z.string().optional(),
  objectives: z.array(z.string()).optional(),
  concepts: z.array(conceptSchema).optional(),
  quizzes: z.array(quizSchema).optional(),
});
const moduleSchema = z.object({ title: z.string(), description: z.string().optional(), lessons: z.array(lessonSchema).optional() });
const curriculumSchema = z.object({ curriculum: z.object({ title: z.string().optional(), description: z.string().optional(), modules: z.array(moduleSchema).optional() }) });

type ParsedCurriculum = z.infer<typeof curriculumSchema>;

function parseCurriculumJson(raw: string): ParsedCurriculum {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/, '')
    .trim();
  const json = JSON.parse(cleaned);
  return curriculumSchema.parse(json);
}

const CHUNK_REF_RE = /\[?(\d+)\]?/;

function resolveChunk(ref: string | undefined, doc: ParsedDocument): { sourceChunkIndex: number; sourceRef: string } {
  if (!ref) return { sourceChunkIndex: 0, sourceRef: '' };
  const m = ref.match(CHUNK_REF_RE);
  if (m) {
    const idx = Math.min(Number(m[1]), doc.chunks.length - 1);
    const chunk = doc.chunks[idx];
    const sourceRef = chunk.page ? `§ p.${chunk.page}` : chunk.section ? `§ ${chunk.section}` : `§ chunk ${idx + 1}`;
    return { sourceChunkIndex: idx, sourceRef };
  }
  return { sourceChunkIndex: 0, sourceRef: ref };
}

function normalizeCurriculum(parsed: ParsedCurriculum, doc: ParsedDocument): GeneratedCurriculum {
  const c = parsed.curriculum;
  const modules: GeneratedModule[] = (c.modules ?? []).map((m) => ({
    title: m.title,
    description: m.description ?? '',
    lessons: (m.lessons ?? []).map((l): GeneratedLesson => {
      const concepts: GeneratedConcept[] = (l.concepts ?? []).map((k) => ({
        name: k.name,
        definition: k.definition,
        ...resolveChunk(k.sourceRef, doc),
      }));
      const quizzes: GeneratedQuiz[] = (l.quizzes ?? []).map((q) => ({
        type: q.type ?? 'mcq',
        question: q.question,
        options: q.options,
        answer: q.answer,
        explanation: q.explanation ?? '',
        ...resolveChunk(q.sourceRef, doc),
      }));
      const anchor = resolveChunk(undefined, doc);
      return {
        title: l.title,
        content: l.content ?? '',
        objectives: l.objectives ?? [],
        sourceRef: anchor.sourceRef,
        sourceChunkIndex: anchor.sourceChunkIndex,
        concepts,
        quizzes,
      };
    }),
  }));

  return {
    title: c.title ?? doc.title,
    description: c.description ?? '',
    modules,
  };
}
