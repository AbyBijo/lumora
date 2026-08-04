import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

/**
 * Minimal .env loader for non-Next.js entry points (scripts, workers).
 * Next.js loads .env.local natively; this covers `tsx scripts/*.ts`.
 * Only fills variables that are not already set.
 */
export function loadEnvFiles(): void {
  if (process.env.DATABASE_URL) return;
  const candidates = ['.env.local', '.env'];
  for (const f of candidates) {
    const p = resolve(process.cwd(), f);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (m && m[2] && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    }
    if (process.env.DATABASE_URL) return;
  }
}

/**
 * Fail-fast environment assertions for production deployments.
 * Call once at server boot (imported by lib/db.ts). Missing required
 * configuration should crash loudly, not degrade silently.
 */
export function assertEnv(required: string[] = ['DATABASE_URL']): void {
  if (process.env.NODE_ENV !== 'production') return;
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(
      `[lumora] Missing required environment variable(s) in production: ${missing.join(
        ', '
      )}. See .env.example`
    );
  }
}
