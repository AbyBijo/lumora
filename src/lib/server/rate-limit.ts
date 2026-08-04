import { AppError } from './errors';

/**
 * In-memory sliding-window rate limiter.
 *
 * Suitable for a single-instance deployment. If you scale to multiple
 * instances, swap this for a Redis-backed limiter (same interface) — see
 * docs/security.md. Expired buckets are pruned lazily to bound memory.
 */

const buckets = new Map<string, number[]>();
const PRUNE_EVERY = 10_000; // ms
let lastPrune = Date.now();

interface Options {
  windowMs: number;
  max: number;
}

export function rateLimit(key: string, opts: Options): void {
  const now = Date.now();

  // Lazy pruning — bounded memory.
  if (now - lastPrune > PRUNE_EVERY) {
    for (const [k, times] of buckets) {
      const alive = times.filter((t) => now - t < opts.windowMs);
      if (alive.length === 0) buckets.delete(k);
      else buckets.set(k, alive);
    }
    lastPrune = now;
  }

  const times = (buckets.get(key) ?? []).filter((t) => now - t < opts.windowMs);
  if (times.length >= opts.max) {
    throw AppError.rateLimited('Too many requests. Please try again shortly.');
  }
  times.push(now);
  buckets.set(key, times);
}

/** Standard limits shared by the API layer. */
export const LIMITS = {
  /** General API: 120 requests / minute / IP. */
  api: { windowMs: 60_000, max: 120 },
  /** Auth: 10 attempts / 15 min / IP+key. */
  auth: { windowMs: 900_000, max: 10 },
} satisfies Record<string, Options>;
