/**
 * Lumora Core Type Definitions
 */

export type ThemeMode = 'light' | 'dark';

export type SupportedFormat = 'pdf' | 'docx' | 'txt' | 'md' | 'image' | 'youtube' | 'audio' | 'url';

export interface BoundingBox {
  x: number; // Normalized 0..1
  y: number;
  width: number;
  height: number;
  pageNumber: number;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  index: number;
  text: string;
  pageNumber: number;
  sectionHeader?: string;
  charStart: number;
  charEnd: number;
  tokenCount: number;
  boundingBoxes?: BoundingBox[];
}

export interface DocumentSource {
  id: string;
  workspaceId: string;
  title: string;
  format: SupportedFormat;
  originalFileName: string;
  fileSize: number;
  pageCount: number;
  sha256Hash: string;
  createdAt: string;
  updatedAt: string;
  rawText: string;
  chunks: DocumentChunk[];
  tags: string[];
  summaryPreview?: string;
}

export interface CitationRef {
  chunkId: string;
  pageNumber: number;
  snippet: string;
  sectionHeader?: string;
  score?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  citations?: CitationRef[];
  studyActionType?: StudyActionType;
}

export type StudyActionType =
  | 'summarize'
  | 'explain_eli5'
  | 'explain_advanced'
  | 'flashcards'
  | 'quiz'
  | 'cornell_notes'
  | 'compare_concepts'
  | 'timeline'
  | 'mind_map';

export interface Flashcard {
  id: string;
  documentId: string;
  front: string;
  back: string;
  chunkId: string;
  pageNumber: number;
  keyConcept: string;
  // SM-2 Spaced Repetition parameters
  interval: number; // in days
  repetition: number;
  easeFactor: number; // default 2.5
  dueDate: string;
  lastStudied?: string;
  state: 'new' | 'learning' | 'review' | 'mastered';
}

export interface QuizOption {
  id: string; // 'A' | 'B' | 'C' | 'D'
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: QuizOption[];
  difficulty: 'foundational' | 'intermediate' | 'advanced';
  chunkId: string;
  pageNumber: number;
  conceptTested: string;
  userSelectedOptionId?: string;
  isAnswered?: boolean;
}

export interface QuizDeck {
  id: string;
  documentId: string;
  title: string;
  questions: QuizQuestion[];
  score?: number;
  completedAt?: string;
}

export interface CornellCue {
  id: string;
  cue: string;
  note: string;
  pageNumber?: number;
}

export interface CornellNotesData {
  id: string;
  documentId: string;
  title: string;
  cues: CornellCue[];
  summary: string;
  keyTerms: string[];
  updatedAt: string;
}

export interface ConceptComparisonItem {
  attribute: string;
  conceptA: string;
  conceptB: string;
  nuance: string;
}

export interface ConceptComparisonData {
  title: string;
  conceptAName: string;
  conceptBName: string;
  overview: string;
  rows: ConceptComparisonItem[];
  synthesis: string;
}

export interface TimelineEvent {
  id: string;
  dateOrStage: string;
  title: string;
  description: string;
  pageNumber: number;
  chunkId: string;
}

export interface MindMapNode {
  id: string;
  label: string;
  description?: string;
  pageNumber?: number;
  children?: MindMapNode[];
}

export interface SummaryData {
  executiveSummary: string;
  coreTakeaways: string[];
  structuralOutline: {
    sectionTitle: string;
    pageNumber: number;
    summary: string;
    keyPoints: string[];
  }[];
}

export type AIProviderId =
  | 'openrouter'
  | 'anthropic'
  | 'openai'
  | 'gemini'
  | 'mistral'
  | 'deepseek'
  | 'groq'
  | 'ollama';

export interface AIProviderConfig {
  id: AIProviderId;
  name: string;
  apiKey: string;
  model: string;
  baseUrl?: string;
  isAvailable: boolean;
}

export interface WorkspaceProject {
  id: string;
  name: string;
  description?: string;
  documentIds: string[];
  createdAt: string;
}
