'use client';

import { cn } from '@/lib/utils';
import { masteryLabel } from '@/lib/mastery';

/** SVG mastery ring — the core retention visual. */
export function MasteryRing({
  value,
  size = 120,
  stroke = 10,
  label,
  sublabel,
  className,
}: {
  value: number; // 0..1
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
  className?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value));
  const offset = c * (1 - pct);
  const color = pct >= 0.85 ? 'rgb(var(--success))' : pct >= 0.6 ? 'rgb(var(--primary))' : pct >= 0.3 ? 'rgb(var(--accent))' : 'rgb(var(--muted-foreground))';

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgb(var(--muted))"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-2xl font-semibold tabular-nums tracking-tight">
          {Math.round(pct * 100)}%
        </span>
        {label && <span className="mt-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>}
        {sublabel && <span className="text-[10px] text-muted-foreground/70">{sublabel}</span>}
      </div>
    </div>
  );
}

export function masteryLabelOf(value: number): string {
  return masteryLabel(value);
}
