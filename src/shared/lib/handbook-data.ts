import {
  DocumentSource,
  Flashcard,
  QuizDeck,
  CornellNotesData,
  ConceptComparisonData,
  TimelineEvent,
  MindMapNode,
  SummaryData,
} from '../types';
import { chunkDocumentText } from './chunker';

const LUMORA_HANDBOOK_RAW_TEXT = `--- Page 1 ---
# Lumora Master User Handbook: The Learning Operating System
Lumora Systems Architecture & Cognitive Ergonomics Division

## 1. The Core Philosophy
Information is abundant. Understanding is scarce.

Every feature within Lumora is engineered to move the human mind through a 6-stage cognitive pipeline:
1. Information: Ingest, extract, and normalize raw materials (PDFs, DOCX, Markdown, OCR scans, YouTube transcripts).
2. Understanding: Deconstruct complexity through dual-mode explanations (ELI5 vs Advanced), structural outlines, and verified citations.
3. Practice: Convert passive comprehension into active retrieval using automated flashcards and adaptive quizzes.
4. Retention: Hardening memory traces with SuperMemo SM-2 spaced repetition schedules.
5. Application: Synthesize cross-domain connections using Cornell notes, comparative concept matrices, and timelines.
6. Mastery: Verifiable conceptual ownership and seamless Markdown/PDF export.

Artificial intelligence is not the product; human learning is the product. AI exists solely as a cognitive catalyst.

--- Page 2 ---
## 2. Document Intelligence & Verifiable Citations
Lumora manages all document lifecycles locally rather than outsourcing raw file dumps to third-party LLMs.

### 2.1 The Ingestion & Indexing Pipeline
When a document is ingested:
- Type Detection: Automatically differentiates selectable PDFs, scanned image PDFs (triggering local OCR), DOCX files, Markdown, and YouTube video captions.
- SHA-256 Hashing: Generates an immutable content hash so files are processed only once.
- Semantic Chunking: Text is segmented into 400-800 token chunks with 10% overlap, strictly respecting chapter headings and sentence boundaries.
- Hybrid Indexing: Simultaneously creates an Okapi BM25 lexical index and a dense semantic vector index.
- Reciprocal Rank Fusion (RRF): Blends exact keyword matches with conceptual semantic similarity.

### 2.2 Bidirectional Grounding
Every assertion generated in the AI Studio contains verifiable citation tags in the format [ref:chunk_id:page_number]. Clicking any citation tag instantly navigates the Document Viewer to the exact page and pulses the highlight overlay.

--- Page 3 ---
## 3. The Eight Pedagogical Study Actions
Lumora replaces ungrounded open-ended chatting with specialized, high-leverage Study Actions:

1. Summarize: Distills executive findings, core takeaways, and chapter-level outlines.
2. Explain (ELI5): Breaks down complex mechanisms using intuitive real-world analogies.
3. Explain (Advanced): Formulates rigorous theoretical, mathematical, and architectural analyses.
4. Active Recall Flashcards: Automatically extracts atomic Q&A cards integrated into an SM-2 spaced repetition scheduler.
5. Adaptive Quizzes: Generates multiple-choice and short-answer diagnostic tests with instant explanations for every option.
6. Cornell Study Notes: Automatically structures knowledge into Recall Cues, Detailed Synthesis Notes, and a Summary Block.
7. Concept Comparison Matrices: Creates side-by-side comparative tables dissecting trade-offs, commonalities, and key nuances between ideas.
8. Knowledge Graph Mind Maps & Timelines: Visualizes concept hierarchies and chronological execution flows.

--- Page 4 ---
## 4. Sovereign AI, BYOK Vault & Progressive Privacy
Lumora is built on a strict privacy-first foundation:
- Zero Mandatory Sign-Up: The workspace launches immediately in local-first mode. Users can ingest documents and study without creating an account.
- Client-Side BYOK Vault: Bring Your Own Key credentials (OpenRouter, Anthropic, OpenAI, Gemini, Groq, Mistral, DeepSeek) are encrypted in the browser using WebCrypto AES-GCM (256-bit). Keys never touch remote telemetry.
- Local Offline Models: Connect seamlessly to local Ollama endpoints (http://localhost:11434) for 100% offline, private inference.
- Local Pedagogical Engine: When no API key is provided, Lumora's built-in heuristic synthesis engine powers all study actions with zero configuration.
`;

export function createHandbookDocument(): DocumentSource {
  const docId = 'doc_lumora_handbook_v1';
  const chunks = chunkDocumentText(docId, LUMORA_HANDBOOK_RAW_TEXT);

  return {
    id: docId,
    workspaceId: 'ws_default_workspace',
    title: 'Lumora Master User Handbook & Guide',
    format: 'pdf',
    originalFileName: 'lumora_handbook_v1.0.pdf',
    fileSize: 327680,
    pageCount: 4,
    sha256Hash: 'lumora_core_handbook_sha256_v100',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    rawText: LUMORA_HANDBOOK_RAW_TEXT,
    chunks,
    tags: ['Guide', 'Handbook', 'Architecture', 'Pedagogy'],
    summaryPreview:
      'Official Lumora User Handbook detailing the 6-stage learning pipeline, document intelligence, 8 study actions, and sovereign BYOK privacy architecture.',
  };
}

export function getHandbookFlashcards(documentId: string): Flashcard[] {
  return [
    {
      id: 'fc_hb_1',
      documentId,
      front: 'What are the 6 stages of the Lumora Learning Funnel?',
      back: '1. Information (Ingestion & OCR)\n2. Understanding (Deconstruction & Citations)\n3. Practice (Active Recall & Quizzes)\n4. Retention (SM-2 Spaced Repetition)\n5. Application (Cornell Notes & Concept Matrices)\n6. Mastery (Fluency & Export)',
      chunkId: 'chk_doc_lumo_0',
      pageNumber: 1,
      keyConcept: '6-Stage Learning Pipeline',
      interval: 1,
      repetition: 0,
      easeFactor: 2.5,
      dueDate: new Date().toISOString(),
      state: 'new',
    },
    {
      id: 'fc_hb_2',
      documentId,
      front: 'How does Lumora prevent hallucinations and ensure grounded claims?',
      back: 'Lumora indexes documents locally using BM25 and vector embeddings. AI responses must embed bidirectional citations [ref:chunk_id:page] that link directly to highlighted text in the Document Viewer.',
      chunkId: 'chk_doc_lumo_1',
      pageNumber: 2,
      keyConcept: 'Bidirectional Grounding & Citations',
      interval: 1,
      repetition: 0,
      easeFactor: 2.5,
      dueDate: new Date().toISOString(),
      state: 'new',
    },
    {
      id: 'fc_hb_3',
      documentId,
      front: 'How are BYOK API keys secured in Lumora?',
      back: 'Keys are encrypted client-side using WebCrypto AES-GCM (256-bit) and stored exclusively in browser local storage. They are never logged or sent to Lumora telemetry servers.',
      chunkId: 'chk_doc_lumo_3',
      pageNumber: 4,
      keyConcept: 'WebCrypto AES-GCM Vault',
      interval: 1,
      repetition: 0,
      easeFactor: 2.5,
      dueDate: new Date().toISOString(),
      state: 'new',
    },
  ];
}

export function getHandbookQuiz(documentId: string): QuizDeck {
  return {
    id: 'quiz_hb_v1',
    documentId,
    title: 'Lumora System Fluency & Navigation Quiz',
    questions: [
      {
        id: 'q_hb_1',
        questionText: 'What is the primary product philosophy of Lumora?',
        options: [
          {
            id: 'A',
            text: 'AI is the product; users should spend maximum time chatting with bots',
            isCorrect: false,
            explanation: 'Lumora rejects chatbot vanity metrics; AI is merely a cognitive catalyst.',
          },
          {
            id: 'B',
            text: 'Information is abundant; understanding is scarce. Learning is the product.',
            isCorrect: true,
            explanation: 'Correct! Lumora is engineered to transform raw information into structured human understanding.',
          },
          {
            id: 'C',
            text: 'All documents must be uploaded unchunked to third-party servers',
            isCorrect: false,
            explanation: 'Lumora processes and indexes documents locally, sending only minimal necessary context.',
          },
        ],
        difficulty: 'foundational',
        chunkId: 'chk_doc_lumo_0',
        pageNumber: 1,
        conceptTested: 'Product Philosophy',
      },
      {
        id: 'q_hb_2',
        questionText: 'What global shortcut opens the Universal Command Palette?',
        options: [
          {
            id: 'A',
            text: 'Cmd + K / Ctrl + K',
            isCorrect: true,
            explanation: 'Correct! Cmd+K opens the omni-search command palette for fast keyboard-driven navigation.',
          },
          {
            id: 'B',
            text: 'Shift + Delete',
            isCorrect: false,
            explanation: 'Shift+Delete is not a navigation shortcut.',
          },
          {
            id: 'C',
            text: 'Alt + F4',
            isCorrect: false,
            explanation: 'Alt+F4 closes window on Windows.',
          },
        ],
        difficulty: 'intermediate',
        chunkId: 'chk_doc_lumo_2',
        pageNumber: 3,
        conceptTested: 'Keyboard Shortcuts',
      },
    ],
  };
}

export function getHandbookSummary(documentId: string): SummaryData {
  return {
    executiveSummary:
      'The Lumora Master User Handbook provides a complete operational guide to the Learning Operating System. It outlines the 6-stage cognitive learning pipeline, local document intelligence, 8 active study actions, sovereign BYOK encryption, and keyboard-first workspace ergonomics.',
    coreTakeaways: [
      'Learning is the product; AI exists only as a pedagogical assistant.',
      'Local hybrid retrieval (BM25 + Dense Vectors) guarantees fast, grounded responses with zero hallucinations.',
      'Active recall flashcards (SM-2) and adaptive quizzes convert passive reading into permanent retention.',
      'Sovereign BYOK vault secures API credentials with client-side WebCrypto AES-GCM.',
    ],
    structuralOutline: [
      {
        sectionTitle: 'Section 1: The Core Philosophy & 6-Stage Funnel',
        pageNumber: 1,
        summary: 'Details the progression from Information to Understanding, Practice, Retention, Application, and Mastery.',
        keyPoints: ['Information abundance vs understanding scarcity', 'Pedagogical design principles'],
      },
      {
        sectionTitle: 'Section 2: Document Intelligence Pipeline',
        pageNumber: 2,
        summary: 'Explains SHA-256 caching, semantic chunking, and bidirectional citation jumping.',
        keyPoints: ['Auto-OCR detection', 'Reciprocal Rank Fusion', 'Citation highlight jumping'],
      },
      {
        sectionTitle: 'Section 3: Eight Pedagogical Study Actions',
        pageNumber: 3,
        summary: 'Covers ELI5 explanations, Cornell notes, concept comparison matrices, and timeline generators.',
        keyPoints: ['Active recall runners', 'Structured Cornell notes', 'Comparative matrices'],
      },
      {
        sectionTitle: 'Section 4: Sovereign Privacy & Progressive Auth',
        pageNumber: 4,
        summary: 'Describes client-side key encryption, local Ollama integration, and zero-wall startup.',
        keyPoints: ['WebCrypto AES-GCM', 'Ollama offline endpoints', 'No forced signup'],
      },
    ],
  };
}

export function getHandbookCornellNotes(documentId: string): CornellNotesData {
  return {
    id: 'cn_hb_v1',
    documentId,
    title: 'Cornell Notes: Lumora Learning Operating System Guide',
    cues: [
      {
        id: 'cue_hb_1',
        cue: 'What is Lumora?',
        note: 'A desktop-grade AI-powered learning operating system designed to transform information into deep understanding through structured active recall.',
        pageNumber: 1,
      },
      {
        id: 'cue_hb_2',
        cue: 'How do Citations work?',
        note: 'All AI responses link to chunk coordinates [ref:chunk_id:page]. Clicking a badge scrolls the document viewer directly to the source text.',
        pageNumber: 2,
      },
      {
        id: 'cue_hb_3',
        cue: 'What is BYOK Sovereignty?',
        note: 'Users provide their own API keys (or use local Ollama / built-in heuristics). Keys are encrypted client-side with AES-GCM.',
        pageNumber: 4,
      },
    ],
    summary:
      'Lumora bridges the gap between information abundance and true understanding through grounded document intelligence, 8 active study actions, and sovereign privacy.',
    keyTerms: ['Learning OS', 'SM-2 Spaced Repetition', 'BM25 Retrieval', 'Bidirectional Citations', 'WebCrypto AES-GCM', 'BYOK'],
    updatedAt: new Date().toISOString(),
  };
}

export function getHandbookConceptComparison(documentId: string): ConceptComparisonData {
  return {
    title: 'System Comparison: Generic AI Chatbot vs. Lumora Learning OS',
    conceptAName: 'Generic AI Chatbot',
    conceptBName: 'Lumora Learning OS',
    overview:
      'Contrasting ephemeral chatbot conversations with an integrated, document-anchored learning operating system.',
    rows: [
      {
        attribute: 'Primary Objective',
        conceptA: 'Conversational turns & user engagement',
        conceptB: 'Human conceptual understanding & permanent mastery',
        nuance: 'Lumora measures success by how fast and durably you learn, not screen time.',
      },
      {
        attribute: 'Document Grounding',
        conceptA: 'Context window dumping; prone to hallucinations',
        conceptB: 'Local hybrid semantic indexing with page-exact bidirectional citations',
        nuance: 'Every claim is verifiable with a 1-click jump to the highlighted text.',
      },
      {
        attribute: 'Study Tools',
        conceptA: 'None (User must prompt-engineer study materials)',
        conceptB: 'Native SM-2 Flashcards, Adaptive Quizzes, Cornell Notes, Timelines',
        nuance: 'Zero prompt engineering needed; 1-click specialized study action runners.',
      },
      {
        attribute: 'Data Privacy',
        conceptA: 'Cloud storage of chat logs and documents',
        conceptB: 'Strict Local-First storage; AES-GCM client key vault; Ollama support',
        nuance: 'Your documents and keys stay in your personal perimeter.',
      },
    ],
    synthesis:
      'While generic chatbots generate text for passive consumption, Lumora engages the human brain through structured active recall, grounded verification, and distraction-free desktop ergonomics.',
  };
}

export function getHandbookTimeline(documentId: string): TimelineEvent[] {
  return [
    {
      id: 'tl_hb_1',
      dateOrStage: 'Phase 1: Ingestion',
      title: 'Ingest Source Material',
      description: 'Upload PDF, DOCX, Markdown, OCR image, or YouTube video link into your local workspace.',
      pageNumber: 1,
      chunkId: 'chk_doc_lumo_0',
    },
    {
      id: 'tl_hb_2',
      dateOrStage: 'Phase 2: Deconstruction',
      title: 'Generate Summary & ELI5 / Advanced Breakdown',
      description: 'Use Lumora Study Actions to distill core mental models and explore mechanisms with verified citations.',
      pageNumber: 2,
      chunkId: 'chk_doc_lumo_1',
    },
    {
      id: 'tl_hb_3',
      dateOrStage: 'Phase 3: Active Retrieval',
      title: 'Practice with SM-2 Flashcards & Adaptive Quizzes',
      description: 'Test recall, score difficulty, and diagnose knowledge gaps with instant feedback.',
      pageNumber: 3,
      chunkId: 'chk_doc_lumo_2',
    },
    {
      id: 'tl_hb_4',
      dateOrStage: 'Phase 4: Synthesis & Export',
      title: 'Export Cornell Notes & Study Guides',
      description: 'Download pristine Markdown, Anki decks, or print styled study guides for permanent retention.',
      pageNumber: 4,
      chunkId: 'chk_doc_lumo_3',
    },
  ];
}

export function getHandbookMindMap(documentId: string): MindMapNode {
  return {
    id: 'mm_hb_root',
    label: 'Lumora Learning Operating System',
    description: 'Complete architecture for turning information into understanding',
    pageNumber: 1,
    children: [
      {
        id: 'mm_hb_pipe',
        label: '1. The 6-Stage Learning Funnel',
        pageNumber: 1,
        children: [
          { id: 'mm_hb_p1', label: 'Information (Local Extraction & OCR)', pageNumber: 1 },
          { id: 'mm_hb_p2', label: 'Understanding (Deconstruction & Citations)', pageNumber: 2 },
          { id: 'mm_hb_p3', label: 'Practice (Active Recall Flashcards & Quizzes)', pageNumber: 3 },
          { id: 'mm_hb_p4', label: 'Retention (SM-2 Spaced Repetition)', pageNumber: 3 },
          { id: 'mm_hb_p5', label: 'Application (Cornell Notes & Concept Matrices)', pageNumber: 3 },
          { id: 'mm_hb_p6', label: 'Mastery (Fluency & Pristine Export)', pageNumber: 4 },
        ],
      },
      {
        id: 'mm_hb_doc',
        label: '2. Document Intelligence Engine',
        pageNumber: 2,
        children: [
          { id: 'mm_hb_chunk', label: 'Semantic Chunking (400-800 Tokens)', pageNumber: 2 },
          { id: 'mm_hb_hybrid', label: 'Hybrid BM25 + Dense Vector Indexing', pageNumber: 2 },
          { id: 'mm_hb_cite', label: 'Bidirectional Citation Coordinate Jumps', pageNumber: 2 },
        ],
      },
      {
        id: 'mm_hb_byok',
        label: '3. Sovereign Privacy & BYOK Vault',
        pageNumber: 4,
        children: [
          { id: 'mm_hb_aes', label: 'WebCrypto AES-GCM (256-Bit) Local Encryption', pageNumber: 4 },
          { id: 'mm_hb_prov', label: 'OpenRouter / Claude / OpenAI / Groq / Ollama', pageNumber: 4 },
          { id: 'mm_hb_auth', label: 'Progressive Auth (Zero-Wall Launch)', pageNumber: 4 },
        ],
      },
    ],
  };
}
