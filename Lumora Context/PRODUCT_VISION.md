# PRODUCT VISION — LUMORA

> **Document Version:** 1.0.0  
> **Status:** Strategic Foundation Document  
> **Product Identity:** Lumora (The Learning Operating System)

---

## 1. The Core Philosophy

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                               CORE CREED                                     │
│                                                                              │
│             "Information is abundant. Understanding is scarce.               │
│                        Learning is the product.                              │
│                Artificial Intelligence is only the assistant."               │
└──────────────────────────────────────────────────────────────────────────────┘
```

The 21st century has inundated humanity with an overwhelming tsunami of information. We have access to millions of research papers, endless digital textbooks, recorded lectures, and algorithmic feeds. Yet, genuine human understanding remains stubbornly rare. 

The widespread adoption of generative AI has created a dangerous paradox: **The Illusion of Competence**. When an AI model generates a neat summary or answers a question, the user feels as though they have learned. In reality, the machine did the cognitive work, while the human brain remained a passive spectator. 

**Lumora is built on a different premise:**
AI must not be an oracle that replaces human thinking. AI must be a **cognitive catalyst**—an active pedagogical tutor, an intelligent organizer, and a friction-free study workspace that empowers the human mind to dissect, challenge, practice, and master complex ideas.

---

## 2. The Learning Operating System (LOS) Architecture

Lumora treats learning not as a single action (like reading or chatting), but as an integrated **6-Stage Continuous Learning Pipeline**:

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      THE 6-STAGE LEARNING PIPELINE                     │
 └────────────────────────────────────────────────────────────────────────┘

   [ 1. INFORMATION ] ── Ingestion & Structural Parsing
        │               • Multi-source ingestion: PDFs, DOCX, MD, Web, YouTube, Audio.
        │               • Local OCR, cleaning, semantic chunking, and metadata indexing.
        ▼
   [ 2. UNDERSTANDING ] ── Deep Comprehension & Deconstruction
        │               • Dual-mode explanations: ELI5 (intuitive) vs. Advanced (rigorous).
        │               • Verifiable inline citations with bidirectional document jumps.
        │               • Structural concept breakdowns and hierarchical summaries.
        ▼
   [ 3. PRACTICE ] ──── Active Recall & Retrieval
        │               • Automated generation of high-leverage flashcard decks.
        │               • Contextual multiple-choice & conceptual short-answer quizzes.
        │               • Instant diagnostic feedback and concept reinforcement.
        ▼
   [ 4. RETENTION ] ── Spaced Repetition & Memory Hardening
        │               • SuperMemo / SM-2 spaced repetition scheduling.
        │               • Review queues prioritized by forgetting curves.
        │               • Active re-testing of weak conceptual nodes.
        ▼
   [ 5. APPLICATION ] ── Synthesis & Structural Modeling
        │               • Cornell notes auto-structuring and synthesis across sources.
        │               • Concept comparison matrices (e.g., comparing algorithms or theories).
        │               • Timelines, mind maps, and cross-document concept maps.
        ▼
   [ 6. MASTERY ] ──── Permanent Cognitive Fluency
                        • High-fidelity Markdown & PDF synthesis export.
                        • Zero-app-switching mental flow.
                        • Total verifiable conceptual ownership.
```

---

## 3. The Study Actions Taxonomy

Within Lumora, interactions are driven by **Purposeful Study Actions** rather than open-ended, unanchored conversational prompts. Each action is engineered with specialized system prompts, structured schemas, and direct document grounding:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         STUDY ACTIONS TAXONOMY                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  ACTION              │  PEDAGOGICAL PURPOSE                                 │
├──────────────────────┼──────────────────────────────────────────────────────┤
│  Summarize           │  Distills executive highlights, key arguments, and   │
│                      │  chapter-level structural outlines.                  │
├──────────────────────┼──────────────────────────────────────────────────────┤
│  Explain (ELI5)      │  Simplifies complex jargon using clear analogies and │
│                      │  first-principles mental models.                     │
├──────────────────────┼──────────────────────────────────────────────────────┤
│  Explain (Advanced)  │  Delivers rigorous mathematical, theoretical, or     │
│                      │  architectural breakdowns for domain experts.        │
├──────────────────────┼──────────────────────────────────────────────────────┤
│  Concept Breakdown   │  Dissects a dense idea into atomic components,       │
│                      │  prerequisites, mechanisms, and edge cases.          │
├──────────────────────┼──────────────────────────────────────────────────────┤
│  Compare Concepts    │  Generates side-by-side comparative matrices showing │
│                      │  trade-offs, commonalities, and key differences.     │
├──────────────────────┼──────────────────────────────────────────────────────┤
│  Flashcards          │  Extracts atomic question-answer pairs optimized for │
│                      │  spaced repetition and active recall.                │
├──────────────────────┼──────────────────────────────────────────────────────┤
│  Quiz Generation     │  Builds adaptive multi-format quizzes that test deep │
│                      │  conceptual reasoning rather than surface trivia.    │
├──────────────────────┼──────────────────────────────────────────────────────┤
│  Cornell Notes       │  Structures extracted knowledge into Cues, Notes,    │
│                      │  and Summary blocks for systematic study.            │
├──────────────────────┼──────────────────────────────────────────────────────┤
│  Timeline            │  Reconstructs chronological sequences, historical    │
│                      │  events, or execution flows from document text.      │
└──────────────────────┴──────────────────────────────────────────────────────┘
```

---

## 4. The Progressive Authentication Paradigm

Lumora eliminates the friction of traditional web applications through **Progressive Authentication**:

```
               ┌──────────────────────────────────────────────┐
               │              ZERO-WALL LAUNCH                │
               │  App opens immediately in local-first mode.  │
               │  No sign-up modal. No email verification.    │
               │  Local documents, parsing, and chat work.    │
               └──────────────────────┬───────────────────────┘
                                      │
                         User initiates cloud feature:
                   (Multi-device sync, cloud backup, team sharing)
                                      │
                                      ▼
               ┌──────────────────────────────────────────────┐
               │            SEAMLESS UPGRADE PATH             │
               │  User links account (Clerk / Auth.js).       │
               │  Local indexed SQLite/Dexie data is pushed   │
               │  to encrypted cloud storage without data loss│
               └──────────────────────────────────────────────┘
```

### Key Principles:
1. **Immediate Utility:** A user can drag a 100-page PDF into Lumora and begin studying within 3 seconds of opening the URL.
2. **Data Continuity:** When an account is created, all local projects, parsed indexes, flashcards, and chat sessions are seamlessly migrated to the cloud workspace.

---

## 5. Bring Your Own API Key (BYOK) & Sovereign AI

To guarantee absolute user privacy, zero vendor lock-in, and radical cost transparency, Lumora is built on a **Sovereign AI BYOK Model**:

- **Provider Agnostic:** Instant plug-and-play support for:
  - **OpenRouter** (Unified access to 100+ models)
  - **Anthropic** (Claude 3.5 Sonnet, Claude 3 Opus)
  - **OpenAI** (GPT-4o, GPT-4o-mini, o1)
  - **Google Gemini** (Gemini 1.5 Pro / Flash)
  - **Mistral AI** (Mistral Large, Codestral)
  - **DeepSeek** (DeepSeek-V3, DeepSeek-R1)
  - **Groq** (Ultra-low latency Llama-3 inference)
  - **Local Models (Phase 2):** Ollama, LM Studio, vLLM via local HTTP.
- **Client-Side Key Vaulting:** API keys are encrypted client-side using WebCrypto AES-GCM and stored only in local storage, never transmitted to Lumora telemetry servers.

---

## 6. Strategic Principles (The Non-Negotiables)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CORE PRODUCT PRINCIPLES                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. Quality over speed         │  Craftsmanship and rigor precede delivery. │
│  2. Architecture over shortcuts│  Build clean systems that scale for years. │
│  3. Maintainability over hacks │  Refactor early; eliminate technical debt. │
│  4. Trust over engagement      │  Respect user privacy, time, and attention.│
│  5. Learning over chatting     │  Optimize for retention, not message count.│
│  6. Privacy over cloud usage   │  Process locally first; encrypt always.    │
│  7. Documentation before code  │  Design, plan, and verify before building. │
└─────────────────────────────────────────────────────────────────────────────┘
```

---
*End of Product Vision.*
