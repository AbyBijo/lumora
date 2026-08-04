# Lumora

**The Learning Operating System** — turn documents into guided learning paths with
active recall, spaced repetition, and measurable mastery.

Lumora is an AI-powered learning workspace. Upload or paste source material (PDF,
DOCX, TXT, Markdown, URLs), and it produces an outline, curriculum, flashcards,
and quizzes — every generated item grounded in a verbatim source citation.

## ✨ Highlights

- **Source-grounded generation** — every flashcard/quiz/concept links back to the
  exact passage it was derived from; the UI shows the source verbatim.
- **Active recall + spaced repetition** — SM-2 scheduling for flashcards and an
  EMA-based mastery model that drives the study loop.
- **Model-agnostic AI** — runs fully **offline by default** with a local engine
  (no API keys required). Add `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` to upgrade
  generation quality through a provider gateway; the UI never calls a provider
  directly.
- **Calm, premium UI** — dark-mode-first, minimal, typography-driven design.

## Tech stack

Next.js 14 (App Router) · React 18 · TypeScript (strict) · Tailwind CSS ·
Prisma (SQLite for dev, PostgreSQL for production) · Vitest · Docker.

## Getting started

Requirements: Node.js 20+ and npm.

```bash
# 1. Install dependencies
npm install

# 2. Configure the environment
cp .env.example .env.local    # Next.js reads this
cp .env.example .env          # Prisma CLI + tsx scripts read this

# 3. Set up the database (dev default: SQLite, zero setup)
npx prisma generate
npx prisma migrate dev        # applies prisma/migrations to ./prisma/dev.db

# 4. Run the dev server
npm run dev                   # http://localhost:3000
```

> The app runs fully in **local engine** mode with no keys. Setting
> `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` in `.env.local` enables higher-quality
> generation.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Generate Prisma client and build for production |
| `npm start` | Run the production build |
| `npm run lint` | ESLint (`next lint`) |
| `npm test` | Run unit tests (Vitest) |
| `npm run smoke` | Run the engine smoke test |
| `npm run db:push` / `db:migrate` / `db:deploy` / `db:studio` | Prisma DB commands |

## Running with Docker / PostgreSQL

For a production-style deployment with PostgreSQL:

```bash
cp .env.example .env   # set POSTGRES_PASSWORD, APP_URL, optional LLM keys
docker compose up -d --build
```

Flip the Prisma `datasource` provider from `sqlite` to `postgresql` in
`prisma/schema.prisma` first (see `docs/production.md`). The app container runs
`prisma migrate deploy` automatically at startup. See `Dockerfile` and
`docs/production.md` for details.

## Repository layout

```text
src/app/       Next.js routes (pages + API)
src/components UI components (incl. src/components/ui primitives)
src/engine/    Pure, framework-free pipeline: parse → chunk → concepts →
               quizzes → curriculum → LLM gateway
src/lib/       Auth, session, SRS, mastery, services, server helpers
prisma/        Prisma schema + migrations
docs/          Vision, PRD, SRS, architecture, ADRs, and more
prompts/       Prompt templates and notes
scripts/       Dev utilities (e.g. smoke test)
.github/       CI workflow (lint · test · smoke · build)
```

## Documentation

The `docs/` folder mirrors the Lumora Notion hub and is driven by the
[master context file](.context/MASTER_CONTEXT.md) — the project's source of truth.
Start with [docs/README.md](docs/README.md) for an index, or
[docs/architecture.md](docs/architecture.md) for the system design.

## License

See the project's license terms (private / closed-source unless otherwise noted).
