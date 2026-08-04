import { redirect } from 'next/navigation';
import { Cpu, Database, KeyRound, User } from 'lucide-react';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { isAnyRemoteConfigured } from '@/engine/llm';
import { SettingsForm } from '@/components/settings-form';
import { ChangePasswordForm } from '@/components/change-password-form';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/signin');

  const settings = await prisma.userSettings.findUnique({ where: { userId: user.id } });
  const remoteConfigured = isAnyRemoteConfigured();

  return (
    <div className="max-w-2xl animate-fade-in">
      <div className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tune Lumora to how you learn. Everything here is yours — stored locally, never shared.
        </p>
      </div>

      {/* Account */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> Account
            </CardTitle>
            <CardDescription>
              Signed in as <span className="font-medium text-foreground">{user.email}</span>
              {user.name ? ` · ${user.name}` : ''}
            </CardDescription>
          </CardHeader>
          <div className="space-y-4">
            <div>
              <h3 className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <KeyRound className="h-3.5 w-3.5" /> Change password
              </h3>
              <ChangePasswordForm />
            </div>
          </div>
        </Card>
      </div>

      <SettingsForm
        initial={{ theme: settings?.theme ?? 'dark', provider: settings?.provider ?? 'local', streakGoalDays: settings?.streakGoalDays ?? 7 }}
        remoteConfigured={remoteConfigured}
      />

      <div className="mt-6 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" /> Generation engine
            </CardTitle>
            <CardDescription>
              {remoteConfigured
                ? 'A remote provider is configured — curricula will use it with automatic fallback to the local engine.'
                : 'No API keys detected. The built-in local engine is generating your curricula — deterministic, source-grounded, and free.'}
            </CardDescription>
          </CardHeader>
          <div className="flex flex-wrap gap-2 text-[11px]">
            {['OPENAI_API_KEY', 'ANTHROPIC_API_KEY'].map((k) => (
              <span key={k} className="flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2.5 py-1.5 font-mono text-muted-foreground">
                <span className={process.env[k] ? 'h-1.5 w-1.5 rounded-full bg-success' : 'h-1.5 w-1.5 rounded-full bg-muted-foreground/40'} />
                {k} {process.env[k] ? 'set' : 'not set'}
              </span>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" /> Data & privacy
            </CardTitle>
          </CardHeader>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> Documents are stored in your database, scoped to your account.
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> No fabricated citations — every generated claim links to the source.
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> Passwords are bcrypt-hashed (cost 12); sessions are revocable.
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
