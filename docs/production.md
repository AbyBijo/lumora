# Lumora — Production Deployment Guide

How to run Lumora the way you would run it for real users.

## 1. Environment matrix

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | SQLite `file:./dev.db` (dev) or PostgreSQL URL (prod) |
| `APP_URL` | prod | Public origin — used for CSRF origin checks and links |
| `COOKIE_SECURE` | prod | `true` (default in prod) — keep TLS |
| `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` | no | Optional LLM generation upgrade |
| `OPENAI_MODEL` / `ANTHROPIC_MODEL` | no | Model overrides |

Missing required variables in production fail fast at boot (`src/lib/env.ts`).

## 2. Database

- **Dev:** SQLite, zero setup.
- **Prod:** PostgreSQL. Flip the datasource provider in
  `prisma/schema.prisma`:

  ```prisma
  datasource db {
    provider = "postgresql"   // was "sqlite"
    url      = env("DATABASE_URL")
  }
  ```

  Then create and apply migrations:

  ```bash
  npx prisma migrate deploy   # apply committed migrations
  ```

  Never use `prisma db push` in production — use migrations. The committed
  migration is `prisma/migrations/20260801180108_init_auth/`.

- Back up the database: SQLite → copy `prisma/dev.db`; Postgres →
  `pg_dump`/managed snapshots. Test restores.

## 3. Option A — Docker (PostgreSQL)

```bash
cp .env.example .env          # set POSTGRES_PASSWORD, APP_URL
# flip provider to postgresql in prisma/schema.prisma
docker compose up -d --build
```

- The app container runs `prisma migrate deploy` at startup
  (`docker-entrypoint.sh`).
- Health check: `GET /api/health` returns 200 + `{ db: true }`.
- Volume `db-data` persists Postgres.

> The Docker files were authored for this repo but **not built in this
> environment** (no Docker daemon available). Run `docker compose up -d
> --build` on your host; if anything is off, the fix is typically a missing
> runtime dependency copy in `Dockerfile` — report it and we'll patch it.

## 4. Option B — Vercel (frontend+API) + managed Postgres

1. Push the repo; import into Vercel.
2. Set env vars: `DATABASE_URL` (Postgres — Neon/Supabase/Railway), `APP_URL`,
   `COOKIE_SECURE=true`, optional LLM keys.
3. Provider must be `postgresql` in the schema.
4. Apply migrations from CI (see `.github/workflows/ci.yml` — extend with a
   `migrate` job running `npx prisma migrate deploy` against the prod DB) or a
   one-off `npx prisma migrate deploy`.
5. `npm run build` runs `prisma generate` first (see package.json `build`).

## 5. Termux / small devices

See `docs/termux.md`. The same auth applies: register an account — the app
starts empty.

## 6. Operations

- **Logs:** structured JSON on stdout. Ship to CloudWatch/Loki/Papertrail.
- **Health:** `/api/health` (liveness + DB).
- **Scale notes:**
  - Rate limiter is in-memory (per instance) — swap for Redis when scaling
    horizontally (`src/lib/server/rate-limit.ts`, same interface).
  - Sessions live in Postgres, so they are shared across instances already.
  - The generation engine is CPU-bound for large documents — consider a worker
    queue (Redis/BullMQ) at scale (roadmap Phase 2).
- **Security checklist:** `docs/security.md` §8.

## 7. Releases

1. `npm run lint && npm test && npm run build` green (CI does this).
2. Tag + push; CI runs the pipeline.
3. Deploy; watch `/api/health` and the error log.
4. Run `npx prisma migrate deploy` on the DB (compose does it automatically).
