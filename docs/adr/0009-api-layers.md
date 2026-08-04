# ADR 0009 — Standardized API layers

- **Status:** Accepted
- **Date:** 2026-08-01
- **Context:** The API grew organically; routes duplicated auth, validation,
  error handling, and logging. Adding endpoints was inconsistent. Production
  requires one contract and a repeatable pattern.
- **Decision:**
  - **Server toolkit** (`src/lib/server/`): `apiHandler` factory, `AppError`
    envelope, JSON logger, in-memory rate limiter.
  - **HTTP layer** (`src/app/api/<domain>/route.ts`): thin handlers — auth via
    `auth: true`, zod validation of body/query/params, delegation to services.
  - **Client layer** (`src/lib/api/<domain>.ts`): typed wrappers over
    `api<T>()` which unwraps `{ data }` and throws `ApiError`.
  - Every endpoint returns `{ data }` / `{ error: { code, message, details? } }`.
- **Consequences:** Adding an endpoint is a documented 3-step process
  (see `docs/api.md`); error handling, rate limits, logging, and auth are
  uniform; the client and server can never disagree on the envelope.
