import { api } from './client';

export interface AnswerFeedback {
  correct: boolean;
  expected: string;
  explanation: string;
  sourceRef: string;
  sourceText: string;
  sourceChunkId: string | null;
  lessonId: string;
}

export function answerQuiz(quizId: string, answer: string) {
  return api<{ result: AnswerFeedback }>(`/api/quizzes/${quizId}/answer`, {
    method: 'POST',
    body: { answer },
  });
}

export function completeLesson(lessonId: string, completed = true) {
  return api<{ record: unknown }>(`/api/lessons/${lessonId}/complete`, {
    method: 'POST',
    body: { completed },
  });
}
