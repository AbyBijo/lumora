'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export function Tabs({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: { id: string; label: string; count?: number }[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn('inline-flex items-center gap-1 rounded-lg border border-border bg-card p-1', className)}
      role="tablist"
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            'rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-ring',
            value === t.id
              ? 'bg-primary/15 text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {t.label}
          {typeof t.count === 'number' && t.count > 0 && (
            <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] tabular-nums">
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
