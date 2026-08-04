/** Shared types for the Lumora engine (pure, framework-free). */

export type FileKind = 'pdf' | 'docx' | 'txt' | 'md' | 'url';

/** A parsed slice of the source with its location, ready for citation. */
export interface ParsedChunk {
  index: number;
  text: string;
  section?: string; // nearest heading, e.g. "2. Memory Encoding"
  page?: number;
  startChar: number;
  endChar: number;
}

export interface ParsedBlock {
  level: number; // heading level (0 = body block under a heading)
  title?: string; // heading title when level > 0
  text: string;
}

/** The normalized output of the ingestion pipeline. */
export interface ParsedDocument {
  title: string;
  fileType: FileKind;
  sourceUrl?: string;
  chunks: ParsedChunk[];
  /** Structural blocks (heading + body) preserving the document's own outline. */
  blocks: ParsedBlock[];
  /** Heading outline, e.g. ["1. Foundations", "1.1 Neurons"] */
  outline: string[];
  wordCount: number;
}

export type QuizType = 'mcq' | 'fill-blank' | 'short-answer';

export interface GeneratedQuiz {
  type: QuizType;
  question: string;
  options?: string[]; // mcq only
  answer: string;
  explanation: string;
  sourceRef: string;
  sourceChunkIndex: number;
}

export interface GeneratedConcept {
  name: string;
  definition: string;
  sourceRef: string;
  sourceChunkIndex: number;
}

export interface GeneratedFlashcard {
  front: string;
  back: string;
  sourceRef: string;
  sourceChunkIndex: number;
}

export interface GeneratedLesson {
  title: string;
  content: string;
  objectives: string[];
  sourceRef: string;
  sourceChunkIndex: number; // primary anchor
  concepts: GeneratedConcept[];
  quizzes: GeneratedQuiz[];
}

export interface GeneratedModule {
  title: string;
  description: string;
  lessons: GeneratedLesson[];
}

export interface GeneratedCurriculum {
  title: string;
  description: string;
  modules: GeneratedModule[];
}

export interface GenerationResult {
  curriculum: GeneratedCurriculum;
  flashcards: GeneratedFlashcard[];
  meta: {
    engine: 'local' | 'openai' | 'anthropic';
    chunksUsed: number;
    durationMs: number;
  };
}

/** Pipeline step status shown in the UI during processing. */
export interface PipelineStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'done';
}
