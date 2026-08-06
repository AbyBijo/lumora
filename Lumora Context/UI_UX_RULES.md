# UI/UX RULES — LUMORA

> **Document Version:** 1.0.0  
> **Classification:** Interaction Design & User Experience Specification  
> **Guiding Principle:** "The software should disappear so understanding can emerge."

---

## 1. The Disappearing Software Paradigm

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       THE COGNITIVE LOAD MANDATE                            │
│                                                                              │
│   Every visual element, button, border, and animation that does not          │
│   directly assist human comprehension is cognitive friction.                 │
│   UI chrome must recede into the canvas; content and insights remain king.   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Global Keyboard-First Taxonomy

Lumora must be 100% operable without touching a mouse or trackpad:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CORE KEYBOARD SHORTCUTS                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  Shortcut           │  Action Description                                   │
├─────────────────────┼───────────────────────────────────────────────────────┤
│  Cmd + K / Ctrl + K │  Open Universal Command Palette & Omni-Search         │
│  Cmd + \            │  Toggle Left Sidebar (Workspace & Projects)           │
│  Cmd + Shift + \    │  Toggle Right Panel (Inspector & Study Actions)       │
│  Cmd + Option + Z   │  Toggle Zen / Focus Mode (Collapse all chrome)        │
│  Cmd + Enter        │  Execute Query / Submit Study Action                  │
│  Cmd + Shift + F    │  Generate Flashcards from Current Document / Selection│
│  Cmd + Shift + Q    │  Generate Active Recall Quiz                          │
│  Cmd + Shift + S    │  Generate Structural Executive Summary                │
│  Esc                │  Dismiss popovers, cancel prompt, or exit Zen Mode    │
│  Space / Enter      │  Flip Flashcard during Active Review Session          │
│  1 / 2 / 3 / 4      │  Score Flashcard Ease (Again, Hard, Good, Easy)       │
│  J / K              │  Navigate down / up across document chunks & citations│
└─────────────────────┴───────────────────────────────────────────────────────┘
```

---

## 3. The Tri-Pane Ergonomic Layout

```
┌───────────────┬─────────────────────────────────────────────┬───────────────┐
│ LEFT SIDEBAR  │               CENTER WORKSPACE              │  RIGHT PANEL  │
│               │                                             │               │
│ • Projects    │ ┌─────────────────────────────────────────┐ │ • Properties  │
│ • Recents     │ │           Document Viewer               │ │ • Citations   │
│ • Collections │ │  (Smooth scrolling, highlight layer)    │ │ • Study Action│
│ • Tags        │ └─────────────────────────────────────────┘ │   Runners     │
│               │ ┌─────────────────────────────────────────┐ │ • Flashcards  │
│               │ │         AI Reasoning Studio             │ │ • Quizzes     │
│               │ │  (Prompt bar, streaming grounded turns) │ │ • Notes       │
│               │ └─────────────────────────────────────────┘ │               │
└───────────────┴─────────────────────────────────────────────┴───────────────┘
```

### Layout Constraints:
1. **Left Sidebar:** Min width `220px`, default `260px`, max `340px`. Persists collapsed state in localStorage.
2. **Right Panel:** Min width `280px`, default `320px`, max `420px`. Automatically opens when a citation or study runner is activated.
3. **Center Workspace:** Automatically recalculates width with zero layout thrashing.

---

## 4. Study Action User Flows

```
                  ┌─────────────────────────────────────────┐
                  │          STUDY ACTION RUNNERS           │
                  └─────────────────────────────────────────┘
```

### 1. Interactive Flashcard Runner Flow
1. User clicks **"Study Flashcards"** or presses `Cmd+Shift+F`.
2. Right panel transforms into the **Active Recall Deck**.
3. Card displays the **Front** (atomic question).
4. User attempts retrieval mentally or types answer $\rightarrow$ Presses `Space` to flip.
5. Card flips smoothly (140ms ease-out) revealing **Back** (verified answer) + **Citation Jump Badge**.
6. User rates difficulty (`1`: Again, `2`: Hard, `3`: Good, `4`: Easy), immediately updating the SM-2 spaced repetition queue.

### 2. Interactive Quiz Runner Flow
1. User triggers **"Take Quiz"** on selected chapters or entire document.
2. Quiz runner displays questions with instant feedback:
   - Selecting an option immediately reveals explanation for *why* the choice is correct or incorrect.
   - Grounded source references highlight the original text in the document viewer simultaneously.
3. Final score card delivers mastery diagnosis with recommendations for weak areas.

---

## 5. Autosave & Zero-Data-Loss Mechanics

- **Debounced Autosave:** Every note edit, chat prompt, and flashcard rating is committed to local IndexedDB within $500\text{ms}$ of idle time.
- **Unobtrusive Indicator:** A minimal, non-blinking status dot in the bottom-right corner confirms state (`Saved` / `Syncing`).
- **Never Block User Flow:** Autosaving executes asynchronously in background threads; the user never experiences frozen text inputs or delayed keystrokes.

---
*End of UI/UX Rules.*
