import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { User } from '@prisma/client';
import { AppError, toAppError } from './errors';
import { logger } from './logger';
import { rateLimit, LIMITS } from './rate-limit';
import { requireUser } from '@/lib/auth';

/**
 * The Lumora API handler factory.
 *
 * Every endpoint in `src/app/api/<domain>/route.ts` is wrapped in `apiHandler`,
 * which guarantees:
 *   - auth (when `auth: true`)
 *   - zod validation of body / query / params
 *   - rate limiting (per IP)
 *   - a consistent envelope:  { data: … } on success
 *                             { error: { code, message, details? } } on failure
 *   - structured logging of failures
 *
 * HOW TO ADD AN ENDPOINT — see docs/api.md:
 *   1. Put your route in `src/app/api/<domain>/<...>/route.ts`
 *   2. Export a handler built with `apiHandler({ auth?, body?, query?, params?,
 *      handler })`
 *   3. Call it from the client via a typed wrapper in `src/lib/api/<domain>.ts`
 */

export interface HandlerInput<
  B extends z.ZodTypeAny | undefined,
  Q extends z.ZodTypeAny | undefined,
  P extends z.ZodTypeAny | undefined,
> {
  body: B extends z.ZodTypeAny ? z.infer<B> : undefined;
  query: Q extends z.ZodTypeAny ? z.infer<Q> : undefined;
  params: P extends z.ZodTypeAny ? z.infer<P> : Record<string, string>;
  user: User | null;
  req: Request;
}

export type HandlerFn<
  B extends z.ZodTypeAny | undefined,
  Q extends z.ZodTypeAny | undefined,
  P extends z.ZodTypeAny | undefined,
> = (input: HandlerInput<B, Q, P>) => Promise<unknown>;

export interface ApiHandlerOpts<
  B extends z.ZodTypeAny | undefined = undefined,
  Q extends z.ZodTypeAny | undefined = undefined,
  P extends z.ZodTypeAny | undefined = undefined,
> {
  /** Require a signed-in user. */
  auth?: boolean;
  /** Zod schema for the JSON body. Omit for multipart/no-body routes. */
  body?: B;
  /** Zod schema for URL query params. */
  query?: Q;
  /** Zod schema for route params (path params). */
  params?: P;
  /** Rate-limit this endpoint (per IP). Defaults to the general API limit. */
  limit?: { windowMs: number; max: number } | false;
  /**
   * The route logic. Return a plain value (serialized as { data }), or a
   * NextResponse (returned as-is — used when the handler must set cookies).
   */
  handler: HandlerFn<B, Q, P>;
}

export function apiHandler<
  B extends z.ZodTypeAny | undefined = undefined,
  Q extends z.ZodTypeAny | undefined = undefined,
  P extends z.ZodTypeAny | undefined = undefined,
>(opts: ApiHandlerOpts<B, Q, P>) {
  return async (req: Request, routeCtx: { params: Record<string, string> }): Promise<NextResponse> => {
    const started = Date.now();
    try {
      const url = new URL(req.url);
      const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        'local';

      if (opts.limit !== false) {
        rateLimit(`api:${ip}:${url.pathname}`, opts.limit ?? LIMITS.api);
      }

      let user: User | null = null;
      if (opts.auth) user = await requireUser();

      // Body — only parse when the request actually carries JSON, so optional
      // schemas work with empty bodies and required schemas still reject them.
      let body: unknown = undefined;
      if (opts.body) {
        const isJson = (req.headers.get('content-type') ?? '').includes('application/json');
        const hasContent = Number(req.headers.get('content-length') ?? '0') > 0;
        if (isJson && hasContent) {
          const raw = await req.json().catch(() => {
            throw AppError.validation('Request body must be valid JSON.');
          });
          body = opts.body.parse(raw);
        } else {
          // Empty request → let the schema decide (required → validation error).
          body = opts.body.parse(undefined);
        }
      }

      // Query
      let query: unknown = undefined;
      if (opts.query) {
        const entries = Object.fromEntries(url.searchParams.entries());
        query = opts.query.parse(entries);
      }

      // Params
      let params: unknown = routeCtx?.params ?? {};
      if (opts.params) {
        params = opts.params.parse(routeCtx?.params ?? {});
      }

      const result = await opts.handler({
        body,
        query,
        params,
        user,
        req,
      } as HandlerInput<B, Q, P>);

      if (result instanceof NextResponse) return result;

      return NextResponse.json({ data: result });
    } catch (e) {
      const err = toAppError(e);
      logger.warn('[api] request failed', {
        method: req.method,
        path: new URL(req.url).pathname,
        code: err.code,
        status: err.status,
        ms: Date.now() - started,
      });
      return NextResponse.json(
        {
          error: {
            code: err.code,
            message: err.message,
            ...(err.details !== undefined ? { details: err.details } : {}),
          },
        },
        { status: err.status }
      );
    }
  };
}
