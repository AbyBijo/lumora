import { api } from './client';

export function getCurriculum(id: string) {
  return api<{ curriculum: unknown }>(`/api/curricula/${id}`);
}

export function patchCurriculum(
  id: string,
  input: { title?: string; description?: string; status?: 'draft' | 'approved' }
) {
  return api<{ curriculum: unknown }>(`/api/curricula/${id}`, {
    method: 'PATCH',
    body: input,
  });
}
