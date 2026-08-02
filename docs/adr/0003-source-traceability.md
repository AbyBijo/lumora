# ADR 0003 — Source chunks as the citation unit

- **Status:** Accepted
- **Date:** 2026-08-01
- **Context:** The core differentiator is that every generated claim is
  traceable. Options: page numbers only (fragile), full-text spans (heavy),
  or chunk ids.
- **Decision:** Introduce `SourceChunk { index, text, section, page }` as the
  unit of citation. Every `Lesson`, `Concept`, `Quiz`, and `Flashcard` stores
  `sourceChunkId` (FK) + human-readable `sourceRef`. The UI renders the source
  passage verbatim in feedback panels.
- **Consequences:** Guaranteed resolvability of every citation; "View in
  source" is a simple FK lookup; the Local Engine structurally cannot produce
  an uncited claim. Chunking is sentence-boundary-aware (~900 chars) so
  passages stay readable.
