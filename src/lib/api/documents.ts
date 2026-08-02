import { api } from './client';

export interface UploadedDocument {
  id: string;
  title: string;
  fileType: string;
  wordCount: number;
  chunks: number;
  outline: string[];
}

export function uploadFile(file: File, title?: string) {
  const form = new FormData();
  form.append('file', file);
  if (title) form.append('title', title);
  return api<{ document: UploadedDocument }>('/api/documents', { form });
}

export function uploadUrl(url: string) {
  return api<{ document: UploadedDocument }>('/api/documents', {
    method: 'POST',
    body: { url },
  });
}

export function uploadPaste(content: string, title?: string) {
  return api<{ document: UploadedDocument }>('/api/documents', {
    method: 'POST',
    body: { content, title },
  });
}

export interface GenerateResult {
  curriculumId: string;
  engine: string;
  durationMs: number;
  modules: number;
  flashcards: number;
  reused?: boolean;
}

export function generateCurriculum(documentId: string) {
  return api<GenerateResult>(`/api/documents/${documentId}/generate`, {
    method: 'POST',
    body: {},
  });
}
