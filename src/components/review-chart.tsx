'use client';

import { dayKey } from '@/lib/utils';
import { cn } from '@/lib/utils';

/** 7-day upcoming-review bar chart (pure SVG, dependency-free). */
export function ReviewChart({
  data,
  className,
}: {
  data: { date: string; count: number }[];
  className?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const today = dayKey(new Date());

  return (
    <div className={cn('flex items-end gap-2', className)}>
      {data.map((d) => {
        const isToday = d.date === today;
        const h = Math.max(6, Math.round((d.count / max) * 72));
        const weekday = new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', {
          weekday: 'short',
        });
        return (
          <div key={d.date} className="group flex flex-1 flex-col items-center gap-1.5">
            <span className="font-mono text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
              {d.count}
            </span>
            <div
              className={cn(
                'w-full max-w-9 rounded-md transition-all',
                isToday ? 'bg-primary' : 'bg-primary/25 group-hover:bg-primary/45'
              )}
              style={{ height: h }}
              title={`${d.count} review${d.count === 1 ? '' : 's'} on ${d.date}`}
            />
            <span className={cn('text-[10px]', isToday ? 'font-medium text-primary' : 'text-muted-foreground')}>
              {weekday}
            </span>
          </div>
        );
      })}
    </div>
  );
}
