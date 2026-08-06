# OPERATING RULES — LUMORA

> **Document Version:** 1.0.0  
> **Status:** Strictly Enforced Operational Governance  
> **Target:** Autonomous Coding Agents, Engineers, System Contributors

---

## 1. The Pre-Flight Execution Protocol

Before a single line of production code is written or modified, every contributor and AI agent **must** complete and document the **6-Step Pre-Flight Protocol**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       THE 6-STEP PRE-FLIGHT PROTOCOL                        │
└─────────────────────────────────────────────────────────────────────────────┘
  
  [ STEP 1 ] ──> UNDERSTAND THE ARCHITECTURE
                 Deeply inspect existing interfaces, domain models, and state flows.
                 Trace dependencies across the tri-pane UI, document pipeline, and API.

  [ STEP 2 ] ──> PRODUCE AN IMPLEMENTATION PLAN
                 Draft an explicit, granular plan outlining files to create/edit,
                 types to define, edge cases to handle, and state transitions.

  [ STEP 3 ] ──> REVIEW AND CRITIQUE THE PLAN
                 Act as a strict code reviewer. Assess whether the plan aligns with
                 the 6-stage learning funnel, performance budgets, and design tokens.

  [ STEP 4 ] ──> IDENTIFY WEAKNESSES & RISKS
                 Search for failure modes: memory leaks on large PDFs, hydration
                 mismatches, missing error boundaries, unhandled OCR failures, race conditions.

  [ STEP 5 ] ──> IMPROVE THE DESIGN
                 Refine the plan to resolve every identified risk, simplify component
                 trees, and eliminate redundant state or abstractions.

  [ STEP 6 ] ──> BEGIN IMPLEMENTATION
                 Execute the refined plan cleanly with full type safety and zero shortcuts.
```

---

## 2. The Zero-Placeholder Rule

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           THE ABSOLUTE BAN LIST                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  ❌ NO placeholder UI (e.g., "Coming Soon", blank divs, dummy boxes).       │
│  ❌ NO stubbed TODOs in critical paths (e.g., "// TODO: add error handling").│
│  ❌ NO mock API data hardcoded into production components.                  │
│  ❌ NO unhandled promise rejections or empty catch blocks `catch (e) {}`.   │
│  ❌ NO untyped escape hatches (`any`, `@ts-ignore`, `as unknown as T`).     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### The Standard of Completeness:
Every delivered module must be fully functional:
- If an icon is needed, provide the complete, optimized SVG.
- If an API endpoint is created, provide the full Pydantic validation, error codes, and async handler.
- If a UI modal is rendered, provide the complete open/close state, keyboard trap, accessibility ARIA tags, and responsive layout.

---

## 3. Feature-Based Modular Architecture

All application code must follow a **Strict Feature-Based Modular Architecture**. Dumping files into generic top-level directories (e.g., a massive `/components` folder with 100 unrelated buttons and modals) is strictly prohibited.

### Directory Structure Blueprint:

```
src/
├── features/
│   ├── document-viewer/
│   │   ├── components/          # Feature-specific UI components
│   │   │   ├── DocumentCanvas.tsx
│   │   │   ├── PageNavigator.tsx
│   │   │   └── TextHighlighter.tsx
│   │   ├── hooks/               # Feature-specific React hooks
│   │   │   ├── useDocumentScroll.ts
│   │   │   └── useTextSelection.ts
│   │   ├── logic/               # Pure functions, calculation, coordinate math
│   │   │   ├── boundingBox.ts
│   │   │   └── citationJump.ts
│   │   ├── types/               # Strict TypeScript interfaces & schemas
│   │   │   └── index.ts
│   │   ├── tests/               # Unit and component integration tests
│   │   │   ├── DocumentCanvas.test.tsx
│   │   │   └── boundingBox.test.ts
│   │   └── index.ts             # Public module export boundary
│   │
│   ├── study-actions/           # Summaries, Quizzes, Flashcards, Notes
│   ├── document-pipeline/       # Ingestion, OCR arbiter, chunking
│   ├── ai-orchestration/        # BYOK providers, prompt templates, streaming
│   └── workspace-manager/       # Project tree, recents, collections
│
├── shared/                      # Universally shared, domain-agnostic primitives
│   ├── components/              # Buttons, inputs, modals, tooltips
│   ├── icons/                   # Bespoke Lumora SVG icon library
│   ├── theme/                   # Theme provider & token definitions
│   └── utils/                   # Pure utility helpers
```

---

## 4. State Management Hygiene

To guarantee smooth, desktop-grade responsiveness:
1. **Single Source of Truth:** State must never be duplicated across multiple stores. Document metadata lives in the workspace store; active viewport coordinates live in the viewer store.
2. **Server State vs. Client State:**
   - Server data (document chunks, project trees, search indexes) **must** be managed via TanStack Query with deterministic cache keys and optimistic updates where appropriate.
   - Transient UI state (sidebar collapse, active tab, modal visibility) **must** be managed via lightweight Zustand slices.
3. **No Cascading Re-Renders:** Components must use fine-grained selectors:
   ```typescript
   // ✅ CORRECT: Subscribes only to the active document ID
   const activeDocId = useWorkspaceStore((state) => state.activeDocumentId);

   // ❌ INCORRECT: Causes re-render on any store change
   const { activeDocumentId, projectList, tags } = useWorkspaceStore();
   ```

---

## 5. Error Handling & Resilience Mandate

Software must never crash silently or leave the user in an unresponsive state.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          RESILIENCE DIRECTIVES                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. Every asynchronous operation must have an explicit AbortSignal.        │
│  2. Network requests to AI providers must implement exponential backoff    │
│     and clear user-facing failure diagnostics (e.g., Rate limit, Bad key). │
│  3. Complex UI sections must be wrapped in isolated Error Boundaries.       │
│  4. Parsing failures (corrupt PDF, unreadable image) must produce a clean  │
│     actionable banner offering OCR fallback or alternate upload.           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Performance & UX Ergonomics

1. **Sub-Millisecond Interactions:** Button clicks, tab switches, and sidebar toggles must execute with zero detectable lag ($< 16\text{ms}$ frame budget).
2. **Streaming First:** All AI reasoning and study action generations must stream their responses to the client via Server-Sent Events (SSE). Never block the user with full-response loading spinners when streaming is viable.
3. **Debounced Operations:** Search inputs, zoom sliders, and autosave triggers must be intelligently debounced (e.g., $150\text{ms}$ for search, $500\text{ms}$ for notes autosave).
4. **Zero Layout Shifts (CLS = 0):** Document viewer pages, sidebar items, and study cards must reserve explicit dimensions to prevent visual jarring during load.

---

## 7. Documentation & Commit Standards

- Every new module must include an `index.ts` declaring its explicit public API.
- All exported functions must have concise JSDoc / docstrings explaining inputs, outputs, and side-effects.
- Commit messages must follow Conventional Commits:
  - `feat(viewer): implement bidirectional citation highlight jumping`
  - `fix(ocr): handle multi-page scanned PDF rotation offsets`
  - `perf(search): introduce hybrid BM25 and vector score fusion`
  - `refactor(byok): unify OpenRouter and Anthropic streaming adapters`

---
*End of Operating Rules.*
