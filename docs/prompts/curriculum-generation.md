# Prompt library — Curriculum generation

See the production asset at [`prompts/curriculum.md`](../../prompts/curriculum.md)
and the code at `src/engine/prompts.ts`.

## Prompting principles (Lumora)

1. **Grounding beats instruction.** The prompt forces `sourceRef` on every item
   and passes the document as numbered chunks. Uncited claims are structurally
   rejected downstream (zod + ref resolution).
2. **Structured output.** One JSON schema for the entire curriculum; validated
   before persistence.
3. **Fallbacks everywhere.** Any provider failure or schema violation falls
   back to the Local Engine rather than failing the user.
4. **Learning science in the prompt.** Modules ordered to build understanding;
   lessons carry objectives; questions are active-recall by design.

## Local Engine (no LLM) behavior

When no provider key is set, `assembleCurriculum()` reproduces the same output
contract deterministically:

- Modules from the document's top-level headings; lessons from sub-headings.
- Concepts from ranked noun phrases + definitional sentences.
- Quizzes: MCQ (distractors = other real definitions), fill-blank,
  short-answer.
- Flashcards: one per concept.
