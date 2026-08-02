import { createHash, randomBytes } from 'crypto';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import type { User } from '@prisma/client';
import { AppError } from '@/lib/server/errors';

/**
 * Server-side sessions.
 *
 *  - The browser holds an opaque random token in an httpOnly, SameSite cookie.
 *  - The database stores only the SHA-256 hash of that token, so a DB leak
 *    cannot be replayed as a session.
 *  - Sessions are revocable (logout, password change) and expire.
 */

export const SESSION_COOKIE = 'lumora_session';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const SLIDE_AFTER_MS = 12 * 60 * 60 * 1000; // refresh lastUsedAt after 12h

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function cookieOptions(): {
  httpOnly: boolean;
  sameSite: 'lax';
  secure: boolean;
  path: string;
  maxAge: number;
} {
  const secure = process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE !== 'false';
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  };
}

/** Create a session for a user, returning the raw cookie token. */
export async function createSession(
  userId: string,
  meta: { ip?: string | null; userAgent?: string | null } = {}
): Promise<string> {
  const token = randomBytes(32).toString('base64url');
  await prisma.session.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      ip: meta.ip ?? null,
      userAgent: meta.userAgent ?? null,
    },
  });
  return token;
}

/** Resolve the current user from the session cookie, or null. */
export async function getSessionUser(): Promise<User | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!session) return null;
  if (session.revokedAt) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }

  // Sliding expiry: extend the session when it is more than half consumed.
  const remaining = session.expiresAt.getTime() - Date.now();
  if (remaining < SESSION_TTL_MS / 2) {
    await prisma.session
      .update({
        where: { id: session.id },
        data: { expiresAt: new Date(Date.now() + SESSION_TTL_MS) },
      })
      .catch(() => undefined);
  } else if (Date.now() - session.lastUsedAt.getTime() > SLIDE_AFTER_MS) {
    await prisma.session
      .update({ where: { id: session.id }, data: { lastUsedAt: new Date() } })
      .catch(() => undefined);
  }

  return session.user;
}

export async function requireUser(): Promise<User> {
  const user = await getSessionUser();
  if (!user) throw AppError.unauthorized();
  return user;
}

/** Revoke the current session and clear the cookie. */
export async function destroyCurrentSession(): Promise<void> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session
      .deleteMany({ where: { tokenHash: hashToken(token) } })
      .catch(() => undefined);
  }
  cookies().delete(SESSION_COOKIE);
}

/** Revoke every session for a user except the current one. */
export async function revokeOtherSessions(userId: string): Promise<void> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  await prisma.session.updateMany({
    where: {
      userId,
      ...(token ? { tokenHash: { not: hashToken(token) } } : {}),
      revokedAt: null,
    },
    data: { revokedAt: new Date() },
  });
}

export async function revokeAllSessions(userId: string): Promise<void> {
  await prisma.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

/** Best-effort cleanup of expired sessions (call occasionally, e.g. on login). */
export async function cleanupExpiredSessions(): Promise<number> {
  const res = await prisma.session.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  return res.count;
}
