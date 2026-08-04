import { prisma } from '@/lib/db';
import { masteryFromOutcomes, reviewSrsCard, type SrsRating } from '@/lib/srs';
import { AppError } from '@/lib/server/errors';

/**
 * The study loop: answering questions updates mastery records, rolls the
 * lesson score, logs the activity (streaks), and reschedules concept reviews
 * through the same SM-2 machinery used by flashcards.
 */

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[.,;:!?"'’‘“”()\[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isCorrect(quizType: string, expected: string, given: string): boolean {
  const e = normalize(expected);
  const g = normalize(given);
  if (!e || !g) return false;
  if (e === g) return true;
  if (quizType === 'short-answer') {
    // Lenient: substantial overlap in either direction.
    const a = e.split(' ');
    const b = g.split(' ');
    const overlap = a.filter((w) => b.includes(w)).length / Math.max(a.length, 1);
    return overlap >= 0.6 || b.filter((w) => a.includes(w)).length / Math.max(b.length, 1) >= 0.6;
  }
  return false;
}

export interface AnswerResult {
  correct: boolean;
  expected: string;
  explanation: string;
  sourceRef: string;
  sourceText: string;
  sourceChunkId: string | null;
  lessonId: string;
}

export async function answerQuiz(
  userId: string,
  quizId: string,
  givenAnswer: string
): Promise<AnswerResult> {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      lesson: { include: { module: { include: { curriculum: true } } } },
      sourceChunk: true,
    },
  });
  if (!quiz) throw AppError.notFound('Question not found.');

  const correct = isCorrect(quiz.type, quiz.answer, givenAnswer);
  const outcome = correct ? 1 : 0;

  // 1) Quiz-level mastery record (EMA of outcomes).
  const existing = await prisma.masteryRecord.findUnique({
    where: { userId_quizId: { userId, quizId } },
  });
  const prevOutcomes = existing
    ? [...Array(Math.max(0, existing.attempts - 1)).fill(existing.score >= 0.5), outcome]
    : [outcome];
  const newScore = masteryFromOutcomes(prevOutcomes.map(Boolean));
  await prisma.masteryRecord.upsert({
    where: { userId_quizId: { userId, quizId } },
    create: {
      userId,
      quizId,
      score: newScore,
      attempts: 1,
      lastAttempted: new Date(),
      mastered: newScore >= 0.85,
    },
    update: {
      score: newScore,
      attempts: { increment: 1 },
      lastAttempted: new Date(),
      mastered: newScore >= 0.85,
    },
  });

  // 2) Roll the lesson score.
  const lesson = quiz.lesson;
  const lessonQuizzes = await prisma.quiz.count({ where: { lessonId: lesson.id } });
  const lessonQuizIds = (await prisma.quiz.findMany({ where: { lessonId: lesson.id }, select: { id: true } })).map((q) => q.id);
  const records = await prisma.masteryRecord.findMany({ where: { userId, quizId: { in: lessonQuizIds } } });
  const answered = records.length;
  const avg = records.length ? records.reduce((s, r) => s + r.score, 0) / records.length : 0;

  const curriculum = lesson.module.curriculum;
  await prisma.userProgress.upsert({
    where: { userId_lessonId: { userId, lessonId: lesson.id } },
    create: {
      userId,
      curriculumId: curriculum.id,
      lessonId: lesson.id,
      score: avg,
      attempts: 1,
      completed: answered >= lessonQuizzes,
      lastStudied: new Date(),
    },
    update: {
      score: avg,
      attempts: { increment: 1 },
      completed: answered >= lessonQuizzes,
      lastStudied: new Date(),
    },
  });

  // 3) Activity log (drives streaks & analytics).
  await prisma.reviewLog.create({
    data: { userId, quizId, kind: 'quiz', correct, reviewedAt: new Date() },
  });

  // 4) Recompute module + curriculum mastery.
  await refreshMastery(userId, curriculum.id, lesson.moduleId);

  return {
    correct,
    expected: quiz.answer,
    explanation: quiz.explanation ?? '',
    sourceRef: quiz.sourceRef ?? '',
    sourceText: quiz.sourceChunk?.text ?? '',
    sourceChunkId: quiz.sourceChunkId,
    lessonId: lesson.id,
  };
}

export async function completeLesson(userId: string, lessonId: string, completed: boolean) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { curriculum: true } } },
  });
  if (!lesson) throw AppError.notFound('Lesson not found.');
  const record = await prisma.userProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    create: {
      userId,
      curriculumId: lesson.module.curriculumId,
      lessonId,
      completed,
      lastStudied: new Date(),
    },
    update: { completed, lastStudied: new Date() },
  });
  await prisma.reviewLog.create({
    data: { userId, kind: 'lesson', correct: null, reviewedAt: new Date() },
  });
  return record;
}

export async function reviewFlashcard(userId: string, flashcardId: string, rating: SrsRating) {
  const card = await prisma.flashcard.findUnique({ where: { id: flashcardId } });
  if (!card || card.userId !== userId) throw AppError.notFound('Card not found.');

  const next = reviewSrsCard(
    { repetitions: card.repetitions, interval: card.interval, easeFactor: card.easeFactor },
    rating
  );

  const updated = await prisma.flashcard.update({
    where: { id: flashcardId },
    data: {
      repetitions: next.repetitions,
      interval: next.interval,
      easeFactor: next.easeFactor,
      dueDate: next.dueDate,
      lastReviewedAt: new Date(),
    },
  });

  await prisma.reviewLog.create({
    data: {
      userId,
      flashcardId,
      kind: 'flashcard',
      rating,
      correct: rating !== 'again',
      reviewedAt: new Date(),
    },
  });

  // If the card is linked to a concept, fold its outcome into concept mastery.
  if (card.conceptId) {
    const rec = await prisma.masteryRecord.findUnique({
      where: { userId_conceptId: { userId, conceptId: card.conceptId } },
    });
    const prev = rec ? rec.score : 0.5;
    const step = rating === 'again' ? -0.2 : rating === 'hard' ? 0.05 : rating === 'good' ? 0.1 : 0.18;
    const newScore = Math.max(0, Math.min(1, prev + step));
    await prisma.masteryRecord.upsert({
      where: { userId_conceptId: { userId, conceptId: card.conceptId } },
      create: {
        userId,
        conceptId: card.conceptId,
        score: newScore,
        attempts: 1,
        lastAttempted: new Date(),
        mastered: newScore >= 0.85,
      },
      update: {
        score: newScore,
        attempts: { increment: 1 },
        lastAttempted: new Date(),
        mastered: newScore >= 0.85,
      },
    });
    const lesson = await prisma.concept.findUnique({ where: { id: card.conceptId }, select: { lesson: { select: { module: { select: { curriculumId: true, id: true } } } } } });
    if (lesson) {
      await refreshMastery(userId, lesson.lesson.module.curriculumId, lesson.lesson.module.id);
    }
  }

  return updated;
}

/** Recompute stored module + curriculum mastery from quiz records. */
export async function refreshMastery(userId: string, curriculumId: string, moduleId?: string) {
  const modules = moduleId
    ? await prisma.module.findMany({ where: { id: moduleId } })
    : await prisma.module.findMany({ where: { curriculumId } });

  for (const m of modules) {
    const quizzes = await prisma.quiz.findMany({ where: { lesson: { moduleId: m.id } }, select: { id: true } });
    const quizIds = quizzes.map((q) => q.id);
    const records = await prisma.masteryRecord.findMany({ where: { userId, quizId: { in: quizIds } } });
    const score = records.length ? records.reduce((s, r) => s + r.score, 0) / records.length : 0;
    await prisma.module.update({ where: { id: m.id }, data: { masteryScore: Math.round(score * 100) / 100 } });
  }

  const allModules = await prisma.module.findMany({ where: { curriculumId } });
  const overall = allModules.length
    ? allModules.reduce((s, m) => s + m.masteryScore, 0) / allModules.length
    : 0;
  await prisma.curriculum.update({
    where: { id: curriculumId },
    data: { masteryScore: Math.round(overall * 100) / 100 },
  });
}
