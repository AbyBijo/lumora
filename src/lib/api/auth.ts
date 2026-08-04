import { api } from './client';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

export interface AuthSettings {
  theme: string;
  provider: string;
  model: string;
  streakGoalDays: number;
}

export function register(input: { email: string; password: string; name?: string }) {
  return api<{ user: AuthUser }>('/api/auth/register', { method: 'POST', body: input });
}

export function login(input: { email: string; password: string }) {
  return api<{ user: AuthUser }>('/api/auth/login', { method: 'POST', body: input });
}

export function logout() {
  return api<{ ok: boolean }>('/api/auth/logout', { method: 'POST' });
}

export function me() {
  return api<{ user: AuthUser; settings: AuthSettings | null }>('/api/auth/me');
}

export function changePassword(input: { currentPassword: string; newPassword: string }) {
  return api<{ ok: boolean }>('/api/auth/change-password', { method: 'POST', body: input });
}
