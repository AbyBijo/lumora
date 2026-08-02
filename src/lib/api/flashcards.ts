import { api } from './client';
import type { SrsRating } from '@/lib/srs';

export interface DueCard {
  id: string;
  front: string;
  back: string;
  sourceRef: string | null;
  sourceText: string;
  interval: number;
  dueDate: string;
}

export function getDueCards(
  opts: { curriculumId?: string; mode?: 'review' | 'cram'; limit?: number } = {}
) {
  return api<{ cards: DueCard[]; total: number }>('/api/flashcards/due', {
    query: {
      curriculumId: opts.curriculumId,
      mode: opts.mode,
      limit: opts.limit,
    },
  });
}

export interface ReviewedCard {
  id: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
  dueDate: string;
}

export function reviewCard(id: string, rating: SrsRating) {
  return api<{ card: ReviewedCard }>(`/api/flashcards/${id}/review`, {
    method: 'POST',
    body: { rating },
  });
}
