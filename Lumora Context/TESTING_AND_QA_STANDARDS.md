# TESTING & QA STANDARDS — LUMORA

> **Document Version:** 1.0.0  
> **Classification:** Quality Assurance & Verification Standard  
> **Target:** Autonomous Test Suites, CI Pipelines, QA Engineers

---

## 1. The Quality Assurance Pyramid

Lumora enforces a multi-layered testing pyramid to guarantee sub-millisecond responsiveness, zero-hallucination citations, and rock-solid document processing:

```
                      ┌─────────────────────────┐
                      │    E2E User Journeys    │  (Playwright - 10%)
                      │   Full Document Flow    │
                      ├─────────────────────────┤
                      │   AI Retrieval & Eval   │  (Ragas / Custom - 20%)
                      │ Citation Accuracy / RRF │
                      ├─────────────────────────┤
                      │ Integration & Contracts │  (FastAPI TestClient - 30%)
                      │  Pydantic & Zod Schemas │
                      ├─────────────────────────┤
                      │ Unit & Logic Algorithms │  (Vitest / Pytest - 40%)
                      │ SM-2 / Chunkers / Math  │
                      └─────────────────────────┘
```

---

## 2. Document Parser & OCR Test Suite

The document extraction engine must pass validation against a standardized synthetic and real-world test corpus:

```
tests/fixtures/documents/
├── standard_text.pdf          # Clean vector PDF (Verify 100% text extraction)
├── scanned_low_res.pdf        # Image-only 150DPI scan (Verify automatic OCR trigger)
├── multi_column_academic.pdf  # 2-column IEEE paper (Verify reading-order preservation)
├── complex_tables.docx        # Multi-row/nested tables (Verify structural markdown tables)
├── latex_formulas.md          # Heavy LaTeX math (Verify KaTeX / MathJax rendering)
└── corrupt_truncated.pdf      # Truncated byte stream (Verify graceful 422 error banner)
```

### Mandatory Parser Assertions:
- Text extraction must never drop equations or code blocks.
- Bounding box coordinates must be strictly normalized between `0.0` and `1.0` relative to page dimensions.
- Total parsing time for a 50-page text PDF must not exceed $2.0\text{s}$.

---

## 3. Retrieval & Grounding Evaluation Benchmarks

To ensure the hybrid BM25 + Dense vector retrieval pipeline surfaces relevant context:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        RETRIEVAL QUALITY BENCHMARKS                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  Metric                         │  Acceptance Threshold                     │
├─────────────────────────────────┼───────────────────────────────────────────┤
│  Hit Rate @ 5 (Top-5 Chunks)    │  ≥ 92.5%                                  │
│  Mean Reciprocal Rank (MRR@10)  │  ≥ 0.84                                   │
│  Citation Grounding Precision   │  ≥ 99.0% (Zero hallucinated citations)   │
│  Context Token Utilization      │  ≥ 80% relevant tokens in context window  │
└─────────────────────────────────┘
```

---

## 4. AI Structured Output Conformance Testing

Every study action prompt must be continuously evaluated using deterministic test suites:

```python
# tests/ai/test_study_action_schemas.py
import pytest
from app.domain.models.study import FlashcardDeckDTO
from app.infrastructure.llm_gateways.anthropic_gateway import generate_flashcards

@pytest.mark.asyncio
async def test_flashcard_generation_strict_schema():
    sample_context = [
        "The mitochondria is the powerhouse of the cell, generating ATP via oxidative phosphorylation."
    ]
    
    result = await generate_flashcards(chunks=sample_context, topic="Cellular Biology")
    
    # Assert strict schema conformity
    assert isinstance(result, FlashcardDeckDTO)
    assert len(result.cards) >= 1
    assert "ATP" in result.cards[0].back or "mitochondria" in result.cards[0].front
    assert result.cards[0].chunk_id is not None
```

---

## 5. Performance, Memory & A11y Standards

1. **Memory Heap Profiling:** Document Canvas must not leak WebGL or canvas contexts during prolonged scrolling of 500+ pages. Heap allocation must stabilize under $120\text{MB}$.
2. **Accessibility (WCAG 2.1 AA):**
   - Minimum color contrast ratio of `4.5:1` for normal text and `3:1` for large text across Warm Light and Premium Dark themes.
   - All interactive controls have visible focus rings (`ring-2 ring-accent-primary`).
   - Screen readers must receive `aria-live="polite"` updates during streaming AI generation.

---
*End of Testing & QA Standards.*
