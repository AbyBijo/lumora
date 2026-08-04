'use client';

import * as React from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from '@/components/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';

export function AppShell({ streak, children }: { streak?: number; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/80 px-4 py-2.5 backdrop-blur lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold tracking-tight">Lumora</span>
        <ThemeToggle />
      </header>
      <Sidebar streak={streak} open={open} onClose={() => setOpen(false)} />
      <div className="min-h-screen lg:pl-60">
        <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6 lg:px-10 lg:pt-10">
          {children}
        </div>
      </div>
    </>
  );
}
