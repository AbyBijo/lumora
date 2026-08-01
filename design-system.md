# Lumora — Design System

## Direction

Calm, premium, quiet. Influenced by Notion, Linear, Arc Browser, Apple,
Anthropic, Perplexity. **Dark mode first.** Whitespace is intentional;
typography carries hierarchy; colors are restrained; motion is subtle; no noisy
gradients, no neon, no decorative clutter.

## Tokens

Colors are CSS variables defined in `src/app/globals.css` and mapped into
Tailwind in `tailwind.config.ts`:

| Token | Usage |
| --- | --- |
| `--background` / `--foreground` | page canvas + text |
| `--card` / `--card-2` | raised surfaces (cards, nested surfaces) |
| `--border` | hairlines, dividers |
| `--muted` / `--muted-foreground` | secondary surfaces + secondary text |
| `--primary` | actions, active nav, focus, mastery progress |
| `--accent` | streaks, warnings (amber) |
| `--success` / `--danger` / `--info` | semantic states |
| `--ring` | focus rings |
| `--shadow-color` | soft ambient shadows |

Switching themes = toggling a class on `<html>` (`dark` default, `light`). **No
component ever hardcodes a theme value.**

## Typography

- **Inter** (variable) for UI; **JetBrains Mono** for numbers, citations,
  hotkeys, and code.
- Hierarchy: page titles `text-2xl font-semibold` → card titles
  `text-sm font-semibold` → body `text-sm` → captions `text-xs
  text-muted-foreground`.
- Numeric data always uses `tabular-nums` + `font-mono` (mastery %, streak,
  counts).

## Components

- **Buttons** — `primary` (indigo), `secondary` (card), `ghost`, `outline`,
  `danger`; sizes sm/md/lg/icon; loading spinner state; `active:scale-[0.98]`.
- **Cards** — `surface-card` utility: 1px border, inset highlight, soft shadow.
- **Badges** — tone variants (default/primary/success/warning/danger/muted).
- **Progress** — 6px rounded track, tone by mastery (warning → primary → success).
- **Dialogs/Tabs/Inputs/Skeleton/EmptyState** — hand-rolled, accessible,
  dependency-free (ADR 0006).

## Motion

- `fade-in` (subtle) and `slide-up` (0.45s, spring-ish cubic-bezier) for page
  transitions; `scale-in` for dialogs. Shimmer for in-progress pipeline steps.
- No marquees, no parallax, no bounce.

## Layout

- Sidebar-first workspace (240px), content max-width `max-w-6xl`.
- Mobile: sticky top bar with drawer navigation; grids collapse 4→2→1.
- Study and flashcard surfaces are centered and narrow (`max-w-2xl/3xl`) —
  focused, uncluttered reading.

## States

- **Empty states teach** — every empty screen explains what to do next and why.
- **Loading states teach** — the generation pipeline shows named steps plus
  rotating learning-science tips.
- **Feedback is instant and sourced** — quiz answers show correct/incorrect,
  explanation, and the exact source passage.

## Accessibility

- Full keyboard operation (shortcuts documented in-app and in README).
- Visible focus rings (`focus-ring` utility).
- ARIA roles on tabs, dialogs, progress bars.
- Color is never the only signal (labels + icons accompany tones).
