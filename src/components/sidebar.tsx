'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Upload,
  Library,
  Sparkles,
  Layers,
  Settings,
  Flame,
  LogOut,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { logout } from '@/lib/api/auth';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, key: 'd' },
  { href: '/upload', label: 'Upload', icon: Upload, key: 'u' },
  { href: '/curricula', label: 'Curricula', icon: Library, key: 'c' },
  { href: '/flashcards', label: 'Flashcards', icon: Sparkles, key: 'f' },
  { href: '/mastery', label: 'Mastery', icon: Layers, key: 'm' },
  { href: '/settings', label: 'Settings', icon: Settings, key: 's' },
];

export function Sidebar({
  streak,
  open,
  onClose,
}: {
  streak?: number;
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.altKey) {
        const nav = NAV.find((n) => n.key === e.key);
        if (nav) {
          e.preventDefault();
          router.push(nav.href);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, router]);

  const signOut = async () => {
    try {
      await logout();
    } catch {
      /* already signed out */
    }
    router.push('/');
    router.refresh();
  };

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 pb-6 pt-5">
        <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">Lumora</span>
        </Link>
        <button className="text-muted-foreground lg:hidden" onClick={onClose} aria-label="Close menu">
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors focus-ring',
                active
                  ? 'bg-primary/12 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className={cn('h-4 w-4', active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
              {item.label}
              <span className="ml-auto hidden font-mono text-[10px] text-muted-foreground/60 group-hover:inline lg:inline">
                ⌥{item.key}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 px-5 pb-5">
        {typeof streak === 'number' && streak > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5">
            <Flame className="h-4 w-4 text-accent" />
            <div className="text-xs">
              <span className="font-semibold tabular-nums">{streak}-day</span>
              <span className="text-muted-foreground"> study streak</span>
            </div>
          </div>
        )}
        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={signOut}>
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-border bg-card/40 backdrop-blur lg:block">
        {content}
      </aside>
      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <aside className="absolute inset-y-0 left-0 w-64 animate-fade-in border-r border-border bg-background">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
