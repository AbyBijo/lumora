import * as React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-9.5 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground',
        'placeholder:text-muted-foreground focus-ring transition-colors',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground',
        'placeholder:text-muted-foreground focus-ring transition-colors resize-y',
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';
