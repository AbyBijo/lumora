import { prisma } from '@/lib/db';
import { startOfDay, addDays, dayKey } from '@/lib/utils';

/**
 * Dashboard + mastery analytics.
 */

/** Current consecutive-day streak given a list of activity timestamps. */
export function currentStreak(dates: Date[]): number {
  const days = new Set<string>();
  for (const d of dates) days.add(dayKey(d));
  let current = 0;
  const cursor = startOfDay();
  if (days.has(dayKey(cursor))) {
    current = 1;
    let d = addDays(cursor, -1);
    while (days.has(dayKey(d))) {
      current += 1;
      d = addDays(d, -1);
    }
  } else {
    // Allow a streak to survive today if there was activity yesterday.
    const y = addDays(cursor, -1);
    if (days.has(dayKey(y))) {
      current = 1;
      let d = addDays(y, -1);
      while (days.has(dayKey(d))) {
        current += 1;
        d = addDays(d, -1);
      }
    }
  }
  return current;
}

export interface DashboardData {
  stats: {
    documents: number;
    curricula: number;
    lessonsCompleted: number;
    lessonsTotal: number;
    quizzesAnswered: number;
    cardsDue: number;
    cardsTotal: number;
  };
  overallMastery: number | null;
  streak: { current: number; best: number };
  minutesStudied: number;
  dueByDay: { date: string; count: number }[];
  recentActivity: { id: string; kind: string; title: string; at: Date }[];
  weakAreas: { moduleId: string; moduleTitle: string; curriculumTitle: string; curriculumId: string; mastery: number }[];
  curricula: {
    id: string;
    title: string;
    documentTitle: string;
    mastery: number;
    status: string;
    updatedAt: Date;
    moduleCount: number;
    lessonsCompleted: number;
    lessonsTotal: number;
    dueCards: number;
    createdAt: Date;
  }[];
}

export async function getDashboard(userId: string): Promise<DashboardData> {
  const [documents, curricula, lessonsCompleted, quizzesAnswered, cardsDue, cardsTotal, reviewLogs, progressRows] =
    await Promise.all([
      prisma.document.count({ where: { userId } }),
      prisma.curriculum.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        include: {
          document: { select: { title: true } },
          _count: { select: { modules: true, flashcards: true } },
        },
      }),
      prisma.userProgress.count({ where: { userId, completed: true } }),
      prisma.reviewLog.count({ where: { userId, kind: 'quiz' } }),
      prisma.flashcard.count({ where: { userId, dueDate: { lte: new Date() } } }),
      prisma.flashcard.count({ where: { userId } }),
      prisma.reviewLog.findMany({ where: { userId }, orderBy: { reviewedAt: 'desc' }, take: 500 }),
      prisma.userProgress.findMany({ where: { userId }, select: { lastStudied: true, lessonId: true } }),
    ]);

  const lessonsTotal = await prisma.lesson.count();

  // ── Streaks (from all activity days) ──
  const days = new Set<string>();
  for (const r of reviewLogs) days.add(dayKey(r.reviewedAt));
  for (const p of progressRows) if (p.lastStudied) days.add(dayKey(p.lastStudied));

  const current = currentStreak(reviewLogs.map((r) => r.reviewedAt).concat(progressRows.filter((p) => p.lastStudied).map((p) => p.lastStudied!)));

  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const k of Array.from(days).sort()) {
    if (prev && isNextDay(prev, k)) run += 1;
    else run = 1;
    best = Math.max(best, run);
    prev = k;
  }

  // ── Minutes studied (approx: 2 min per completed lesson/quiz activity) ──
  const minutesStudied = Math.round(reviewLogs.length * 1.5 + progressRows.filter((p) => p.lastStudied).length * 1.5);

  // ── Upcoming reviews (next 7 days) ──
  const dueByDay: { date: string; count: number }[] = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const dayStart = startOfDay(addDays(now, i));
    const dayEnd = startOfDay(addDays(now, i + 1));
    const count = await prisma.flashcard.count({
      where: { userId, dueDate: { gte: dayStart, lt: dayEnd } },
    });
    dueByDay.push({ date: dayKey(dayStart), count });
  }

  // ── Weak areas (modules with lowest mastery) ──
  const modules = await prisma.module.findMany({
    where: { curriculum: { userId } },
    include: { curriculum: { select: { id: true, title: true } } },
  });
  const weakAreas = modules
    .map((m) => ({
      moduleId: m.id,
      moduleTitle: m.title,
      curriculumTitle: m.curriculum.title,
      curriculumId: m.curriculum.id,
      mastery: m.masteryScore,
    }))
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, 5);

  // ── Curricula with lesson progress ──
  const lessonsByCurriculum = new Map<string, { total: number; done: number }>();
  for (const c of curricula) {
    lessonsByCurriculum.set(c.id, { total: 0, done: 0 });
  }
  const lessonRows = await prisma.lesson.findMany({
    where: { module: { curriculumId: { in: curricula.map((c) => c.id) } } },
    select: { id: true, module: { select: { curriculumId: true } } },
  });
  for (const l of lessonRows) {
    const entry = lessonsByCurriculum.get(l.module.curriculumId);
    if (entry) entry.total += 1;
  }
  const doneByCurriculum = new Map<string, number>();
  for (const p of progressRows) doneByCurriculum.set(p.lessonId, 1);
  for (const l of lessonRows) {
    if (doneByCurriculum.has(l.id)) {
      const entry = lessonsByCurriculum.get(l.module.curriculumId);
      if (entry) entry.done += 1;
    }
  }

  const curriculaWithProgress = curricula.map((c) => {
    const lessons = lessonsByCurriculum.get(c.id) ?? { total: 0, done: 0 };
    const due = 0; // filled below via per-curriculum count
    return {
      id: c.id,
      title: c.title,
      documentTitle: c.document.title,
      mastery: c.masteryScore,
      status: c.status,
      updatedAt: c.updatedAt,
      createdAt: c.createdAt,
      moduleCount: c._count.modules,
      lessonsCompleted: lessons.done,
      lessonsTotal: lessons.total,
      dueCards: due,
    };
  });
  const dueByCurriculum = await prisma.flashcard.groupBy({
    by: ['curriculumId'],
    where: { userId, dueDate: { lte: new Date() } },
    _count: true,
  });
  const dueMap = new Map(dueByCurriculum.map((d) => [d.curriculumId, d._count]));
  for (const c of curriculaWithProgress) c.dueCards = dueMap.get(c.id) ?? 0;

  // ── Recent activity (flashcard reviews + lesson completions) ──
  const recentFlashcards = await prisma.reviewLog.findMany({
    where: { userId, kind: 'flashcard' },
    orderBy: { reviewedAt: 'desc' },
    take: 6,
    include: { flashcard: { select: { front: true, curriculumId: true } } },
  });
  const recentLessons = await prisma.userProgress.findMany({
    where: { userId, lastStudied: { not: null } },
    orderBy: { lastStudied: 'desc' },
    take: 6,
    include: { lesson: { select: { title: true, module: { select: { curriculum: { select: { title: true } } } } } } },
  });
  const recentActivity = [
    ...recentFlashcards.map((r) => ({
      id: r.id,
      kind: 'flashcard',
      title: r.flashcard?.front ?? 'Flashcard',
      at: r.reviewedAt,
    })),
    ...recentLessons.map((p) => ({
      id: p.id,
      kind: 'lesson',
      title: `${p.lesson.title} · ${p.lesson.module.curriculum.title}`,
      at: p.lastStudied!,
    })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 8);

  return {
    stats: {
      documents,
      curricula: curricula.length,
      lessonsCompleted,
      lessonsTotal,
      quizzesAnswered,
      cardsDue,
      cardsTotal,
    },
    overallMastery:
      curricula.length > 0
        ? Math.round((curricula.reduce((s, c) => s + c.masteryScore, 0) / curricula.length) * 100) / 100
        : null,
    streak: { current, best },
    minutesStudied,
    dueByDay,
    recentActivity,
    weakAreas,
    curricula: curriculaWithProgress,
  };
}

function isNextDay(prevKey: string, key: string): boolean {
  const prev = new Date(prevKey + 'T00:00:00');
  const cur = new Date(key + 'T00:00:00');
  const diff = (cur.getTime() - prev.getTime()) / 86400000;
  return diff === 1;
}
