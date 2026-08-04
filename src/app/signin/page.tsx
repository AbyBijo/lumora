import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { getSessionUser } from '@/lib/auth';
import { AuthForm } from '@/components/auth-form';

export const dynamic = 'force-dynamic';

export default async function SignInPage() {
  const user = await getSessionUser();
  if (user) redirect('/dashboard');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-foreground">
      <Link href="/" className="mb-8 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Sparkles className="h-4.5 w-4.5" />
        </span>
        <span className="text-lg font-semibold tracking-tight">Lumora</span>
      </Link>

      <div className="w-full max-w-sm animate-slide-up">
        <div className="surface-card p-7">
          <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Sign in to continue your learning path, or create an account to start one.
          </p>

          <div className="mt-6">
            <AuthForm />
          </div>

          <div className="mt-6 flex items-start gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
            <span>
              Passwords are hashed with bcrypt (cost 12). Sessions are revocable and
              expire after 30 days. See <code className="font-mono">docs/security.md</code>.
            </span>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          <Link href="/" className="inline-flex items-center gap-1 hover:text-foreground">
            Back to home <ArrowRight className="h-3 w-3" />
          </Link>
        </p>
      </div>
    </div>
  );
}
