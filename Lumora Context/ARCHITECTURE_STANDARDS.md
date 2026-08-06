# ARCHITECTURE STANDARDS — LUMORA

> **Document Version:** 1.0.0  
> **Status:** Authoritative Architectural Blueprint  
> **Target:** System Architects, Backend/Frontend Engineers, AI Agents

---

## 1. High-Level System Architecture

Lumora is engineered as a **hybrid local-first learning operating system**. It combines a high-performance Next.js frontend with an asynchronous Python FastAPI document intelligence engine, backed by local/cloud dual-mode persistence.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       LUMORA ARCHITECTURAL TOPOLOGY                         │
└─────────────────────────────────────────────────────────────────────────────┘

                          CLIENT BROWSER / DESKTOP (Tauri)
  ┌─────────────────────────────────────────────────────────────────────────┐
  │  Next.js 15+ App Router / React 19 / TypeScript / Tailwind CSS          │
  │                                                                         │
  │  ┌───────────────────────────────────────────────────────────────────┐  │
  │  │                       TRI-PANE WORKSPACE UI                       │  │
  │  │  ┌─────────────────┬─────────────────────────┬──────────────────┐ │  │
  │  │  │ Workspace Nav   │ Document Canvas / Reader│ Study Inspector  │ │  │
  │  │  │ & Projects Tree │ & Interactive AI Studio │ & Flashcard/Quiz │ │  │
  │  │  └─────────────────┴─────────────────────────┴──────────────────┘ │  │
  │  └───────────────────────────────────────────────────────────────────┘  │
  │                                                                         │
  │  ┌─────────────────────────┐  ┌──────────────────────────────────────┐  │
  │  │ Client State (Zustand)  │  │ Server Cache (TanStack Query)        │  │
  │  └─────────────────────────┘  └──────────────────────────────────────┘  │
  │  ┌─────────────────────────┐  ┌──────────────────────────────────────┐  │
  │  │ Local DB (IndexedDB/Dexie)│ │ Key Vault (WebCrypto AES-GCM)        │  │
  │  └─────────────────────────┘  └──────────────────────────────────────┘  │
  └────────────────────────────────────┬────────────────────────────────────┘
                                       │ HTTP / SSE / WebSocket
                                       ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │                      FASTAPI INTELLIGENCE BACKEND                       │
  │                                                                         │
  │  ┌────────────────────────┐  ┌───────────────────────────────────────┐  │
  │  │ Document Parser Hub    │  │ Semantic Chunking & Indexing Engine   │  │
  │  │ (PDF, DOCX, MD, OCR)   │  │ (BM25 + Dense Vector Embeddings)      │  │
  │  └────────────────────────┘  └───────────────────────────────────────┘  │
  │  ┌────────────────────────┐  ┌───────────────────────────────────────┐  │
  │  │ Hybrid Retrieval (RRF) │  │ BYOK Multi-Provider LLM Gateway       │  │
  │  │ Context Window Packager│  │ (Anthropic, OpenRouter, OpenAI, Groq) │  │
  │  └────────────────────────┘  └───────────────────────────────────────┘  │
  └─────────────┬───────────────────────────┬───────────────────────────────┘
                │                           │
                ▼                           ▼
  ┌───────────────────────────┐   ┌─────────────────────────────────────────┐
  │    DATA & CACHE LAYER     │   │         EXTERNAL / LOCAL AI             │
  │  • PostgreSQL + pgvector  │   │  • Cloud: OpenRouter / Anthropic /      │
  │  • SQLite (Local Mode)    │   │           OpenAI / Gemini / Mistral/Groq│
  │  • Redis (Hash Cache)     │   │  • Local: Ollama / LM Studio / vLLM     │
  │  • Cloudflare R2 Storage  │   └─────────────────────────────────────────┘
  └───────────────────────────┘
```

---

## 2. The Document Intelligence Pipeline

The document engine operates on a deterministic, immutable pipeline. Documents are fingerprinted with **SHA-256 hashes**; identical files are never re-processed.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   DOCUMENT PROCESSING & RETRIEVAL PIPELINE                  │
└─────────────────────────────────────────────────────────────────────────────┘

  [1. Upload & Hash]
       │ Compute SHA-256 hash. If hash exists in Redis/DB cache, return index.
       ▼
  [2. MIME & Format Detection]
       │ Distinguish native PDF, scanned PDF, DOCX, TXT, MD, Images, YouTube.
       ▼
  [3. Extraction & OCR Arbiter]
       │ • Extract native text streams with layout coordinates (PyMuPDF).
       │ • If text density < 0.05 chars/px² -> Trigger asynchronous OCR (Surya/Tesseract).
       ▼
  [4. Structural Normalization]
       │ Normalize Unicode, strip running headers/footers, preserve tables & LaTeX.
       ▼
  [5. Semantic Chunking Engine]
       │ • Size: 400 - 800 tokens (~1800 - 3200 characters).
       │ • Overlap: 10% (40 - 80 tokens) across chunk boundaries.
       │ • Boundary Rule: Splits strictly on headers (H1/H2/H3), paragraphs, or sentences.
       ▼
  [6. Dual Index Construction]
       │ ├─ Lexical Index: BM25 with Okapi BM25+ tokenization.
       │ ├─ Semantic Index: Dense vector embeddings (1536-dim or 384-dim local).
       │ └─ Coordinate Map: Page numbers, paragraph offsets, bounding boxes.
       ▼
  [7. Hybrid Retrieval with Reciprocal Rank Fusion (RRF)]
       │ $RRF\_Score(d) = \sum_{m \in \{BM25, Dense\}} \frac{1}{60 + \text{Rank}_m(d)}$
       │ Merges keyword precision with conceptual semantic matches.
       ▼
  [8. Context Window Optimizer]
       │ Deduplicates chunks, sorts by narrative order, strictly caps to token budget.
       ▼
  [9. Grounded Generation & Citation Anchoring]
       │ Emits streaming response with exact `[ref:chunk_id:page_num]` anchors.
```

---

## 3. Frontend Architecture Standards

```
src/
├── app/                         # Next.js App Router (Layouts, routes, metadata)
│   ├── layout.tsx               # Root shell, font injection, theme script
│   ├── page.tsx                 # Workspace entry (Instant local workspace)
│   └── globals.css              # Theme CSS custom properties & base tokens
│
├── features/                    # Encapsulated Domain Modules
│   ├── workspace/               # Project management, workspace tree, collections
│   ├── document-viewer/         # PDF/DOCX/MD virtualized renderers, citation highlights
│   ├── study-actions/           # Summaries, flashcard runners, quiz engines, Cornell notes
│   ├── ai-chat/                 # Grounded reasoning thread, prompt bar, citation popovers
│   ├── byok-vault/              # Client-side encrypted key manager & provider switcher
│   └── export-engine/           # Pristine Markdown, LaTeX, and PDF document generator
│
├── shared/                      # Universally Shared Primitives
│   ├── components/              # Button, Modal, Tooltip, SplitPane, Dropdown
│   ├── icons/                   # Custom SVG icon set (IconDocument, IconFlashcard, etc.)
│   ├── hooks/                   # useTheme, useKeyboardShortcut, useDebounce
│   ├── lib/                     # API client, WebCrypto helpers, Zod validation
│   └── types/                   # Universal domain primitives (User, Project, Source)
```

### Virtualized Document Rendering
- The Document Viewer **must** virtualize multi-page documents (rendering only visible page buffers + 1 page lookahead) to guarantee 60fps scrolling on 1,000+ page textbooks.
- Highlights and bounding boxes are rendered as SVG overlay layers mapped to fractional viewport coordinates $(x, y, w, h)$.

---

## 4. Backend Service Layer Architecture

The FastAPI backend follows a strict **Clean Architecture / Dependency Injection** pattern:

```
backend/
├── app/
│   ├── api/v1/                  # HTTP Router Endpoints (Thin controllers)
│   │   ├── documents.py
│   │   ├── study.py
│   │   ├── search.py
│   │   └── providers.py
│   ├── core/                    # Application configuration & security
│   │   ├── config.py
│   │   └── security.py
│   ├── domain/                  # Pure Business Logic & Domain Models
│   │   ├── models/              # Pydantic schemas (Document, Chunk, Flashcard, Quiz)
│   │   └── services/            # Pure domain services (SpacedRepetition, Chunking)
│   ├── infrastructure/          # External System Adapters
│   │   ├── parsers/             # PyMuPDF, DOCX, Surya OCR, Whisper
│   │   ├── vector_store/        # pgvector, Chroma, BM25s
│   │   ├── llm_gateways/        # OpenRouter, Anthropic, OpenAI, Groq, Ollama
│   │   └── repositories/        # Postgres / SQLite async database repositories
│   └── main.py                  # FastAPI Application Factory
```

---

## 5. Storage & Persistence Tiers

| Tier | Technology | Data Stored | Strategy |
| :--- | :--- | :--- | :--- |
| **Tier 1: Client Local Storage** | IndexedDB / Dexie.js | Workspace state, cached documents, active study decks | Local-first; fully operational offline |
| **Tier 2: Relational DB** | PostgreSQL 16 / SQLite | User accounts, project hierarchies, metadata, study logs | ACID compliant, migration-managed |
| **Tier 3: Vector & Lexical Store** | pgvector / ChromaDB + BM25s | Document semantic embeddings & BM25 inverted indexes | HNSW index for sub-10ms similarity queries |
| **Tier 4: Object Storage** | Cloudflare R2 / Supabase | Raw uploaded PDF/DOCX files, audio recordings | S3-compatible, immutable content-addressed storage |
| **Tier 5: Transient Cache** | Redis 7.x | SHA-256 preprocessed hashes, rate limits, SSE buffers | LRU eviction, sub-millisecond retrieval |

---
*End of Architecture Standards.*
