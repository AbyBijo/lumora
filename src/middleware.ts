import { NextResponse, type NextRequest } from 'next/server';

/**
 * Lumora middleware — cross-cutting request protection.
 *
 * Currently: CSRF origin check for state-changing API requests.
 * Cookie-based auth is vulnerable to CSRF; this blocks any mutating request
 * whose Origin header does not match the app's own host. Requests without an
 * Origin header (curl, same-origin fetch) are allowed and protected by the
 * SameSite=Lax cookie policy.
 */

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function middleware(req: NextRequest) {
  if (MUTATING.has(req.method)) {
    const origin = req.headers.get('origin');
    if (origin) {
      let matches = false;
      try {
        const originHost = new URL(origin).host;
        // `host` may include a port; compare against both hostname forms.
        const host = req.headers.get('host') ?? '';
        matches = originHost === host || originHost === host.split(':')[0];
      } catch {
        matches = false;
      }
      if (!matches) {
        return NextResponse.json(
          { error: { code: 'FORBIDDEN', message: 'Cross-origin request blocked.' } },
          { status: 403 }
        );
      }
    }
  }

  const res = NextResponse.next();
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return res;
}

export const config = {
  matcher: ['/api/:path*'],
};
