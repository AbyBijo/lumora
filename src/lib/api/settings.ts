import { api } from './client';

export interface UserSettings {
  id: string;
  theme: string;
  provider: string;
  model: string;
  streakGoalDays: number;
}

export function patchSettings(
  input: {
    theme?: 'dark' | 'light';
    provider?: 'local' | 'openai' | 'anthropic';
    model?: string;
    streakGoalDays?: number;
  }
) {
  return api<{ settings: UserSettings }>('/api/settings', {
    method: 'PATCH',
    body: input,
  });
}
