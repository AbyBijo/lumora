# AI INTEGRATION RULES — LUMORA

> **Document Version:** 1.0.0  
> **Status:** Mandatory AI Protocol & Interface Standard  
> **Target:** AI Gateway, Prompt Engineers, Study Action Services

---

## 1. Multi-Provider BYOK Gateway Architecture

Lumora decouples the application from any single AI vendor through a unified, hot-swappable **AI Provider Gateway**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      UNIFIED AI PROVIDER INTERFACE                          │
└─────────────────────────────────────────────────────────────────────────────┘

                               Lumora Core
                                   │
                     ┌─────────────▼─────────────┐
                     │    AIProviderAdapter      │
                     │  • stream_completion()    │
                     │  • generate_structured()  │
                     └─────────────┬─────────────┘
                                   │
         ┌──────────────┬──────────┴───┬──────────────┬──────────────┐
         ▼              ▼              ▼              ▼              ▼
   ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐
   │ Anthropic │  │OpenRouter │  │  OpenAI   │  │   Groq    │  │Local LLMs │
   │ (Claude)  │  │(Universal)│  │ (GPT-4o)  │  │ (Llama 3) │  │  (Ollama) │
   └───────────┘  └───────────┘  └───────────┘  └───────────┘  └───────────┘
```

---

## 2. Context Window Budget & Minimality Rules

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       STRICT TOKEN BUDGET ALLOCATION                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  Component                         │  Budget Limit (Tokens)                 │
├────────────────────────────────────┼────────────────────────────────────────┤
│  System Prompt & Persona           │  400 - 600 tokens                      │
│  Retrieved Context Chunks (Top-K)  │  2,000 - 3,500 tokens (Max 6 chunks)   │
│  Conversation History (Recent turns│  500 - 1,000 tokens                    │
│  User Query / Study Action Trigger │  100 - 400 tokens                      │
│  Streaming Generation Reserve      │  1,500 - 4,000 tokens                  │
├────────────────────────────────────┼────────────────────────────────────────┤
│  TOTAL TARGET CONTEXT PER INVOCATION│  < 8,000 tokens (Ultra-fast, low cost)│
└────────────────────────────────────┘
```

---

## 3. Verifiable Citation & Grounding Protocol

AI models must **never** make ungrounded assertions about ingested documents. All responses synthesizing source material must embed precise citation tokens:

### Citation Syntax Standard:
Every factual claim must append an inline citation in the canonical format:
`[^[chunk_id|page_num|offset_start:offset_end]]` or clean user tag `[ref:chunk_id:p{page_num}]`.

### Example Streamed Output:
```markdown
The transformer architecture relies entirely on self-attention mechanisms without recurrent layers [ref:chk_89a1:p3]. This allows significantly higher parallelization during training [ref:chk_89a1:p4].
```

The frontend client intercepts these citation tokens in real-time, rendering them as interactive badges that, when clicked, automatically scroll the Document Viewer to the exact highlighted coordinate bounding box.

---

## 4. Structured Output & Study Action Prompts

Study Actions must return structured, validated data adhering to Pydantic and Zod schemas.

### 1. Flashcard Generation Schema & Prompt

```typescript
// Zod Schema for Study Flashcards
export const FlashcardGenerationSchema = z.object({
  topic: z.string(),
  deckTitle: z.string(),
  cards: z.array(
    z.object({
      id: z.string(),
      front: z.string().describe("Clear, atomic question testing one concept"),
      back: z.string().describe("Concise, comprehensive answer explaining the mechanism"),
      chunkId: z.string().describe("ID of the source chunk from which this card was derived"),
      pageNumber: z.number().int(),
      keyConcept: z.string()
    })
  )
});
```

### 2. Active Recall Quiz Schema & Prompt

```typescript
// Zod Schema for Adaptive Quizzes
export const QuizGenerationSchema = z.object({
  quizTitle: z.string(),
  questions: z.array(
    z.object({
      id: z.string(),
      questionText: z.string(),
      options: z.array(
        z.object({
          id: z.string(), // "A", "B", "C", "D"
          text: z.string(),
          isCorrect: z.boolean(),
          explanation: z.string().describe("Why this choice is correct or incorrect")
        })
      ),
      difficulty: z.enum(["foundational", "intermediate", "advanced"]),
      chunkId: z.string(),
      pageNumber: z.number().int()
    })
  )
});
```

---

## 5. Error Recovery, Retries, and Fallbacks

1. **Provider Degradation Handling:**
   - If an API provider returns HTTP 429 (Rate Limit) or 503 (Overloaded), the client retries with exponential jitter (1s, 2s, 4s).
   - If the failure persists after 3 retries, the UI presents an intelligent switch prompt: *"Anthropic is currently overloaded. Would you like to switch to OpenRouter or Groq?"*
2. **Malformed JSON Recovery:**
   - If a model emits malformed JSON during a structured study action, the backend uses a tolerant streaming parser (`json-repair`) or issues an immediate correction prompt before surfacing an error.

---
*End of AI Integration Rules.*
