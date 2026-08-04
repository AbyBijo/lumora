import { cn } from '@/lib/utils';

export function Progress({
  value,
  className,
  barClassName,
  tone,
}: {
  value: number; // 0..1
  className?: string;
  barClassName?: string;
  tone?: 'primary' | 'success' | 'warning';
}) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  const barTone =
    tone === 'success'
      ? 'bg-success'
      : tone === 'warning'
        ? 'bg-accent'
        : 'bg-primary';
  return (
    <div
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-muted', className)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn('h-full rounded-full transition-all duration-500', barTone, barClassName)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
