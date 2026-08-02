'use client';

import * as React from 'react';
import { Check, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { patchSettings } from '@/lib/api/settings';

const PROVIDERS: { id: 'local' | 'openai' | 'anthropic'; label: string; desc: string }[] = [
  { id: 'local', label: 'Local engine', desc: 'Deterministic · free · no key' },
  { id: 'openai', label: 'OpenAI', desc: 'GPT-4o — needs OPENAI_API_KEY' },
  { id: 'anthropic', label: 'Anthropic', desc: 'Claude — needs ANTHROPIC_API_KEY' },
];

export function SettingsForm({
  initial,
  remoteConfigured,
}: {
  initial: { theme: string; provider: string; streakGoalDays: number };
  remoteConfigured: boolean;
}) {
  const { theme, setTheme } = useTheme();
  const [provider, setProvider] = React.useState<'local' | 'openai' | 'anthropic'>(initial.provider as 'local' | 'openai' | 'anthropic');
  const [saved, setSaved] = React.useState(false);

  const save = async (p: 'local' | 'openai' | 'anthropic') => {
    setProvider(p);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
    await patchSettings({ provider: p }).catch(() => undefined);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {theme === 'dark' ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-accent" />}
            Appearance
          </CardTitle>
          <CardDescription>Dark mode first — calm, premium, uncluttered.</CardDescription>
        </CardHeader>
        <div className="flex gap-2">
          {(['dark', 'light'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-all focus-ring',
                theme === t ? 'border-primary/50 bg-primary/10 text-primary' : 'border-border hover:bg-muted'
              )}
            >
              {t === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              {t === 'dark' ? 'Dark' : 'Light'}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">⚙️ Curriculum engine</CardTitle>
          <CardDescription>
            The provider used to generate curricula. Remote providers fall back to the local engine automatically.
          </CardDescription>
        </CardHeader>
        <div className="space-y-2">
          {PROVIDERS.map((p) => {
            const unavailable = p.id !== 'local' && !remoteConfigured;
            return (
              <button
                key={p.id}
                disabled={unavailable}
                onClick={() => save(p.id)}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-all focus-ring',
                  provider === p.id
                    ? 'border-primary/50 bg-primary/10'
                    : 'border-border hover:bg-muted',
                  unavailable && 'opacity-45 cursor-not-allowed'
                )}
              >
                <div>
                  <p className="text-sm font-medium">{p.label}</p>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </div>
                {provider === p.id && <Check className="h-4 w-4 text-primary" />}
              </button>
            );
          })}
        </div>
        {saved && (
          <p className="mt-3 text-xs text-success animate-fade-in">Preference saved.</p>
        )}
      </Card>

      <div className="flex justify-end">
        <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
          Reload to apply
        </Button>
      </div>
    </div>
  );
}
