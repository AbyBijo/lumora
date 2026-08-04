import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Library, ArrowRight, Upload } from 'lucide-react';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { EmptyState } from '@/components/ui/empty-state';
import { formatRelative } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function CurriculaPage() {
  const user = await getSessionUser();
  if (!user) redirect('/signin');

  const curricula = await prisma.curriculum.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      document: { select: { title: true, fileType: true } },
      _count: { select: { modules: true } },
    },
  });

  if (curricula.length === 0) {
    return (
      <div className="animate-fade-in">
        <h1 className="mb-7 text-2xl font-semibold tracking-tight">Curricula</h1>
        <EmptyState
          icon={<Library className="h-5 w-5" />}
          title="No curricula yet"
          description="Every document you upload becomes a structured curriculum. Upload your first document to get started."
          action={
            <Link href="/upload">
              <Button>
                <Upload className="h-4 w-4" /> Upload a document
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-7 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Curricula</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {curricula.length} learning path{curricula.length === 1 ? '' : 's'} built from your documents
          </p>
        </div>
        <Link href="/upload">
          <Button variant="secondary">
            <Upload className="h-4 w-4" /> New
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {curricula.map((c) => (
          <Link key={c.id} href={`/curricula/${c.id}`} className="group">
            <Card className="h-full transition-all hover:border-primary/40 hover:shadow-glow">
              <CardHeader>
                <div>
                  <CardTitle className="group-hover:text-primary">{c.title}</CardTitle>
                  <CardDescription>
                    {c.document.title} · {c.document.fileType.toUpperCase()}
                  </CardDescription>
                </div>
                <Badge tone={c.status === 'approved' ? 'success' : 'warning'}>
                  {c.status === 'approved' ? 'Learning' : 'Draft'}
                </Badge>
              </CardHeader>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{c._count.modules} modules</span>
                <span className="flex items-center gap-1">
                  <span className="font-mono tabular-nums">{Math.round(c.masteryScore * 100)}%</span>
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
              <Progress value={c.masteryScore} className="mt-3" tone={c.masteryScore >= 0.85 ? 'success' : undefined} />
              <p className="mt-3 text-[11px] text-muted-foreground">
                Last studied {formatRelative(c.updatedAt)}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
