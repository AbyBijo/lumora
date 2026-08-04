import * as React from 'react';
import { cn } from '@/lib/utils';

type Tone = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'muted';

const tones: Record<Tone, string> = {
  default: 'bg-muted text-foreground border-border',
  primary: 'bg-primary/12 text-primary border-primary/25',
  success: 'bg-success/10 text-success border-success/25',
  warning: 'bg-accent/10 text-accent border-accent/30',
  danger: 'bg-danger/10 text-danger border-danger/25',
  muted: 'bg-transparent text-muted-foreground border-border',
};

export function Badge({
  className,
  tone = 'default',
  children,
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-4',
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
