# Lumora — Docs

This folder mirrors the Lumora Notion hub (see the
[master context](../.context/MASTER_CONTEXT.md)):

| Doc | What it covers |
| --- | --- |
| [vision.md](vision.md) | North star, philosophy, principles |
| [prd.md](prd.md) | Product requirements, MVP scope, flows, metrics |
| [srs.md](srs.md) | Software requirements, detailed functional spec |
| [architecture.md](architecture.md) | System design, layers, data flows, module map |
| [roadmap.md](roadmap.md) | Phase 1 ✅ → Phase 4, backlog, non-goals |
| [research.md](research.md) | Learning-science grounding + competitive landscape |
| [design-system.md](design-system.md) | Tokens, typography, components, motion, a11y |
| [database.md](database.md) | Entity map, traceability, SRS state, mastery math |
| [termux.md](termux.md) | Running Lumora on Android/Termux (proot-distro guide) |
| [prompts/](prompts/) | Prompt library notes |
| [adr/](adr/) | Decision log (0001–0007) |

## Decision log

- [0001 — Local engine first, LLMs as an upgrade](adr/0001-local-engine-first.md)
- [0002 — SQLite for dev, PostgreSQL for production](adr/0002-db.md)
- [0003 — Source chunks as the citation unit](adr/0003-source-traceability.md)
- [0004 — SM-2 with modern modifications](adr/0004-sm2.md)
- [0005 — Local demo session; NextAuth/Clerk seam](adr/0005-auth.md)
- [0006 — Hand-rolled UI primitives; lightweight markdown](adr/0006-rendering.md)
- [0007 — Model-agnostic provider gateway](adr/0007-providers.md)

## Source of truth

The master context file (`.context/MASTER_CONTEXT.md`) is the permanent brain
of the project. When decisions conflict, resolve in this order: master context
→ ADRs → architecture docs → product docs → feature docs → implementation code.
