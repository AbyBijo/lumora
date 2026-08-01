# Lumora — Product Requirements Document (PRD)

Status: MVP (Phase 1) · Version 1.0 · Source: master context + product spec

## 1. Problem

People upload documents to AI chat tools, get a conversation, and walk away
with **answers but not understanding**. Retrieval is a chat artifact; retention
is left to the user. Lumora fixes this by making the *learning system* the
product: curriculum, active recall, spaced repetition, and mastery — all
source-grounded.

## 2. Target users

- Primary: students, college students, self-learners, researchers.
- Secondary: professionals, developers, teachers, content creators, teams.

## 3. MVP scope (Phase 1)

Must-have:

1. **Document upload** — PDF, TXT (plus DOCX, Markdown, web URL in this build).
2. **AI parsing** — text extraction, structure (headings), concept extraction.
3. **Curriculum generation** — modules, lessons, objectives, concepts.
4. **Quiz generation per lesson** — MCQ, fill-blank, short-answer.
5. **Flashcards** — one per concept, SM-2 scheduled.
6. **Simple SRS** — daily review queue, review + cram modes.
7. **Mastery dashboard** — overall + per-module mastery, weak areas, streaks.
8. **Source traceability** — citations and “view in source” on every item.
9. **User auth** — MVP: local demo session (seam is NextAuth/Clerk-ready).

Explicitly out of scope for MVP: collaborative workspaces, public marketplace,
mobile apps, OCR of scanned images, audio/lecture ingestion, mind maps,
interactive diagrams, offline mode.

## 4. User flows

### Flow 1: Upload → Curriculum
1. User uploads a document (or URL/paste).
2. System parses into source chunks with section/page refs.
3. Engine generates the curriculum structure.
4. User reviews the draft and approves (or edits).
5. Flashcards, quizzes are ready; learning path begins.

### Flow 2: Study session
1. User opens a lesson (or “Continue learning”).
2. Reads objectives + guided content.
3. Starts the quiz → answers → instant feedback + source panel.
4. Mastery records update; SM-2 schedules concept reviews.
5. Progress lands on the dashboard.

### Flow 3: Mastery review
1. Dashboard shows overall mastery, weak areas, upcoming reviews.
2. User drills into modules, uses Cram mode on weak areas, Review mode on due cards.

## 5. Functional requirements (condensed)

| ID | Requirement | Acceptance |
| --- | --- | --- |
| FR-1 | Upload PDF/DOCX/TXT/MD/URL | Parses to chunks; errors are human-readable |
| FR-2 | Curriculum generation | Modules→lessons→concepts→quizzes persist; every item has sourceRef |
| FR-3 | Active recall | Every lesson has ≥3 questions; MCQ distractors come from the same document |
| FR-4 | SRS | SM-2 state per card; due queue; review & cram modes |
| FR-5 | Mastery | Quiz answers update mastery records; module/curriculum scores roll up |
| FR-6 | Traceability | Quizzes/flashcards/concepts expose sourceRef + source passage |
| FR-7 | Auth | Session cookie; demo user; swap-in seam documented |
| FR-8 | UX | Dark-mode-first, responsive, empty states that teach, loading states with tips |

## 6. Success metrics

- Retention rate: % of concepts mastered after 30 days.
- Completion rate: % of users finishing a curriculum.
- Study streak: average consecutive days.
- Time to mastery: average time to reach 80% module mastery.
- Source trust score: user confidence survey.

## 7. Non-goals for MVP

Personalization algorithms, social features, monetization, mobile apps,
marketplace, advanced analytics (beyond dashboard), white-labeling.
