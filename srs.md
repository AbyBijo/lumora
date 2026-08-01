# Lumora — Software Requirements Specification (SRS)

Version 1.0 (MVP) · Mirrors the data model in `prisma/schema.prisma`

## 1. System context

Lumora is a Next.js 14 application (App Router, TypeScript, Tailwind) with a
Prisma data layer. It is a **single application** (frontend + API routes in the
same server), designed so the backend can later split out (FastAPI service per
the master context direction) without changing the product surface.

## 2. Actors

- **Learner (User)** — uploads documents, studies, reviews flashcards.
- **Engine (Local/Remote)** — parses, generates curriculum, schedules reviews.

## 3. Entities (from schema)

- `User`, `UserSettings` — identity, theme/provider prefs.
- `Document` — source; `SourceChunk` — traced slices (section/page/char range).
- `Curriculum` → `Module` → `Lesson` → `Concept` / `Quiz`.
- `Flashcard` — carries SM-2 state (repetitions, interval, easeFactor, dueDate).
- `UserProgress` — per (user, lesson): completed, score, attempts, lastStudied.
- `MasteryRecord` — per (user, quiz|concept): score (EMA), attempts, mastered.
- `ReviewLog` — activity ledger (streaks, analytics).
- `StudySession` — reserved for session-level analytics.

## 4. Functional requirements (detailed)

### 4.1 Ingestion
- Accept multipart file upload (PDF/DOCX/TXT/MD) or JSON `{url}` / `{content}`.
- Enforce a 15 MB size cap and human-readable errors (e.g., scanned PDFs).
- Produce: title, blocks (heading outline), chunks (index, text, section, page),
  word count. Persist structure for later regeneration.

### 4.2 Generation pipeline
`POST /api/documents/[id]/generate` → local engine or provider → persist via
`createCurriculumFromResult` in one transaction. Every generated item stores
`sourceRef` and `sourceChunkId`.

### 4.3 Study
- `POST /api/quizzes/[id]/answer`:
  - MCQ/fill-blank: normalized exact match; short-answer: ≥60% word overlap.
  - Update `MasteryRecord` (EMA), roll lesson `UserProgress`, log `ReviewLog`,
    recompute module + curriculum mastery.
- `POST /api/lessons/[id]/complete` — mark completion, log activity.

### 4.4 SRS
- `POST /api/flashcards/[id]/review {rating}` — SM-2 transition
  (again/hard/good/easy), persist new interval/ease/due; log; fold outcome into
  linked-concept mastery.
- `GET /api/flashcards/due?curriculumId&mode=review|cram` — due-first ordering
  (review) or all-cards (cram).

### 4.5 Dashboard & analytics
- `GET /api/dashboard` — stats, mastery, streak, due-by-day, weak areas,
  recent activity, curricula with progress.
- Streak = consecutive activity days (today or yesterday anchored).

## 5. Non-functional requirements

- **Traceability** — no generated claim without a source reference; the local
  engine guarantees it structurally; the LLM path validates via zod and
  resolves `§ [n]` chunk refs.
- **Performance** — curriculum generation completes in seconds for typical
  documents; dashboard queries bounded (500 latest logs).
- **Security** — httpOnly/sameSite session cookie; no secrets in the client;
  provider keys server-side only.
- **Accessibility** — keyboard operable, focus rings, aria roles on key widgets.
- **Responsive** — works from mobile to desktop; sidebar collapses.

## 6. Constraints & assumptions

- SQLite in dev (PostgreSQL-ready schema). Local engine by default; provider
  keys optional.
- No streaming UI yet for generation (pipeline steps animate client-side while
  the request runs).
