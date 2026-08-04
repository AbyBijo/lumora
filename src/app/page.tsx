import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  FileText,
  Brain,
  Repeat,
  Target,
  BookMarked,
  Search,
  Check,
  X,
  Upload,
  ListTree,
  Timer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const DIFFERENTIATORS: { feature: string; lumora: string; generic: string }[] = [
  { feature: 'Document → Curriculum', lumora: 'Structured learning path', generic: 'Unstructured chat' },
  { feature: 'Active recall', lumora: 'Built-in quizzes & flashcards', generic: 'You must prompt it' },
  { feature: 'Spaced repetition', lumora: 'Automatic SM-2 scheduling', generic: 'None' },
  { feature: 'Mastery tracking', lumora: 'Measurable, per-module progress', generic: 'None' },
  { feature: 'Source traceability', lumora: 'Every claim linked to the source', generic: 'Often hallucinated' },
  { feature: 'Retention focus', lumora: 'Core primitive, not an afterthought', generic: 'Afterthought' },
];

const STEPS = [
  {
    icon: Upload,
    title: 'Upload anything',
    body: 'PDFs, Word docs, text, or a web URL. Lumora parses the document into traceable source chunks.',
  },
  {
    icon: ListTree,
    title: 'Get a curriculum',
    body: 'An expert-structured path: modules → lessons → key concepts → learning objectives, all cited to the source.',
  },
  {
    icon: Timer,
    title: 'Study & recall',
    body: 'Lesson by lesson, quiz by quiz, with instant feedback and “view in source” on every answer.',
  },
  {
    icon: Target,
    title: 'Reach mastery',
    body: 'SM-2 spaced repetition schedules your reviews; the dashboard shows mastery, weak areas, and streaks.',
  },
];

export default async function LandingPage() {
  const user = await getSessionUser();
  const ctaHref = user ? '/dashboard' : '/signin';
  const ctaLabel = user ? 'Open your dashboard' : 'Start learning free';

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">Lumora</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href={ctaHref} className="link-quiet text-sm font-medium">
            Sign in
          </Link>
          <Link href={ctaHref}>
            <Button size="sm">{ctaLabel}</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pb-16 pt-14 text-center sm:pt-20">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          <Brain className="h-3.5 w-3.5 text-primary" />
          The learning operating system
        </div>
        <h1 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
          Turn documents into{' '}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            durable understanding
          </span>
          .
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
          Lumora transforms any document into a guided curriculum with active recall,
          spaced repetition, and measurable mastery — where every claim is traceable
          back to the source.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link href={ctaHref}>
            <Button size="lg">
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button variant="secondary" size="lg">
              See how it works
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          No API key required · runs on the local engine by default · your data stays yours
        </p>
      </section>

      {/* Value strip */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-10 sm:grid-cols-4">
          {[
            { icon: FileText, label: 'Document → Curriculum', sub: 'not chat' },
            { icon: BookMarked, label: 'Active recall by default', sub: 'quizzes + flashcards' },
            { icon: Repeat, label: 'Spaced repetition', sub: 'SM-2 scheduling' },
            { icon: Target, label: 'Mastery tracking', sub: 'measurable progress' },
          ].map((v) => (
            <div key={v.label} className="flex items-start gap-3">
              <v.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <div className="text-sm font-medium">{v.label}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{v.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          From raw information to mastery
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-muted-foreground">
          The pipeline: <span className="text-foreground">Information → Understanding → Practice → Memory → Application → Mastery</span>
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="surface-card relative p-5">
              <span className="absolute right-4 top-4 font-mono text-xs text-muted-foreground/50">
                0{i + 1}
              </span>
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Differentiators */}
      <section className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-center text-2xl font-semibold tracking-tight">
            Why not just ChatGPT?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-muted-foreground">
            A chat window answers. Lumora builds a system that makes you remember.
          </p>
          <div className="mt-8 overflow-hidden rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Feature</th>
                  <th className="px-4 py-3 font-medium text-success">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" /> Lumora
                    </span>
                  </th>
                  <th className="px-4 py-3 font-medium">Generic chat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {DIFFERENTIATORS.map((d) => (
                  <tr key={d.feature}>
                    <td className="px-4 py-3 font-medium">{d.feature}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-success">
                        <Check className="h-3.5 w-3.5" /> {d.lumora}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <X className="h-3.5 w-3.5 text-danger" /> {d.generic}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Bring your first document
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Upload a PDF, a set of notes, or a web article. Lumora builds your
          curriculum in seconds.
        </p>
        <div className="mt-8">
          <Link href={ctaHref}>
            <Button size="lg">
              <Search className="h-4 w-4" />
              {ctaLabel}
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        Lumora — document → curriculum, active recall, spaced repetition, measurable mastery.
      </footer>
    </div>
  );
}
