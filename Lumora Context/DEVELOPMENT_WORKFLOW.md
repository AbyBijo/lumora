# DEVELOPMENT WORKFLOW — LUMORA

> **Document Version:** 1.0.0  
> **Status:** Standard Operating Procedure (SOP)  
> **Audience:** Core Engineers, AI Agents, Open-Source Contributors

---

## 1. The Autonomous Agent Workflow Lifecycle

Any AI coding agent or software engineer contributing to Lumora must execute work strictly through the **6-Stage Agent Lifecycle**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       THE 6-STAGE AGENT LIFECYCLE                           │
└─────────────────────────────────────────────────────────────────────────────┘

   ┌──────────────┐
   │ 1. INSPECT   │ ──> Read relevant feature files, types, and schemas.
   └──────┬───────┘     Never assume existing state without verification.
          │
          ▼
   ┌──────────────┐
   │  2. PLAN     │ ──> Formulate an explicit step-by-step implementation blueprint.
   └──────┬───────┘     Define interfaces, database migrations, and component trees.
          │
          ▼
   ┌──────────────┐
   │ 3. CRITIQUE  │ ──> Actively review the blueprint against the Engineering
   └──────┬───────┘     Constitution, Design Constitution, and Performance Budgets.
          │
          ▼
   ┌──────────────┐
   │ 4. STRESS-   │ ──> Identify failure modes: offline handling, unparsed PDF
   │    TEST      │     formats, memory leaks, missing error boundaries.
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │  5. REFINE   │ ──> Optimize the plan: eliminate redundant abstractions,
   └──────┬───────┘     simplify state, guarantee strict type safety.
          │
          ▼
   ┌──────────────┐
   │  6. EXECUTE  │ ──> Implement code, tests, and documentation atomically.
   └──────────────┘     Run test suites; verify zero lint or type errors.
```

---

## 2. Local Environment Setup

### Prerequisites:
- **Node.js:** `v20.x` or `v22.x` (LTS)
- **Package Manager:** `pnpm` (v9+)
- **Python:** `3.11+` or `3.12`
- **Python Package Manager:** `uv` or `poetry`
- **Docker Engine:** `24+` with Compose v2

### Quickstart Execution:

```bash
# 1. Clone repository
git clone https://github.com/lumora/lumora.git
cd lumora

# 2. Start local infrastructure services (PostgreSQL + pgvector, Redis)
docker compose up -d

# 3. Setup Frontend dependencies
pnpm install

# 4. Setup Backend virtual environment
cd backend
uv venv
source .venv/bin/activate
uv pip install -e ".[dev]"
cd ..

# 5. Initialize environment variables
cp .env.example .env.local

# 6. Run development servers (Frontend: 3000, Backend: 8000)
pnpm dev
```

---

## 3. Git Branching & Commit Discipline

### Branch Naming Conventions:
- `feat/feature-name` (New capability, e.g., `feat/youtube-transcript-parser`)
- `fix/bug-description` (Bug repair, e.g., `fix/pdf-coordinate-scaling`)
- `perf/optimization` (Performance enhancement, e.g., `perf/bm25-indexing-worker`)
- `refactor/scope` (Structural cleanup without behavioral change)
- `docs/topic` (Documentation updates)

### Commit Message Standard (Conventional Commits):

```
<type>(<scope>): <short imperative summary>

[optional body explaining motivation and architectural trade-offs]

[optional footer referencing issue or breaking change]
```

#### Examples:
- `feat(study): add spaced-repetition SM-2 scheduling engine to flashcards`
- `fix(ocr): resolve zero-division bounding box scale error on scanned images`
- `perf(retrieval): optimize hybrid reciprocal rank fusion with SIMD vector dot products`

---

## 4. Quality Assurance & Automated Pre-Commit Gates

Before any commit or PR submission is accepted, the automated verification pipeline executes:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AUTOMATED PRE-COMMIT GATES                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  Frontend Gates:                                                            │
│    • TypeScript Typecheck:  pnpm typecheck (`tsc --noEmit`)                │
│    • ESLint Strict:         pnpm lint                                       │
│    • Prettier Format:       pnpm format:check                               │
│    • Unit / Component Tests:pnpm test (`vitest run`)                        │
│                                                                             │
│  Backend Gates:                                                             │
│    • Ruff Linter & Format:  ruff check . && ruff format --check .          │
│    • Strict Typecheck:      mypy --strict app                               │
│    • PyTest Test Suite:     pytest -v --cov=app tests/                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Pull Request & Review Protocol

Every Pull Request must satisfy the following checklist before merge approval:

1. **Architectural Alignment:** Does this PR honor the single source of truth and unidirectional data flow?
2. **Design Fidelity:** Does the UI match the Warm Light and Premium Dark design tokens without uncalibrated ad-hoc colors?
3. **Grounding & Citations:** If this introduces or modifies AI generation, does it enforce strict document citations?
4. **Test Coverage:** Are unit tests included for all pure logic, and integration tests included for all API endpoints?
5. **No Regressions:** All existing automated tests must pass with 100% green status.

---

## 6. Continuous Deployment Pipeline

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Git Push /  │ ──> │ GitHub CI    │ ──> │ Container    │ ──> │ Zero-Downtime│
│  PR Merged   │     │ (Test & Lint)│     │ Build & Scan │     │ Deployment   │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                                                                ├─ Web: Vercel
                                                                └─ API: Railway/Docker
```

---
*End of Development Workflow.*
