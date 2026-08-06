# DESIGN CONSTITUTION — LUMORA

> **Document Version:** 1.0.0  
> **Classification:** Authoritative Visual & Interaction Design Standard  
> **Inspiration Spectrum:** Notion, Claude, Linear, Arc Browser, Apple Desktop

---

## 1. The Aesthetic Philosophy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          THE SIX DESIGN PILLARS                             │
├─────────────────────────────────────────────────────────────────────────────┤
│   CALMNESS      │  Zero visual noise. Soft contrast. A sanctuary for deep   │
│                 │  intellectual focus and sustained study.                  │
├─────────────────┼───────────────────────────────────────────────────────────┤
│   TRUST         │  Precise alignment, rock-solid stability, verifiable      │
│                 │  grounding. The UI feels durable and reliable.            │
├─────────────────┼───────────────────────────────────────────────────────────┤
│   INTELLIGENCE  │  Context-aware layout adaptations, purposeful typography, │
│                 │  and immediate visual clarity of complex data.            │
├─────────────────┼───────────────────────────────────────────────────────────┤
│   FOCUS         │  Content takes center stage. UI chrome recedes into the   │
│                 │  background until actively summoned.                     │
├─────────────────┼───────────────────────────────────────────────────────────┤
│   CLARITY       │  Unambiguous hierarchy. Explicit interactive affordances. │
│                 │  Information density balanced by generous whitespace.     │
├─────────────────┼───────────────────────────────────────────────────────────┤
│   ELEGANCE      │  Meticulously calibrated kerning, refined border radiuses,│
│                 │  and organic physics-based micro-interactions.            │
└─────────────────┘
```

---

## 2. Anti-Patterns & Visual Bans

To preserve Lumora's bespoke identity, the following patterns are **permanently banned**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            VISUAL PROHIBITIONS                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  ❌ NEVER use raw emoji icons as primary navigation, buttons, or indicators.│
│  ❌ NEVER use neon AI gradients (purple-to-pink gradient overlays).         │
│  ❌ NEVER use intrusive glowing borders or pulsing "AI is thinking" badges. │
│  ❌ NEVER look like an unmodified Vite/Next.js starter or shadcn demo page. │
│  ❌ NEVER introduce decorative animations that delay user interaction.      │
│  ❌ NEVER create harsh, pure black (#000000) or blinding pure white (#FFFFFF)│
│     surfaces in primary reading zones without warm undertones.              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Theme System: Warm Light & Premium Dark

Lumora uses a dual-theme architecture built with CSS Custom Properties. The transition between themes must be instantaneous, smooth, and free of flashing.

```
                  ┌─────────────────────────────────────────┐
                  │            THE COLOR PALETTE            │
                  └─────────────────────────────────────────┘
```

### Warm Light Theme (Default)
*Engineered for day-long reading comfort, resembling premium editorial paper and warm sunlight.*

| Token Name | Hex Value | Semantic Usage |
| :--- | :--- | :--- |
| `--bg-canvas` | `#FBF9F5` | Main application background (Warm alabaster) |
| `--bg-surface` | `#F4F1EA` | Sidebar, panels, cards, toolbars (Warm cream) |
| `--bg-elevated` | `#FFFFFF` | Modals, dropdowns, floating menus |
| `--border-subtle` | `#E8E4DA` | Subtle separators, pane splitters |
| `--border-strong` | `#D5CFBE` | Active input borders, focused outlines |
| `--text-primary` | `#1A1816` | Main body text, headings (Deep warm charcoal) |
| `--text-secondary` | `#635F59` | Subheaders, captions, metadata |
| `--text-muted` | `#999388` | Placeholders, disabled states, shortcuts |
| `--accent-primary` | `#2D5B4F` | Forest Pine accent (Intellectual, calm) |
| `--accent-hover` | `#22453C` | Darkened Pine hover state |
| `--accent-subtle` | `#EBF2EE` | Badge backgrounds, active selection highlight |
| `--citation-highlight` | `#FDEAC4` | Document grounding highlight (Warm amber) |

### Premium Dark Theme (Secondary)
*Engineered for night study, deep focus, and zero eye fatigue. Deep basalt and obsidian tones with warm amber undertones.*

| Token Name | Hex Value | Semantic Usage |
| :--- | :--- | :--- |
| `--bg-canvas` | `#121214` | Main workspace background (Deep obsidian) |
| `--bg-surface` | `#18181B` | Sidebar, panels, cards (Basalt) |
| `--bg-elevated` | `#222226` | Modals, floating popovers |
| `--border-subtle` | `#27272A` | Clean, low-contrast pane dividers |
| `--border-strong` | `#3F3F46` | Focus rings, active tab borders |
| `--text-primary` | `#F4F4F5` | Crisp, readable reading text |
| `--text-secondary` | `#A1A1AA` | Secondary labels, timestamps |
| `--text-muted` | `#71717A` | Shortcuts, inactive icons |
| `--accent-primary` | `#4E9A86` | Soft Sage Emerald |
| `--accent-hover` | `#61B59F` | Brightened Sage |
| `--accent-subtle` | `#1A2E28` | Dark mode badge fill |
| `--citation-highlight` | `#423419` | Subtle amber citation backplate |

---

## 4. Typography Scale & Hierarchy

Lumora uses a hybrid typographic system: a high-legibility geometric sans-serif for UI chrome, paired with an editorial serif for deep document reading and synthesis.

```
UI & Navigation Font Stack:     Geist Sans, Inter, -apple-system, sans-serif
Reading & Editorial Font Stack: Newsreader, Literata, Charter, Georgia, serif
Code & Monospace Font Stack:    JetBrains Mono, Geist Mono, monospace
```

### Typographic Hierarchy

| Level | Size | Line Height | Weight | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- |
| **Display Heading (H1)** | `32px (2rem)` | `1.2` | 600 (SemiBold) | `-0.025em` |
| **Section Title (H2)** | `24px (1.5rem)` | `1.3` | 600 (SemiBold) | `-0.02em` |
| **Card Header (H3)** | `18px (1.125rem)`| `1.4` | 500 (Medium) | `-0.015em` |
| **Body (Reading)** | `16px (1rem)` | `1.65` | 400 (Regular) | `0em` |
| **Body (UI / Compact)** | `14px (0.875rem)`| `1.5` | 400 (Regular) | `-0.005em` |
| **Metadata / Caption** | `12px (0.75rem)` | `1.4` | 500 (Medium) | `+0.01em` |
| **Monospace / Code** | `13px (0.8125rem)`| `1.55` | 400 (Regular) | `0em` |

---

## 5. Bespoke SVG Iconography System

Lumora avoids generic icon bloat by enforcing a unified, custom SVG icon specification:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ICON SPECIFICATION                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  Grid Size:       20x20 px (Inline UI) or 24x24 px (Primary Navigation)     │
│  Stroke Width:    1.5px (Default) or 1.75px (Active/Focused)                │
│  Stroke Linecap:  round                                                     │
│  Stroke Linejoin: round                                                     │
│  Fill:            none (Monoline vector system)                             │
│  Color:           currentColor (Inherits text tokens seamlessly)            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Core Custom Icon Manifest:
- `IconDocument` (Clean sheet with folded corner and subtle text lines)
- `IconFlashcard` (Stacked geometric cards with active recall symbol)
- `IconQuiz` (Check-circle with analytical balance node)
- `IconBrainSummary` (Cerebral node with distilled convergence rays)
- `IconCitation` (Grounded bookmark with precision coordinate dot)
- `IconConceptMap` (Triangular connected knowledge nodes)
- `IconThemeToggle` (Sun/Moon celestial transformation geometry)

---

## 6. Layout Geometry: The Tri-Pane Ergonomics

```
┌──────────────┬──────────────────────────────────────────┬──────────────────┐
│ LEFT SIDEBAR │            MAIN STUDY AREA               │   RIGHT PANEL    │
│ (240-300px)  │            (Flexible Width)              │   (300-380px)    │
│              │                                          │                  │
│ • Projects   │  ┌────────────────────────────────────┐  │ • Properties     │
│ • Recents    │  │        Document Canvas             │  │ • Citations      │
│ • Sources    │  │       (High-Res Rendering)         │  │ • Study Action   │
│ • Library    │  └────────────────────────────────────┘  │   Inspector      │
│              │  ┌────────────────────────────────────┐  │ • Flashcard Deck │
│              │  │        Interactive AI Deck         │  │ • Quiz Runner    │
│              │  │    (Grounded Reasoning & Chat)     │  │                  │
│              │  └────────────────────────────────────┘  │                  │
└──────────────┴──────────────────────────────────────────┴──────────────────┘
```

- **Collapsible:** Both Left and Right panels can be collapsed instantly with `Cmd+\` and `Cmd+Shift+\`.
- **Resizable Splitters:** High-precision drag splitters with persistent local storage coordinates.
- **Distraction-Free Zen Mode:** `Cmd+Option+Z` collapses both sidebars, expanding the document reading and study canvas to maximum viewport.

---

## 7. Motion & Micro-Interactions

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             MOTION PRINCIPLES                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. Duration Budget:  Transitions must complete in 120ms - 180ms.           │
│  2. Easing Curve:     cubic-bezier(0.16, 1, 0.3, 1) (Ease-out exponential). │
│  3. Purposeful Only:  Motion must signify state changes (collapsing panels, │
│                       switching tabs, citation jumping). No gratuitous bounce│
│  4. Accessibility:    Full honor of `prefers-reduced-motion` media queries. │
└─────────────────────────────────────────────────────────────────────────────┘
```

---
*End of Design Constitution.*
