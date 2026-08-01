# Lumora — Architecture

## 1. High-level view

```text
┌──────────────────────────── Next.js 14 (App Router) ───────────────────────────┐
│                                                                                 │
│  Pages (RSC)          Client components          API Routes                     │
│  ┌────────────┐      ┌──────────────────┐      ┌───────────────────────┐        │
│  │ landing    │      │ quiz-runner      │      │ /api/documents        │        │
│  │ dashboard  │      │ deck (SRS)       │      │ /api/documents/[id]/… │        │
│  │ curricula  │      │ pipeline (steps) │ ───► │ /api/quizzes/[id]/…   │        │
│  │ study      │      │ dropzone         │      │ /api/flashcards/…     │        │
│  │ flashcards │      │ mastery-ring     │      │ /api/dashboard        │        │
│  │ mastery    │      └──────────────────┘      └───────────┬───────────┘        │
│  │ settings   │                                           │                    │
│  └────────────┘                                           ▼                    │
│                     ┌─────────────────────────────────────────────┐             │
│                     │ Services (src/lib/services)                 │             │
│                     │  curriculum · study · analytics             │             │
│                     └──────────────────────┬──────────────────────┘             │
│                                            ▼                                    │
│                     ┌─────────────────────────────────────────────┐             │
│                     │ Engine (src/engine) — pure, framework-free  │             │
│                     │  parse → chunker → concepts → quizzes →     │             │
│                     │  curriculum → LLM gateway (local/openai/    │             │
│                     │  anthropic)                                 │             │
│                     └──────────────────────┬──────────────────────┘             │
│                                            ▼                                    │
│                     ┌─────────────────────────────────────────────┐             │
│                     │ Prisma → SQLite (dev) / PostgreSQL (prod)   │             │
│                     └─────────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 2. Layering rules

- **Route handlers** are thin: auth + validation + delegate to services.
- **Services** orchestrate and own business logic (study, mastery, analytics).
- **Engine** is pure and framework-free: data in → `GenerationResult` out.
  Never touches the database or HTTP.
- **LLM gateway** isolates providers; the UI never calls a provider directly.

## 3. The generation pipeline (data flow)

```text
Upload (multipart | url | paste)
  → parseDocument()          → ParsedDocument { title, blocks, chunks, outline }
  → create Document + SourceChunks (+ structure JSON)
  → POST /generate
      → generateCurriculum(parsed, { prefer })   // local | openai | anthropic
      → GenerationResult { curriculum, flashcards, meta }
  → createCurriculumFromResult()  // one transaction
      → Curriculum/Modules/Lessons/Concepts/Quizzes/Flashcards
      → each item linked to sourceChunkId + sourceRef
```

## 4. Study loop data flow

```text
answerQuiz()
  → grade (normalized / overlap)
  → MasteryRecord upsert (EMA, mastered ≥0.85)
  → UserProgress roll (score, attempts, completed when all answered)
  → ReviewLog (streak)
  → refreshMastery() → Module.masteryScore → Curriculum.masteryScore

reviewFlashcard()
  → SM-2 transition (again/hard/good/easy)
  → Flashcard state + ReviewLog
  → linked Concept MasteryRecord step update
```

## 5. Module map

| Module | Responsibility |
| --- | --- |
| `src/engine/parse.ts` | PDF (pdf.js per-page), DOCX (mammoth), TXT/MD, URL (HTML→text) |
| `src/engine/chunker.ts` | heading detection → blocks → ~900-char sentence-boundary chunks |
| `src/engine/concepts.ts` | noun-phrase ranking + definitional-sentence harvesting |
| `src/engine/quizzes.ts` | MCQ/fill-blank/short-answer from source sentences; doc-wide distractors |
| `src/engine/curriculum.ts` | heading-aware module/lesson assembly (proportional fallback) |
| `src/engine/llm/` | provider registry + OpenAI/Anthropic adapters (JSON output) |
| `src/lib/srs.ts` | SM-2 core (pure) |
| `src/lib/services/*` | persistence + orchestration |
| `src/components/study|flashcards|upload|curriculum/*` | interactive UX |

## 6. Traceability model

`SourceChunk { index, text, section, page }` is the unit of citation.
Generated items store `sourceChunkId` (FK) + a human-readable `sourceRef`
(“§ How Memory Works”, “§ p.3”, “§ chunk 5”). The UI shows the passage verbatim
in the feedback panel — the strongest possible anti-hallucination guarantee.

## 7. Deployment notes

- Frontend+API: Vercel-compatible (Next.js). For Phase 2, the engine can move
  to a worker (Redis/BullMQ) and the backend can split to FastAPI per the
  master context stack direction.
- DB: Postgres via Railway/Render; set `DATABASE_URL` and provider to
  `postgresql`. See `docs/adr/0002-db.md`.
- Secrets: provider keys server-side only (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`).
