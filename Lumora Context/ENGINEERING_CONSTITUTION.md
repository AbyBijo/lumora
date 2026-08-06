# ENGINEERING CONSTITUTION — LUMORA

> **Document Version:** 1.0.0  
> **Classification:** Engineering Law & Technical Governance  
> **Target Systems:** Frontend (Next.js / TypeScript) & Backend (FastAPI / Python)

---

## 1. The Core Engineering Commandments

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SEVEN ENGINEERING COMMANDMENTS                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  I.   Quality Over Speed          │ Never ship brittle code to meet an      │
│                                   │ arbitrary deadline.                     │
├───────────────────────────────────┼─────────────────────────────────────────┤
│  II.  Architecture Over Shortcuts │ Design explicit domain models and clean │
│                                   │ interfaces before writing logic.        │
├───────────────────────────────────┼─────────────────────────────────────────┤
│  III. Maintainability Over Hacks  │ If a solution feels like a workaround,  │
│                                   │ step back and fix the root problem.     │
├───────────────────────────────────┼─────────────────────────────────────────┤
│  IV.  Trust Over Engagement       │ Zero intrusive tracking; zero client-   │
│                                   │ side key leakage; total transparency.   │
├───────────────────────────────────┼─────────────────────────────────────────┤
│  V.   Learning Over Chatting      │ All data structures must support active │
│                                   │ recall, spaced repetition, and indexing.│
├───────────────────────────────────┼─────────────────────────────────────────┤
│  VI.  Privacy Over Cloud Storage  │ Local-first processing is default; cloud│
│                                   │ sync is strictly opt-in.                │
├───────────────────────────────────┼─────────────────────────────────────────┤
│  VII. Documentation Before Code   │ Spec the types, API contracts, and flows│
│                                   │ before generating implementation files. │
└───────────────────────────────────┘
```

---

## 2. TypeScript & Frontend Standards

Every TypeScript file in Lumora must adhere to ultra-strict compiler rules:

```json
// tsconfig.json (Mandatory Flags)
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Frontend Rules:
1. **Zero `any` Policy:** The usage of `any` is forbidden. Use generics, tagged unions, `unknown` with type guards, or Zod schemas.
2. **Schema-Driven Boundaries:** All external data (API responses, LocalStorage data, file uploads) must be validated with Zod before being ingested into application state:
   ```typescript
   import { z } from 'zod';

   export const FlashcardSchema = z.object({
     id: z.string().uuid(),
     documentId: z.string().uuid(),
     front: z.string().min(1),
     back: z.string().min(1),
     citations: z.array(z.object({
       pageNumber: z.number().int().positive(),
       snippet: z.string(),
       chunkId: z.string()
     })),
     interval: z.number().default(1),
     easeFactor: z.number().default(2.5),
     repetition: z.number().default(0)
   });

   export type Flashcard = z.infer<typeof FlashcardSchema>;
   ```
3. **Pure Presentational vs. Container Logic:** UI components must not execute heavy data-fetching or complex calculations inline. Logic must be encapsulated in custom hooks or pure domain helper modules.

---

## 3. Python & FastAPI Backend Standards

The Lumora backend is engineered for high-throughput, async-first document intelligence and AI orchestration:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       BACKEND ARCHITECTURE RULES                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  • Python 3.11+ Runtime with strict type hints on 100% of signatures.       │
│  • Pydantic v2 for all request, response, and settings schemas.             │
│  • Async/Await everywhere: Zero blocking I/O on the main event loop.        │
│  • Structured Pattern Matching (match/case) for parser routing.             │
│  • Ruff for sub-millisecond linting and formatting.                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Python API Endpoint Blueprint:

```python
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Annotated, List
from uuid import UUID

router = APIRouter(prefix="/api/v1/documents", tags=["Document Intelligence"])

class ChunkExtractionResponse(BaseModel):
    document_id: UUID
    chunk_count: int
    chunks: List[ChunkDTO] = Field(..., description="Extracted semantic chunks with coordinate metadata")

@router.post(
    "/{doc_id}/extract",
    response_model=ChunkExtractionResponse,
    status_code=status.HTTP_200_OK,
    summary="Trigger local semantic extraction & indexing"
)
async def extract_document_chunks(
    doc_id: UUID,
    service: Annotated[DocumentExtractionService, Depends(get_extraction_service)]
) -> ChunkExtractionResponse:
    try:
        result = await service.process_document(doc_id)
        return result
    except DocumentNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    except CorruptDocumentError as err:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(err))
```

---

## 4. Performance Budgets & Bundle Limits

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PERFORMANCE THRESHOLDS                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  Metric                             │  Budget Limit                         │
├─────────────────────────────────────┼───────────────────────────────────────┤
│  Initial JavaScript Bundle (Gzip)   │  < 180 KB                             │
│  Lighthouse Performance Score       │  ≥ 95                                 │
│  First Contentful Paint (FCP)       │  < 800 ms                             │
│  Cumulative Layout Shift (CLS)      │  0.00 (Zero Shift)                    │
│  Document Viewer Page Render Latency│  < 35 ms / page                       │
│  Local Hybrid Search Query (BM25)   │  < 15 ms                              │
└─────────────────────────────────────┘
```

---

## 5. Architectural Boundaries & Clean Isolation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   DEPENDENCY FLOW (Strictly Unidirectional)                 │
└─────────────────────────────────────────────────────────────────────────────┘

     Presentation Layer (React Components / Tailwind UI)
             │
             ▼
     Application Layer (Zustand Stores, TanStack Query Hooks)
             │
             ▼
     Domain / Core Layer (Pydantic / Zod Models, Extraction Logic, Spaced Repetition)
             │
             ▼
     Infrastructure Layer (FastAPI, SQLite/PG, Vector Indexes, BYOK Providers)
```

- High-level presentation components must never import directly from low-level infrastructure adapters.
- All AI provider interactions must go through the unified `AIProviderAdapter` interface, allowing hot-swapping between OpenRouter, OpenAI, Anthropic, Gemini, or local Ollama.

---
*End of Engineering Constitution.*
