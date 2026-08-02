# Lumora — Security Model

Status: implemented in this repository · review whenever the auth surface changes

## 1. Authentication

- **Accounts.** Every user registers with an email + password (see
  `docs/adr/0008-auth.md`). There are no demo users or implicit sessions.
- **Password storage.** bcrypt (cost 12) via `bcryptjs` — pure JS, no native
  build issues on any platform (including Termux/proot). Policy enforced at
  registration and password change: ≥ 8 chars, letter + number, ≤ 128.
- **Registration race.** `email` is `@unique`; duplicates return a generic
  CONFLICT message. Login failures return a generic "Invalid email or
  password." so the API does not leak whether an account exists.
- **Timing equalization.** Login compares against a fixed dummy hash when the
  account is unknown, so response timing does not reveal account existence.

## 2. Sessions

- **Server-side sessions** (`Session` table). The browser holds an opaque
  32-byte random token in an `httpOnly`, `SameSite=Lax` cookie
  (`lumora_session`). Only the **SHA-256 hash** of the token is stored in the
  database — a DB leak cannot be replayed as a session.
- **Lifecycle**
  - Created on register/login; `Secure` flag set when `NODE_ENV=production`
    (override with `COOKIE_SECURE=false` only behind a trusted plain-HTTP
    proxy).
  - TTL 30 days; sliding expiry refreshes when more than half consumed.
  - Revoked on logout and on password change (all other sessions).
  - Expired sessions are deleted lazily (on login) and could be swept by a
    cron (`cleanupExpiredSessions`).
- **Multi-session.** A user may be signed in on several devices; each device
  has its own revocable session.

## 3. CSRF

Cookie-based auth is CSRF-prone, so:

- **SameSite=Lax** cookie (default browser protection).
- **Origin check middleware** (`src/middleware.ts`): any state-changing request
  with an `Origin` header that does not match the app host is rejected with
  403 before reaching any route.

## 4. Brute force & rate limiting

- In-memory sliding-window limiter (`src/lib/server/rate-limit.ts`):
  - General API: 120 req/min/IP.
  - Auth endpoints: 10 attempts / 15 min / IP.
- **Note:** in-memory means per-instance. For multi-instance deployments swap
  in a Redis-backed limiter with the same interface (`rateLimit(key, opts)`).

## 5. Transport & headers

- `Secure` cookies in production (TLS assumed).
- Security headers on every response (`next.config.mjs`):
  - `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
    `Referrer-Policy: strict-origin-when-cross-origin`,
    `Permissions-Policy` (camera/mic/geolocation disabled),
    CSP (`default-src 'self'`, `frame-ancestors 'none'`).
  - CSP currently allows `script-src 'unsafe-inline'` because Next.js injects
    an inline bootstrap; **nonce-based CSP is the next hardening step.**

## 6. Data & traceability

- All user data is scoped by `userId` on every query (document, curriculum,
  flashcard, progress, sessions). Ownership checks use `findFirst({ where: {
  id, userId } })`.
- Generated content is source-grounded: every item stores `sourceChunkId` +
  `sourceRef`; the UI renders the source passage verbatim. No fabricated
  citations by design (ADR 0003).
- The `Local Engine` sends no data anywhere; provider calls (OpenAI/Anthropic)
  are optional and gated by server-side keys — never client-side.

## 7. Error handling

- The API never leaks stack traces: all failures serialize to
  `{ error: { code, message, details? } }`; unexpected errors return a generic
  INTERNAL message (details logged server-side via the JSON logger).

## 8. Operations checklist

- [ ] Force TLS in production (terminate at LB/proxy); keep `COOKIE_SECURE=true`.
- [ ] Set `APP_URL` to the public origin.
- [ ] Keep provider keys server-side only.
- [ ] For multi-instance: Redis rate limiting (same interface), and consider
      moving sessions to a shared store (they already live in the DB, so they
      are shared by design).
- [ ] Backup the database regularly (SQLite file or Postgres dumps).
- [ ] Watch `/api/health` from your uptime monitor.

## 9. Known follow-ups (Phase 2+)

- Email verification (`emailVerifiedAt` column reserved) and password reset.
- Nonce-based CSP; subresource integrity.
- Audit log table for sensitive actions.
- WebAuthn/passkeys.
