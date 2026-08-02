'use client';

import { useEffect } from 'react';
import Link from 'next/link';

/** Root error boundary — a calm, on-brand fallback instead of a raw stack. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Report to your error tracker here (Sentry etc.).
    console.error(error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen items-center justify-center bg-background px-6 font-sans text-foreground">
        <div className="max-w-sm text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">500</p>
          <h1 className="mt-2 text-xl font-semibold tracking-tight">Something went wrong</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            An unexpected error occurred{error.digest ? ` (ref ${error.digest})` : ''}. Your
            learning data is safe.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={reset}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Try again
            </button>
            <Link
              href="/dashboard"
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
