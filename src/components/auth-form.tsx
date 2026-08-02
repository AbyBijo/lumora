'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { register, login } from '@/lib/api/auth';

type Mode = 'login' | 'register';

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = React.useState<Mode>('login');
  const [email, setEmail] = React.useState('');
  const [name, setName] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (mode === 'login') {
        await login({ email, password });
      } else {
        await register({ email, password, name: name || undefined });
      }
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      {mode === 'register' && (
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Name (optional)</span>
          <Input
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ada Lovelace"
          />
        </label>
      )}
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Email</span>
        <Input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Password</span>
        <Input
          type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          required
          minLength={mode === 'register' ? 8 : undefined}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === 'register' ? '8+ chars, letters & numbers' : '••••••••'}
        />
      </label>

      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger" role="alert">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" size="lg" loading={busy}>
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> {mode === 'login' ? 'Signing in…' : 'Creating account…'}
          </>
        ) : mode === 'login' ? (
          'Sign in'
        ) : (
          'Create account'
        )}
      </Button>

      <div className="flex items-center gap-3 pt-1">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[11px] text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        onClick={() => {
          setMode((m) => (m === 'login' ? 'register' : 'login'));
          setError(null);
        }}
        className={cn(
          'w-full rounded-lg border border-border bg-card px-4 py-2.5 text-xs font-medium text-muted-foreground',
          'transition-colors hover:bg-muted hover:text-foreground focus-ring'
        )}
      >
        {mode === 'login' ? "New here? Create an account" : 'Already have an account? Sign in'}
      </button>
    </form>
  );
}
