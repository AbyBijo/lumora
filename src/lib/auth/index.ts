/**
 * Lumora auth facade — the single seam between the app and its auth system.
 *
 * Sign-in / registration / session management. The old demo-auth path has been
 * removed (see docs/adr/0008-auth.md): every user now has a real account with
 * a hashed password and revocable server-side sessions.
 */

import { prisma } from '@/lib/db';
import { AppError } from '@/lib/server/errors';
import { hashPassword, verifyPassword, validatePassword, isEmail } from './password';
import {
  createSession,
  getSessionUser,
  requireUser,
  destroyCurrentSession,
  revokeOtherSessions,
  revokeAllSessions,
  cleanupExpiredSessions,
  cookieOptions,
} from './session';

export { getSessionUser, requireUser, revokeAllSessions };

export interface AuthResult {
  user: { id: string; email: string; name: string | null; createdAt: Date };
  sessionToken: string;
}

function publicUser(user: { id: string; email: string; name: string | null; createdAt: Date }) {
  return { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt };
}

export async function signUp(
  input: { email: string; password: string; name?: string },
  meta: { ip?: string | null; userAgent?: string | null } = {}
): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();
  if (!isEmail(email)) throw AppError.validation('Enter a valid email address.');
  const pwError = validatePassword(input.password);
  if (pwError) throw AppError.validation(pwError);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw AppError.conflict('An account with this email already exists.');
  }

  const name = input.name?.trim().slice(0, 80) || null;
  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: await hashPassword(input.password),
      settings: { create: {} },
    },
  });

  const sessionToken = await createSession(user.id, meta);
  return { user: publicUser(user), sessionToken };
}

export async function signIn(
  input: { email: string; password: string },
  meta: { ip?: string | null; userAgent?: string | null } = {}
): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  // Constant-ish work regardless of user existence (compare against a dummy hash).
  const ok = user
    ? await verifyPassword(input.password, user.passwordHash)
    : await verifyPassword(input.password, DUMMY_HASH);
  if (!user || !ok) {
    throw AppError.unauthorized('Invalid email or password.');
  }
  await cleanupExpiredSessions().catch(() => undefined);
  const sessionToken = await createSession(user.id, meta);
  return { user: publicUser(user), sessionToken };
}

/** Hash of a random password, used to equalize timing for unknown accounts. */
const DUMMY_HASH =
  '$2b$12$9/t.6LSCJxMktn/bbeafnuKNNgXU0vmF7AgDdWGGM8tFE5QTnwERe';

export async function signOut(): Promise<void> {
  await destroyCurrentSession();
}

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  const user = await requireUser();
  const stored = await prisma.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
  if (!stored) throw AppError.notFound();
  const ok = await verifyPassword(input.currentPassword, stored.passwordHash);
  if (!ok) throw AppError.unauthorized('Current password is incorrect.');

  const pwError = validatePassword(input.newPassword);
  if (pwError) throw AppError.validation(pwError);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(input.newPassword) },
  });
  // Revoke other sessions — a changed password means the old one is compromised.
  await revokeOtherSessions(user.id);
}

export async function me() {
  const user = await requireUser();
  const settings = await prisma.userSettings.findUnique({ where: { userId: user.id } });
  return {
    user: publicUser(user),
    settings: settings ?? null,
  };
}

export function requestMetaFrom(req: Request): { ip?: string | null; userAgent?: string | null } {
  return {
    ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip'),
    userAgent: req.headers.get('user-agent'),
  };
}

export { cookieOptions };
