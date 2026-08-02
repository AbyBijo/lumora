# ADR 0006 — Hand-rolled UI primitives; lightweight markdown

- **Status:** Accepted
- **Date:** 2026-08-01
- **Context:** The spec suggests shadcn/ui. Our UI primitives are small and
  stable; pulling in radix + cva + many dependencies adds surface area without
  product value. Lesson content is generated text — a full markdown stack is
  overkill.
- **Decision:** Hand-rolled, accessible components in `src/components/ui/`
  (button, card, badge, progress, input, dialog, tabs, skeleton, empty-state)
  styled via design tokens. A tiny dependency-free Markdown renderer
  (paragraphs, headings, bold/italic/code, lists, blockquotes) for lesson
  content. Icons via `lucide-react` (tree-shakeable).
- **Consequences:** Small bundle (~100 KB first load), full styling control,
  no registry coupling. If the design needs grow, shadcn can be layered in
  without changing the token system.
