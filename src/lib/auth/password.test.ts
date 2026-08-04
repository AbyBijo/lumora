import { describe, it, expect } from 'vitest';
import { validatePassword, isEmail, hashPassword, verifyPassword } from './password';

describe('validatePassword', () => {
  it('rejects short passwords', () => {
    expect(validatePassword('Ab1')).not.toBeNull();
    expect(validatePassword('abcdefg1')).toBeNull();
  });

  it('requires a letter', () => {
    expect(validatePassword('12345678')).not.toBeNull();
  });

  it('requires a number', () => {
    expect(validatePassword('abcdefgh')).not.toBeNull();
  });

  it('rejects very long passwords', () => {
    expect(validatePassword('Ab1' + 'x'.repeat(200))).not.toBeNull();
  });

  it('accepts a valid password', () => {
    expect(validatePassword('LumoraDev123!')).toBeNull();
  });
});

describe('isEmail', () => {
  it('accepts normal emails', () => {
    expect(isEmail('a@b.co')).toBe(true);
    expect(isEmail('first.last+tag@example.org')).toBe(true);
  });
  it('rejects malformed emails', () => {
    expect(isEmail('nope')).toBe(false);
    expect(isEmail('a@b')).toBe(false);
    expect(isEmail('')).toBe(false);
  });
});

describe('hashPassword / verifyPassword', () => {
  it('round-trips', async () => {
    const hash = await hashPassword('LumoraDev123!');
    expect(hash).not.toContain('LumoraDev123!');
    expect(await verifyPassword('LumoraDev123!', hash)).toBe(true);
    expect(await verifyPassword('wrong', hash)).toBe(false);
  });

  it('returns false for garbage hashes instead of throwing', async () => {
    expect(await verifyPassword('x', 'not-a-hash')).toBe(false);
  });
});
