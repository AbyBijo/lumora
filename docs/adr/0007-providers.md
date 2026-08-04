# ADR 0007 — Model-agnostic provider gateway

- **Status:** Accepted
- **Date:** 2026-08-01
- **Context:** Master context §11–12: model-agnostic, OpenRouter-as-gateway
  (never direct from frontend), provider health, fallback, structured output.
- **Decision:** A `Provider` interface (`available()`, `generateJson()`)
  implemented by OpenAI and Anthropic adapters, registered in
  `src/engine/llm/`. Generation requests resolve the best provider and **fall
  back to the Local Engine** on any failure. The UI and services never call a
  provider directly.
- **Consequences:** Adding OpenRouter/Ollama/Gemini = one new adapter file.
  Structured JSON output is enforced by prompt + zod validation, and `§ [n]`
  chunk refs are resolved back to `SourceChunk` ids.
