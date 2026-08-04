# Lumora — Database

Source of truth: [`prisma/schema.prisma`](../prisma/schema.prisma).

## Engine

- **Dev:** SQLite (`file:./dev.db`) — zero setup, file-based, perfect for local
  runs and the sandbox demo.
- **Prod:** PostgreSQL — change `datasource db.provider` to `"postgresql"`, set
  `DATABASE_URL`, then `npx prisma db push` (or generate a migration with
  `npx prisma migrate dev`). The data model is fully portable; no schema edits
  are required.

## Entity map

```text
User 1──N Document 1──1 Curriculum 1──N Module 1──N Lesson 1──N Concept
                                                    └─────── 1──N Quiz
                      Curriculum 1──N Flashcard (SM-2 state on the card)
User 1──N UserProgress (per lesson: completed, score, attempts, lastStudied)
User 1──N MasteryRecord (per quiz or concept: EMA score, attempts, mastered)
User 1──N ReviewLog (activity ledger → streaks + analytics)
User 1──N StudySession (session analytics, Phase 3)
```

## Traceability

`SourceChunk` is the citation unit: `{ index, text, section, page, startChar,
endChar }`. `Lesson`, `Concept`, `Quiz`, and `Flashcard` all carry
`sourceChunkId` (FK) and `sourceRef` (human-readable, e.g. `§ How Memory Works`
or `§ p.3`). The `Document.structure` JSON preserves the heading outline so
regeneration doesn't lose structure.

## SRS state (SM-2)

On `Flashcard`: `repetitions`, `interval` (days), `easeFactor`, `dueDate`,
`lastReviewedAt`. Transitions in `src/lib/srs.ts`:

| Rating | repetitions | interval | ease |
| --- | --- | --- | --- |
| again | 0 | 0 | −0.20 (floor 1.3) |
| hard | +1 | max(1, 1.2×) | −0.15 |
| good | +1 | 1 → 3 → ×ease | +0.02 |
| easy | +1 | 3 → 7 → ×ease×1.3 | +0.08 |

## Mastery math

- Quiz answer → `MasteryRecord.score` = EMA of outcomes (recent-weighted, α=0.4).
- `mastered = score ≥ 0.85`.
- Lesson score = mean of its quiz records; module = mean of lessons' quizzes;
  curriculum = mean of modules (recomputed on each answer via
  `refreshMastery`).
- Flashcard ratings nudge linked-concept mastery by ±0.05–0.18.

## Notes

- Enums are stored as `String` (SQLite limitation); validated in services.
- `@@unique([userId, quizId])` / `@@unique([userId, conceptId])` on
  `MasteryRecord` support idempotent upserts.
- `ReviewLog.kind ∈ {quiz, flashcard, lesson}` and `rating ∈ {again, hard,
  good, easy}`.
