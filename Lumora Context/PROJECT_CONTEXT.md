# PROJECT CONTEXT — LUMORA

> **Document Version:** 1.0.0  
> **Status:** Authoritative Technical & Domain Specification  
> **Product Name:** Lumora (Learning Operating System)

---

## 1. Project Background & Taxonomy

**Lumora** is an AI-powered learning workspace designed to bridge the cognitive gap between information accumulation and conceptual mastery. 

Unlike conventional chatbots (which optimize for generic conversational turns) or static document managers (which store files without deep semantic interpretation), Lumora functions as a **complete learning operating system**. It marries high-throughput local document parsing with context-aware AI reasoning, pedagogical active recall tools, and desktop-grade user interface engineering.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           THE SYSTEM TAXONOMY                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  CATEGORY                 │  DESCRIPTION                                    │
├───────────────────────────┼─────────────────────────────────────────────────┤
│  Product Archetype        │  Learning Operating System (LOS)                │
│  Primary Modality         │  Document-Centric Reasoning & Study Workspace   │
│  Interaction Philosophy   │  Calm, Desktop-Grade, Keyboard-Driven           │
│  Privacy & Data Model     │  Local-First, Zero-Telemetry Bias, BYOK         │
│  Target Ecosystem         │  Web (Next.js), Desktop (Tauri/Electron Future) │
└───────────────────────────┘
```

---

## 2. Competitive & Conceptual Landscape

To ensure Lumora maintains its unique market position, its core differentiators against existing market categories are strictly defined:

```
                  ┌─────────────────────────────────────────┐
                  │          LUMORA DIFFERENTIATION         │
                  └─────────────────────────────────────────┘
```

| Dimension | Generic Chatbots (ChatGPT, Claude) | NotebookLM Clone | Knowledge Bases (Notion, Obsidian) | **Lumora** |
| :--- | :--- | :--- | :--- | :--- |
| **Core Object** | Ephemeral Conversation Stream | Raw Cloud Document Ingestion | Static Markdown / Database Pages | **The Structured Learning Session** |
| **Document Processing** | Context Window Dumping | Blackbox Cloud Ingestion | Manual user structuring | **Local Multi-Format Pipeline + Semantic Chunking** |
| **Pedagogical Engine** | None (User must prompt-engineer) | Audio summaries & basic QA | Passive note-taking | **Native Flashcards, Quizzes, Concept Trees, ELI5/Adv** |
| **Data Privacy** | Cloud-stored chat transcripts | Cloud-locked documents | Local/Cloud hybrid | **Strict Local-First, BYOK, Zero Unnecessary Cloud** |
| **Aesthetic Feel** | Generic chat window | Minimal web tool | Highly customizable or cluttered | **Warm Light / Dark Desktop Elegance (Arc/Linear feel)** |

---

## 3. Functional Scope & Roadmap Matrix

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                            FEATURE MATRIX BY PHASE                           │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Phase 1: MVP Core (Current Baseline)
- **Local Workspace & Projects:** Unlimited local workspaces, folder hierarchies, project isolation, tagged metadata.
- **Universal Multi-Format Ingestion:** 
  - PDF (Text layer extraction + automatic OCR fallback for scanned images).
  - DOCX (Structural paragraph, heading, and table extraction).
  - Markdown (`.md`, `.mdx`) & Plain Text (`.txt`).
  - Standalone Image OCR (`.png`, `.jpg`, `.webp`).
- **Document Intelligence Engine:** Automated document typing, language identification, semantic chunking (heading-aware, sentence-boundary preserving), BM25 + Vector embedding index, persistent cache.
- **Tri-Pane Workspace UI:** 
  - Left Pane: Workspace tree, projects, recent files, collections.
  - Center Pane: High-fidelity document viewer + interactive AI chat/canvas.
  - Right Pane: Inspector, grounded citations, study progress, active study actions.
- **Pedagogical Study Actions:**
  - *Summarize:* Executive, structural, and chapter-level synthesis.
  - *Explain:* Dual-mode (ELI5 / Foundational vs. Rigorous / Advanced).
  - *Flashcards:* Active-recall card generation with spaced-repetition metadata.
  - *Quiz:* Adaptive multiple-choice and conceptual short-answer test generation.
  - *Notes:* Auto-generated Cornell and hierarchical study notes.
  - *Compare Concepts:* Matrix generation between conflicting or complementary ideas.
- **Verifiable Grounding & Citations:** Page-exact, chunk-exact, and paragraph-anchored citations with instant document view jumps.
- **BYOK Multi-Provider Engine:** OpenRouter, OpenAI, Anthropic, Gemini, Mistral, DeepSeek, Groq.
- **Export Engine:** Pristine Markdown and styled PDF export.
- **Theme Engine:** Smooth-switching Warm Light (default) & Premium Dark tokens.

### Phase 2: Knowledge Expansion & Visual Pedagogy (Post-MVP)
- **Interactive Visualizers:** Concept Maps, Dynamic Knowledge Graphs, Timelines, Infographics.
- **Rich Media Ingestion:**
  - YouTube (Automated caption harvesting with local Whisper fallback; timestamp citations).
  - Audio & Lecture Recordings (Local Whisper speech-to-text with speaker identification).
  - Web URLs & Research Papers (Reader mode cleaner, ArXiv LaTeX-to-Markdown parser).
- **Offline & Local LLM Support:** Ollama, LM Studio, vLLM local endpoint connectors.
- **Learning Analytics:** Retention curves, study velocity, mastery heatmaps.

### Phase 3: Collaborative Ecosystem & Desktop Native
- **Native Applications:** macOS, Windows, Linux native desktop wrappers via Tauri.
- **Collaborative Knowledge Workspaces:** End-to-end encrypted shared workspaces via CRDTs.
- **Plugin System & Extensible Action SDK:** Community study actions and custom parsers.
- **Mobile Companion Apps:** iOS and Android spaced-repetition practice review.

---

## 4. Document Intelligence Pipeline

The central technical heartbeat of Lumora is its **Document Ingestion & Context Orchestration Pipeline**. Documents are never forwarded raw to third-party LLMs.

```
┌──────────────┐
│ User Upload  │
└──────┬───────┘
       │
       ▼
┌────────────────────────────────┐
│   MIME & Content Detection     │ ──> Identifies PDF, DOCX, TXT, MD, Image, Audio, etc.
└──────┬─────────────────────────┘
       │
       ▼
┌────────────────────────────────┐
│ Extraction & OCR Arbiter       │
│  ├─ Extract Text Stream        │
│  └─ Scanned/Image? ──> Run OCR │ ──> Auto-detects unselectable text, runs background OCR.
└──────┬─────────────────────────┘
       │
       ▼
┌────────────────────────────────┐
│ Structural Normalization       │ ──> Cleans headers, footers, whitespace, LaTeX equations.
└──────┬─────────────────────────┘
       │
       ▼
┌────────────────────────────────┐
│ Semantic Chunking Engine       │ ──> Chunks by 400-800 tokens with 10% overlap, respecting
│                                │     section boundaries, headings, and code blocks.
└──────┬─────────────────────────┘
       │
       ▼
┌────────────────────────────────┐
│ Multi-Modal Indexing           │
│  ├─ Lexical Index (BM25)       │ ──> Fast keyword and exact phrase retrieval.
│  ├─ Vector Embeddings (Dense)  │ ──> Semantic similarity indexing.
│  └─ Metadata / Citation Map    │ ──> Stores page #, paragraph offset, and source hash.
└──────┬─────────────────────────┘
       │
       ▼
┌────────────────────────────────┐
│ Hybrid Retrieval & Reranker    │ ──> On user query/action: extracts top-K relevant chunks.
└──────┬─────────────────────────┘
       │
       ▼
┌────────────────────────────────┐
│ Surgical Context Construction  │ ──> Injects only relevant chunks into prompt template.
└──────┬─────────────────────────┘
       │
       ▼
┌────────────────────────────────┐
│ LLM Reasoning Engine (BYOK)    │ ──> Produces grounded response with verifiable citations.
└────────────────────────────────┘
```

---

## 5. Technology Stack & Runtime Topology

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CORE TECHNOLOGY STACK                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Layer | Technologies | Selection Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js (App Router), React 19, TypeScript | Server/Client balance, SSR optimization, enterprise typing. |
| **Styling & Tokens** | Tailwind CSS, Custom CSS Variables, PostCSS | Bespoke Warm Light / Dark design system with zero bloat. |
| **Icons & Visuals** | Custom Lumora SVG System | Avoids generic Lucide/FontAwesome clutter; ensures distinctive brand identity. |
| **Client State** | Zustand, TanStack Query | Lightweight, predictable, fine-grained reactivity. |
| **Backend API** | FastAPI (Python 3.11+), Pydantic v2, Uvicorn | High-throughput async processing, native AI/NLP libraries. |
| **Document Processing** | PyMuPDF (fitz), pdfplumber, python-docx, Tesseract / Surya OCR | High-speed document text and layout extraction. |
| **Retrieval & Vector** | ChromaDB / Qdrant (Local), BM25s, SQLite / PostgreSQL | Robust hybrid search with local-first persistence. |
| **Caching & Queue** | Redis, Celery / ARQ (for long OCR/transcription jobs) | High-speed cache for preprocessed document hashes. |
| **Storage & Sync** | Local FS (default), Cloudflare R2 / Supabase Storage | Low-cost S3-compatible blob storage when cloud sync is on. |
| **Authentication** | Progressive Auth (Local Session $\rightarrow$ Clerk / Auth.js) | Zero login wall on startup; triggers only on cloud backup/sync. |

---
*End of Project Context.*
