import type { ParsedDocument, GenerationResult } from '@/types';
import { assembleCurriculum } from './curriculum';
import { generateFlashcardsFromConcepts } from './quizzes';

/**
 * The Local Engine — Lumora's zero-config generator.
 *
 * Deterministic, fully source-grounded, and free. It does not use an LLM:
 * structure comes from the document's own headings, concepts from frequency +
 * definitional sentences, questions from the source text itself. Used by
 * default (and as the fallback when no API key is configured).
 */
export async function generateCurriculumLocal(doc: ParsedDocument): Promise<GenerationResult> {
  const started = Date.now();
  const curriculum = assembleCurriculum(doc);

  const flashcards = curriculum.modules.flatMap((m) =>
    m.lessons.flatMap((l) =>
      generateFlashcardsFromConcepts(l.concepts, l.quizzes.length >= 2 ? l.quizzes : undefined)
    )
  );

  return {
    curriculum,
    flashcards,
    meta: {
      engine: 'local',
      chunksUsed: doc.chunks.length,
      durationMs: Date.now() - started,
    },
  };
}
