# Lumora — The Learning Operating System

**Document → Curriculum, not Document → Chat.**

Lumora transforms uploaded documents (PDF, DOCX, TXT/MD, web URLs) into
structured, guided learning paths — modules → lessons → key concepts → quizzes →
flashcards — with SM-2 spaced repetition, measurable mastery tracking, and
**source traceability on every single claim**.

> Every quiz answer, flashcard, and generated concept links back to the exact
> passage of the source document. Nothing is fabricated; nothing is ungrounded.

---

## Why not just ChatGPT?

| Feature | Lumora | Generic chat |
| --- | --- | --- |
| Document → Curriculum | ✅ structured path | ❌ unstructured chat |
| Active recall | ✅ built-in quizzes & flashcards | ❌ user must prompt |
| Spaced repetition | ✅ automatic SM-2 scheduling | ❌ none |
| Mastery tracking | ✅ measurable per-module progress | ❌ none |
| Source traceability | ✅ every claim linked | ❌ often hallucinated |
| Retention focus | ✅ core primitive | ❌ afterthought |

---

## Quickstart

```bash
# 1. Install
npm install

# 2. Configure environment (optional — the app runs with zero keys)
cp .env.example .env.local        # for the Next.js app
cp .env.example .env              # for Prisma CLI & scripts

# 3. Create the database
npx prisma migrate dev            # apply committed migrations (creates prisma/dev.db)

# 4. Run
npm run dev
# open http://localhost:3000 — register an account and start learning
```

> 📱 **On Android/Termux?** See
> [Running on Termux](#running-on-termux-android-) — you'll run inside a
> proot-distro Debian environment (Prisma's native engine can't load on
> Termux's bionic libc).

### Production build

```bash
npm run build && npm start
```

### Running on Termux (Android) 📱

> **Short version:** native Termux can't run Prisma's engine (Android's bionic
> libc vs Prisma's glibc binaries), so run Lumora inside a **proot-distro
> Debian** environment — no root needed. Everything then works like desktop Linux.

```bash
# In Termux:
pkg update -y && pkg upgrade -y
pkg install proot-distro -y
proot-distro install --architecture aarch64 debian
proot-distro login debian

# Inside Debian:
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt install -y nodejs git
git clone <your-lumora-repo> lumora && cd lumora
npm install
cp .env.example .env.local && cp .env.example .env
npx prisma migrate dev
npm run dev -- -H 0.0.0.0
# → open http://localhost:3000 on your phone and register an account
```

- Use the **F-Droid / GitHub** Termux build, not the Play Store one.
- `-H 0.0.0.0` lets other devices on your Wi-Fi reach the app at
  `http://<phone-ip>:3000`.
- Keep the server alive with `termux-wake-lock` + `tmux` — details in
  [`docs/termux.md`](docs/termux.md).

---

## What you can do (MVP, Phase 1)

- **Upload** a PDF, DOCX, TXT, Markdown file, or a web URL (drag & drop).
- **Automatic parsing** into traceable source chunks (with section + page refs).
- **Curriculum generation** — modules, lessons, learning objectives, key
  concepts with definitions, all cited to the source.
- **Active recall by default** — every lesson ships with 3–5 mixed questions
  (multiple choice, fill-in-the-blank, short answer) plus flashcards.
- **Spaced repetition (SM-2)** — a daily review queue, per-card intervals and
  ease factors, due-date scheduling, review & cram modes.
- **Mastery dashboard** — overall mastery ring, per-module mastery, weak-area
  identification, 14-day activity, upcoming reviews, study streaks.
- **Source traceability** — every question/answer/card shows its exact source
  passage and citation; “View in source” on feedback.
- **Curriculum review & edit** — drafts must be approved before studying; edit
  titles/descriptions inline.
- **Keyboard shortcuts** — `⌥d/u/c/f/m` navigation, `1–4` answers/ratings,
  `Space` to flip cards, `Enter` to submit.
- **Dark mode first** with a light-mode toggle; mobile responsive.
- **Accounts & security** — register/login, bcrypt-hashed passwords, revocable
  server-side sessions, rate limiting, CSRF origin checks, security headers.

## Production & security

- **Deploy:** `docker compose up -d --build` (PostgreSQL included) or Vercel +
  managed Postgres — see [`docs/production.md`](docs/production.md).
- **Security model:** [`docs/security.md`](docs/security.md) — auth, sessions,
  CSRF, rate limits, data handling.
- **API conventions:** [`docs/api.md`](docs/api.md) — the 3-step recipe for
  adding an endpoint (`src/app/api/<domain>` + `src/lib/server` +
  `src/lib/api/<domain>`), with the `{ data }` / `{ error }` envelope.
- **Quality:** `npm run lint`, `npm test` (50 unit tests across SRS, mastery,
  parsing, quizzes, passwords), CI in `.github/workflows/ci.yml`, and
  `npm run build` (standalone output for Docker).
- **DB migrations:** committed under `prisma/migrations/`; use
  `npx prisma migrate deploy` in production (never `db push`).

## How the engine works (no API key required)

Lumora ships with a **Local Engine** that is deterministic and fully
source-grounded:

1. **Parse** — PDF (per-page via pdf.js), DOCX (mammoth), TXT/MD, URL (HTML→text).
2. **Chunk** — text is split at sentence boundaries into ~900-char chunks, each
   tagged with its nearest heading (`section`) and page number.
3. **Structure** — the document's own heading outline becomes modules and
   lessons (proportional split when no headings exist).
4. **Concepts** — salient noun phrases ranked by frequency/position, each paired
   with a definitional sentence from the source.
5. **Quizzes** — definitional sentences become MCQ (distractors are *other real
   definitions from the same document*), fill-blank, and short-answer items.
6. **Flashcards** — one per concept, SM-2-scheduled.

If you set `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`, generation upgrades to a
provider (GPT-4o / Claude) using the curriculum prompt in
[`prompts/curriculum.md`](prompts/curriculum.md), with automatic fallback to the
local engine. Providers are interchangeable behind a gateway
(`src/engine/llm/`), per the model-agnostic principle.

## Repository layout

```
lumora/
├── .context/MASTER_CONTEXT.md   # the permanent brain (source of truth)
├── docs/                        # human docs, mirroring the Notion hub
│   ├── vision.md  prd.md  srs.md  architecture.md  roadmap.md
│   ├── research.md  design-system.md  database.md
│   ├── adr/                     # decision log (0001–0007)
│   └── prompts/                 # prompt library
├── prompts/curriculum.md        # the production prompt asset
├── prisma/schema.prisma         # full data model (SQLite dev / Postgres prod)
├── scripts/
│   └── smoke.ts                 # engine smoke test (self-contained)
└── src/
    ├── app/                     # Next.js App Router (pages + API routes)
    ├── components/              # UI (ui/, study/, flashcards/, curriculum/, upload/)
    ├── engine/                  # parsing, chunking, curriculum, quizzes, LLM gateway
    ├── lib/                     # auth, db, srs (SM-2), mastery, services, api client
    └── types/
```

## Environment variables

See [`.env.example`](.env.example). Only `DATABASE_URL` matters for local dev
(SQLite default). `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` are optional upgrades.

**Note:** Next.js reads `.env.local`; the Prisma CLI and `tsx` scripts read
`.env`. Both are created by the quickstart. `src/lib/env.ts` also loads them for
script entry points.

## Database

SQLite by default (zero setup, file-based at `prisma/dev.db`). The schema is
portable — switch to PostgreSQL by changing the `provider` in
[`prisma/schema.prisma`](prisma/schema.prisma) and setting a Postgres
`DATABASE_URL`, then `npx prisma db push` (or migrate). See
[`docs/database.md`](docs/database.md) and
[`docs/adr/0002-db.md`](docs/adr/0002-db.md).

## Roadmap highlights (Phase 2+)

Web URL ingestion is already in; next: DOCX polish, image/OCR ingestion,
collaborative workspaces, advanced analytics, public curriculum marketplace,
mobile app, export (Markdown/PDF), real auth (NextAuth/Clerk), object storage
for large files, async queue (Redis/BullMQ) for big documents. Full plan in
[`docs/roadmap.md`](docs/roadmap.md).

## Design

Dark-mode-first, calm, premium, uncluttered — influenced by Notion, Linear,
Arc, Apple. Design tokens live in `tailwind.config.ts` + `src/app/globals.css`
as CSS variables; components never hardcode theme values. See
[`docs/design-system.md`](docs/design-system.md).

## License & ownership

You own your data. No vendor lock-in, no fabricated citations, no dark patterns.
See the [master context](.context/MASTER_CONTEXT.md) for the full product
philosophy.
