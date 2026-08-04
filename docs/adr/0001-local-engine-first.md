# ADR 0001 — Local engine first, LLMs as an upgrade

- **Status:** Accepted
- **Date:** 2026-08-01
- **Context:** Lumora must be runnable with zero configuration and no API keys.
  The master context mandates model-agnosticism, no fabricated citations, and
  no vendor lock-in. Chat-first competitors rely on LLMs; we needed generation
  that is deterministic and structurally source-grounded.
- **Decision:** Ship a **Local Engine** (`src/engine/`) as the default
  generator. It parses the document, uses its own heading outline for
  structure, extracts concepts from definitional sentences, and builds
  questions whose answers/distractors are verbatim source passages. If
  `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` is configured, the LLM path is used
  (with zod validation and chunk-ref resolution), falling back to Local on any
  error.
- **Consequences:** Zero-friction onboarding and auditable generation. LLM
  output quality is bounded by the prompt + validation; the Local Engine can
  never hallucinate because it only rewrites the source.
