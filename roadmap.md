# Lumora — Roadmap

Status: MVP (Phase 1) delivered. Order reflects learning value, not effort.

## Phase 1 — MVP ✅ (this repository)

- [x] Document upload: PDF, DOCX, TXT, Markdown, web URL, paste
- [x] AI parsing with section/page traceable chunks
- [x] Curriculum generation: modules → lessons → objectives → concepts
- [x] Quiz generation per lesson (MCQ / fill-blank / short-answer)
- [x] Flashcards + SM-2 spaced repetition (review & cram modes)
- [x] Mastery dashboard: ring, per-module bars, weak areas, streaks, activity
- [x] Source traceability everywhere (“view in source”)
- [x] Local demo auth (NextAuth/Clerk seam documented)
- [x] Dark mode first + light mode, keyboard shortcuts, responsive, empty states

## Phase 2 — Core depth

- [ ] **Real auth** — NextAuth (OAuth + email) or Clerk; replace demo session
      at the documented seam (`src/lib/auth.ts`).
- [ ] **DOCX/PDF polish** — styling-aware extraction (headings, bold, lists);
      scanned-PDF OCR via Tesseract/cloud vision.
- [ ] **Practice sets & mastery checks** — per-module comprehensive assessments
      (the spec's third question type).
- [ ] **Async processing** — Redis + BullMQ worker for large documents; pipeline
      progress over websockets/SSE.
- [ ] **Export** — Markdown and PDF export of curriculum + cards.
- [ ] **Object storage** — S3/R2 for original files (large uploads).
- [ ] **Settings depth** — provider/model picker end-to-end, temperature,
      memory preferences, privacy mode.

## Phase 3 — Learning depth

- [ ] **Advanced analytics** — forgetting-curve visualization, retention
      forecasts, time-to-mastery, spaced-repetition quality metrics.
- [ ] **Cram mode v2** — weak-area-first decks, priority scoring.
- [ ] **Search** — hybrid retrieval (keyword + vector) over chunks; reranker;
      “ask your document” with citations (NotebookLM-style, but learning-first).
- [ ] **Audio/lecture/YouTube ingestion** — transcripts → curriculum.
- [ ] **Notes** — per-lesson note capture, markdown export.

## Phase 4 — Ecosystem

- [ ] Collaborative workspaces & study groups
- [ ] Public curriculum marketplace
- [ ] Mobile app (React Native / PWA)
- [ ] API for integrations
- [ ] Browser extension (clip web pages into Lumora)

## Backlog / ideas vault

- Mind maps & concept maps, interactive diagrams, timeline generation
- AI tutor mode, research assistant, writing assistant
- Knowledge graph of concepts across documents
- Offline mode, desktop app, plugins

## Non-goals (unchanged)

Personalization research, monetization mechanics, gamification beyond streaks,
white-labeling.
