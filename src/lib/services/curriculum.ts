import { prisma } from '@/lib/db';
import type { GenerationResult } from '@/types';

/**
 * Persists a generated curriculum (modules → lessons → concepts → quizzes)
 * and its flashcards in a single transaction, with source chunks linked so
 * every item is traceable to its exact passage.
 */
export async function createCurriculumFromResult(
  userId: string,
  documentId: string,
  result: GenerationResult
) {
  const { curriculum, flashcards } = result;
  const chunks = await prisma.sourceChunk.findMany({
    where: { documentId },
    orderBy: { index: 'asc' },
  });
  const chunkIdAt = (index: number) => chunks[index]?.id ?? null;

  return prisma.$transaction(async (tx) => {
    const created = await tx.curriculum.create({
      data: {
        documentId,
        userId,
        title: curriculum.title,
        description: curriculum.description,
        status: 'draft',
        totalModules: curriculum.modules.length,
        modules: {
          create: curriculum.modules.map((m, mi) => ({
            title: m.title,
            description: m.description,
            order: mi,
            lessons: {
              create: m.lessons.map((l, li) => ({
                title: l.title,
                content: l.content,
                order: li,
                objectives: JSON.stringify(l.objectives),
                sourceRef: l.sourceRef,
                sourceChunkId: chunkIdAt(l.sourceChunkIndex),
                concepts: {
                  create: l.concepts.map((k) => ({
                    name: k.name,
                    definition: k.definition,
                    sourceRef: k.sourceRef,
                    sourceChunkId: chunkIdAt(k.sourceChunkIndex),
                  })),
                },
                quizzes: {
                  create: l.quizzes.map((q) => ({
                    type: q.type,
                    question: q.question,
                    options: q.options ? JSON.stringify(q.options) : null,
                    answer: q.answer,
                    explanation: q.explanation,
                    sourceRef: q.sourceRef,
                    sourceChunkId: chunkIdAt(q.sourceChunkIndex),
                  })),
                },
              })),
            },
          })),
        },
      },
    });

    // ── Flashcards, linked to concepts by (lesson, name) where possible ──
    const allConcepts = await tx.concept.findMany({
      where: { lesson: { module: { curriculumId: created.id } } },
      include: { lesson: true },
    });
    const frontTerm = (front: string) =>
      front.replace(/^what is /i, '').replace(/[?]+/g, '').trim().toLowerCase();

    const conceptRows = flashcards.map((f) => {
      const term = frontTerm(f.front);
      const concept =
        allConcepts.find((c) => c.name.toLowerCase() === term) ?? null;
      return {
        userId,
        curriculumId: created.id,
        conceptId: concept?.id ?? null,
        front: f.front,
        back: f.back,
        sourceRef: f.sourceRef,
        sourceChunkId: chunkIdAt(f.sourceChunkIndex),
        repetitions: 0,
        interval: 0,
        easeFactor: 2.5,
        dueDate: new Date(),
      };
    });
    await tx.flashcard.createMany({ data: conceptRows });

    await tx.document.update({ where: { id: documentId }, data: { status: 'ready' } });

    return created;
  });
}

/** The curriculum tree annotated with the user's progress for UI rendering. */
export async function getCurriculumWithProgress(userId: string, curriculumId: string) {
  const curriculum = await prisma.curriculum.findFirst({
    where: { id: curriculumId, userId },
    include: {
      document: true,
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            include: {
              concepts: { orderBy: { name: 'asc' } },
              quizzes: { orderBy: { id: 'asc' } },
            },
          },
        },
      },
    },
  });
  if (!curriculum) return null;

  const lessonIds = curriculum.modules.flatMap((m) => m.lessons.map((l) => l.id));
  const [progress, quizMastery, conceptMastery, flashcardCounts, dueCards] = await Promise.all([
    prisma.userProgress.findMany({ where: { userId, lessonId: { in: lessonIds } } }),
    prisma.masteryRecord.findMany({ where: { userId, quizId: { not: null } } }),
    prisma.masteryRecord.findMany({ where: { userId, conceptId: { not: null } } }),
    prisma.flashcard.count({ where: { curriculumId, userId } }),
    prisma.flashcard.count({ where: { curriculumId, userId, dueDate: { lte: new Date() } } }),
  ]);

  const progressByLesson = new Map(progress.map((p) => [p.lessonId, p]));
  const quizMasteryByQuiz = new Map(quizMastery.map((m) => [m.quizId!, m]));
  const conceptMasteryByConcept = new Map(conceptMastery.map((m) => [m.conceptId!, m]));

  const modules = curriculum.modules.map((m) => {
    let quizTotal = 0;
    let quizScore = 0;
    const lessons = m.lessons.map((l) => {
      const prog = progressByLesson.get(l.id);
      const quizzes = l.quizzes.map((q) => {
        const rec = quizMasteryByQuiz.get(q.id);
        if (rec) {
          quizTotal += 1;
          quizScore += rec.score;
        }
        return { ...q, options: safeJson(q.options), mastery: rec ?? null };
      });
      const concepts = l.concepts.map((c) => ({
        ...c,
        mastery: conceptMasteryByConcept.get(c.id) ?? null,
      }));
      return {
        ...l,
        objectives: safeJson(l.objectives),
        quizzes,
        concepts,
        progress: prog
          ? { completed: prog.completed, score: prog.score, attempts: prog.attempts, lastStudied: prog.lastStudied }
          : { completed: false, score: 0, attempts: 0, lastStudied: null },
      };
    });
    const moduleMastery = quizTotal > 0 ? quizScore / quizTotal : 0;
    return { ...m, lessons, mastery: Math.round(moduleMastery * 100) / 100 };
  });

  const scoredQuizzes = modules.flatMap((m) => m.lessons.flatMap((l) => l.quizzes)).filter((q) => q.mastery);
  const overallMastery =
    scoredQuizzes.length > 0
      ? Math.round((scoredQuizzes.reduce((s, q) => s + q.mastery!.score, 0) / scoredQuizzes.length) * 100) / 100
      : 0;

  return {
    ...curriculum,
    modules,
    overallMastery,
    totals: {
      lessons: curriculum.modules.reduce((s, m) => s + m.lessons.length, 0),
      lessonsCompleted: modules.reduce(
        (s, m) => s + m.lessons.filter((l) => l.progress.completed).length,
        0
      ),
      quizzes: curriculum.modules.reduce((s, m) => s + m.lessons.reduce((x, l) => x + l.quizzes.length, 0), 0),
      flashcards: flashcardCounts,
      dueCards,
    },
  };
}

function safeJson<T>(s: string | null): T | null {
  if (!s) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}
