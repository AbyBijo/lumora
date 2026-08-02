# Lumora — API Conventions

This is the blueprint for **how to add API functionality**. Lumora keeps three
layers in dedicated folders; every endpoint lives in exactly one place and
follows one pattern.

```
src/app/api/<domain>/route.ts        # 1. HTTP layer — one file per endpoint
src/lib/server/                      # 2. Shared server toolkit (apiHandler, errors, …)
src/lib/api/<domain>.ts              # 3. Typed client — how the browser calls the API
```

## The contract

**Success:** `{ "data": … }`
**Failure:** `{ "error": { "code", "message", "details?" } }`

| code | status | meaning |
| --- | --- | --- |
| `UNAUTHORIZED` | 401 | not signed in / bad credentials |
| `FORBIDDEN` | 403 | CSRF / not allowed |
| `NOT_FOUND` | 404 | resource missing |
| `VALIDATION` | 400 | zod schema rejected input |
| `CONFLICT` | 409 | uniqueness clash (e.g. duplicate email) |
| `RATE_LIMITED` | 429 | too many requests |
| `UNPROCESSABLE` | 422 | e.g. unparseable file |
| `INTERNAL` | 500 | unexpected (details logged, never leaked) |

## Step 1 — the route (`src/app/api/<domain>/route.ts`)

```ts
import { z } from 'zod';
import { apiHandler } from '@/lib/server/api';

const paramsSchema = z.object({ id: z.string().min(1) });
const bodySchema = z.object({ rating: z.enum(['again', 'hard', 'good', 'easy']) });

export const POST = apiHandler({
  auth: true,            // requires a signed-in user (user is injected)
  params: paramsSchema,  // validated route params
  body: bodySchema,      // validated JSON body (omit for GET/multipart)
  // limit: LIMITS.auth, // optional stricter rate limit
  handler: async ({ params, body, user }) => {
    // …business logic (keep it in a service under src/lib/services)…
    return { ok: true };
  },
});
```

Rules:

- Route handlers are **thin**: parse → delegate to a service
  (`src/lib/services/…`) → return. No business logic in the route.
- To set cookies (login/register/logout), return a `NextResponse` from the
  handler — the factory passes it through.
- Ownership checks: use `prisma.x.findFirst({ where: { id, userId } })` — never
  trust an id alone.
- Throw `AppError` from services (`AppError.notFound('…')`, …). The factory
  serializes it; anything else becomes a logged `INTERNAL` 500.

## Step 2 — errors (`src/lib/server/errors.ts`)

`AppError(code, message, details?)` with static constructors
(`AppError.validation`, `.notFound`, `.unauthorized`, `.conflict`,
`.rateLimited`, `.unprocessable`, `.forbidden`).

## Step 3 — the typed client (`src/lib/api/<domain>.ts`)

```ts
import { api } from './client';

export function reviewCard(id: string, rating: SrsRating) {
  return api<{ card: ReviewedCard }>(`/api/flashcards/${id}/review`, {
    method: 'POST',
    body: { rating },
  });
}
```

`api<T>()` (in `src/lib/api/client.ts`) unwraps `{ data }`, throws `ApiError`
with `.status` and `.code`, and supports `query` objects and `form` (multipart).
Call it from components with `credentials: 'same-origin'` (default).

## Endpoint reference

### Auth
| Method | Path | Auth | Body | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/auth/register` | – | email, password, name? | creates account + session |
| POST | `/api/auth/login` | – | email, password | starts a session |
| POST | `/api/auth/logout` | ✓ | – | revokes session, clears cookie |
| GET | `/api/auth/me` | ✓ | – | user + settings |
| POST | `/api/auth/change-password` | ✓ | currentPassword, newPassword | revokes other sessions |
| GET | `/api/health` | – | – | liveness + DB probe |

### Documents
| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST | `/api/documents` | ✓ | multipart file, `{url}`, or `{content}` |
| POST | `/api/documents/[id]/generate` | ✓ | runs Document → Curriculum |

### Curricula
| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/api/curricula/[id]` | ✓ | full tree + progress |
| PATCH | `/api/curricula/[id]` | ✓ | rename / description / approve |

### Study
| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST | `/api/quizzes/[id]/answer` | ✓ | grades, updates mastery, returns source feedback |
| POST | `/api/lessons/[id]/complete` | ✓ | marks lesson complete |

### Flashcards
| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/api/flashcards/due` | ✓ | `?curriculumId&mode=review|cram&limit` |
| POST | `/api/flashcards/[id]/review` | ✓ | SM-2 transition |

### Dashboard & settings
| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/api/dashboard` | ✓ | mastery, streaks, due cards, weak areas |
| PATCH | `/api/settings` | ✓ | theme / provider / model / streak goal |

## How to add a new endpoint (3 steps)

1. Create `src/app/api/<domain>/route.ts` with `export const GET|POST|PATCH = apiHandler({...})`.
2. Add the service function in `src/lib/services/<domain>.ts` (or reuse one).
3. Add a typed wrapper in `src/lib/api/<domain>.ts` and call it from the UI.

Run `npm run lint && npm test` before shipping; add a unit test for any pure
logic (`src/**/*.test.ts`).
