# Lumora Master Context File

Version: 1.0  
Status: Foundation  
Source of truth: This file, plus the linked docs under `.context/`, defines the operating context for Lumora.

## 1) Purpose

Lumora is an **AI-powered learning workspace**. It is not a generic chatbot, and it is not a simple PDF chat tool. Its purpose is to help users convert information into understanding, retention, practice, and mastery.

This file exists so an agentic AI system can generate and extend Lumora without repeatedly asking for basic product decisions.

## 2) Repository identity

Lumora should be treated as a long-lived product repository with these characteristics:

- AI-first
- Model-agnostic
- Source-grounded
- Modular
- Documentation-driven
- Premium, calm UI
- Strong separation between product, architecture, and implementation details

The repository should be organized around explicit knowledge files rather than one large prompt blob.

## 3) Existing Notion structure to mirror

The current Lumora Notion hub already contains a top-level project page and the following major child pages:

- Vision
- PRD
- SRS
- Research
- Architecture
- Roadmap
- Tasks
- Ideas Vault
- Documentation
- Experiments
- Development logs
- Context

The **Context** page is the central hub, and the **Master Context File** is the permanent brain of the project.

That hierarchy should be mirrored in the repository docs.

## 4) Priority order for decisions

When information conflicts, resolve in this order:

1. Master Context File
2. Project decisions / ADRs
3. Architecture docs
4. Product docs
5. Feature docs
6. Implementation code
7. Experimental notes

If a new decision conflicts with this file, the file must be updated intentionally.

## 5) Product definition

Lumora is an AI learning workspace that helps users:
- upload and organize source material
- chat with sources
- extract summaries and notes
- generate flashcards and quizzes
- build conceptual understanding
- keep long-term memory across sessions
- use any supported model provider through a gateway layer

### Lumora is not:
- a generic ChatGPT wrapper
- a NotebookLM clone
- a PDF chat app with no deeper learning system
- a single-provider application

## 6) Learning philosophy

The system should optimize for:

- Understanding
- Retention
- Reasoning
- Curiosity
- Productivity
- Application

The user should move through this learning pipeline:

```text
Information -> Understanding -> Practice -> Memory -> Application -> Mastery
```

If a feature does not improve the pipeline, it is likely out of scope.

## 7) Target users

Primary users:
- students
- college students
- self-learners
- researchers

Secondary users:
- professionals
- developers
- teachers
- content creators
- teams using knowledge workflows

## 8) Design philosophy

Lumora should feel like a calm premium workspace.

### Visual traits
- minimal
- elegant
- modern
- quiet
- uncluttered
- professional
- premium
- legible

### References
The intended UI direction is influenced by:
- Notion
- Linear
- Arc Browser
- Apple
- Anthropic
- Perplexity

### Visual rules
- dark mode first
- whitespace is intentional
- typography must carry hierarchy
- colors should be restrained
- motion should be subtle
- no noisy gradients, flashy neon, or decorative clutter
- components should feel tactile but not heavy

## 9) Core product principles

- User owns their data.
- User owns their AI provider.
- No vendor lock-in.
- No fabricated citations.
- No hidden behavior.
- No dark patterns.
- No unnecessary subscription tricks.
- Preserve trust through transparency.
- Prefer explainability over magical obscurity.

## 10) Supported knowledge sources

Lumora should eventually support:
- PDF
- DOCX
- PPTX
- TXT
- Markdown
- HTML
- Images
- Books
- Research papers
- Websites
- YouTube transcripts
- Audio
- Recorded lectures
- GitHub repositories
- Codebases
- Personal notes
- Notion exports
- Obsidian vaults

Planned connectors:
- Google Drive
- Dropbox
- OneDrive
- GitHub
- Notion
- Google Docs

## 11) AI philosophy

Lumora is model-agnostic.

Supported providers should be interchangeable through a common interface. The product should be able to route requests to:
- OpenRouter
- OpenAI
- Anthropic
- Google Gemini
- DeepSeek
- Mistral
- Groq
- Ollama
- LM Studio
- vLLM
- local LLMs

The system should allow future providers without redesigning the app.

## 12) OpenRouter gateway principle

OpenRouter should be treated as a gateway, not as product logic. The frontend must not call OpenRouter directly. All model access must be abstracted behind backend services and provider adapters.

Requirements:
- streaming support
- tool calling support
- structured output support
- vision support where available
- fallback support
- provider health checks
- rate limiting awareness
- usage logging
- model-specific capability detection

## 13) Retrieval and memory

The retrieval system should be hybrid:
- keyword search
- vector search
- reranking
- chunk filtering
- citation extraction
- context compression

Memory should be layered:
- short-term conversation memory
- workspace memory
- source-grounded memory
- user preference memory
- optional long-term learning memory

Never send entire documents to the model unless explicitly necessary.

## 14) MVP scope

The MVP must stay intentionally small.

Required MVP features:
- project workspace
- document upload
- AI chat
- citations
- conversation memory
- search
- summaries
- flashcards
- quiz generation
- notes generation
- markdown export
- PDF export
- dark mode

Anything else must justify itself.

## 15) Post-MVP feature groups

Potential post-MVP additions:
- mind maps
- concept maps
- interactive diagrams
- timeline generation
- narrated lessons
- AI tutor mode
- research assistant
- writing assistant
- coding assistant
- project planner
- voice conversations
- collaborative workspaces
- study groups
- mobile apps
- desktop apps
- offline mode
- browser extension
- plugin ecosystem
- marketplace
- knowledge graph
- learning analytics
- whiteboard

## 16) UX rules

The experience should feel guided.

Desired behavior:
- users should not need to learn prompt engineering
- onboarding should explain the product naturally
- empty states should teach
- actions should be discoverable
- source context should be visible
- AI should feel like a collaborator, not a black box

## 17) UI structure

The app should support a sidebar-first workspace layout with areas such as:
- Home
- Workspaces
- Documents
- Chat
- Flashcards
- Quiz
- Notes
- Search
- Settings

This is a baseline; product changes may add or remove items if the information architecture is justified.

## 18) Technology stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Framer Motion

### Backend
- FastAPI
- Python
- PostgreSQL
- Redis
- SQLAlchemy
- Alembic

### AI / retrieval
- OpenRouter gateway
- embeddings service
- vector database or vector extension
- reranker
- prompt builder
- citation layer
- memory service
- tool calling orchestrator

### Infrastructure
- Docker
- CI/CD
- object storage
- logging
- monitoring
- secrets management

## 19) Frontend implementation rules

- Use TypeScript strict mode.
- Prefer feature-first folders.
- Keep components small.
- Prefer server components where they reduce complexity.
- Use Tailwind utility classes and shared design tokens.
- Use Framer Motion sparingly and purposefully.
- Keep interactions fast and accessible.
- Maintain responsive layouts by default.
- Do not hardcode theme values in components when tokens exist.

## 20) Backend implementation rules

- Keep business logic out of route handlers.
- Use services for orchestration.
- Use repositories for data access.
- Use schemas for input/output validation.
- Use background jobs for expensive work.
- Use explicit dependency injection patterns.
- Keep provider integrations isolated.
- Keep external APIs behind adapter layers.

## 21) AI pipeline

The AI request flow should be:

```text
User intent
-> workspace / user context
-> retrieval
-> reranking
-> prompt assembly
-> provider adapter
-> generation
-> citations
-> post-processing
-> streamed UI
```

No direct provider calls from the UI. No prompt construction inside random feature components.

## 22) Customization system

Lumora should allow customization of:
- theme
- accent color
- density
- sidebar width
- font
- animation intensity
- model provider
- model choice
- temperature / reasoning settings where exposed
- memory preferences
- privacy mode
- workspace preferences

Customization must remain controlled; users can change appearance and behavior without breaking product integrity.

## 23) Database direction

Default database assumption:
- PostgreSQL

Key entities will likely include:
- users
- workspaces
- documents
- chunks
- embeddings
- chats
- messages
- notes
- flashcards
- quizzes
- bookmarks
- settings
- providers
- API keys
- usage logs
- jobs
- audit trails

## 24) File and folder structure direction

The repository should use a top-level structure like:

```text
lumora/
├── .context/
├── apps/
├── packages/
├── docs/
├── prompts/
├── scripts/
├── tests/
├── assets/
├── infrastructure/
├── README.md
└── .env.example
```

Suggested substructure:
- `apps/web` for frontend
- `apps/api` for backend
- `packages/ui` for shared UI
- `packages/ai` for AI abstractions
- `packages/database` for schema and migrations
- `packages/auth` for auth helpers
- `packages/utils` for shared utilities
- `docs/` for human-readable technical documentation
- `prompts/` for prompt templates and versioning

## 25) Documentation system

The documentation system should include:
- vision
- PRD
- SRS
- architecture
- roadmap
- research
- design system
- decision log / ADRs
- tasks
- experiments
- development logs
- prompt library
- API spec
- database schema
- deployment guide
- testing guide
- security guide
- clarification questions
- release notes

Every major decision should have a place.

## 26) File-level doc expectations

Every major module should include at least:
- a README
- an architecture note
- an API note if applicable
- examples if applicable
- test coverage
- usage notes

Every service should document:
- purpose
- inputs
- outputs
- dependencies
- failure cases
- security concerns
- performance concerns

## 27) Clarification questions the agent must ask

The agent must ask these before making assumptions when the answer is not already defined:

### Product
- What is the MVP boundary?
- What is explicitly out of scope?
- Who is the primary user segment?
- Is offline mode required now or later?

### Frontend
- Mobile-first or desktop-first?
- PWA required?
- SSR, CSR, or hybrid?
- How strong should motion be?
- What accessibility target is required?

### Backend
- Monolith or service split?
- REST only or REST plus internal events?
- Background jobs required?
- Caching requirements?
- Multi-tenant support?

### AI
- Default provider?
- User-owned API keys or platform-managed?
- Memory strategy?
- Retrieval strategy?
- Embedding model?
- Reranker?
- Citation requirements?
- Tool calling policy?

### Auth and security
- Email/password?
- OAuth providers?
- Passkeys?
- Organization support?
- Encryption expectations?
- Audit logs?

### Deployment
- Docker required?
- Vercel, Railway, Render, or self-hosted?
- Kubernetes later?
- Secrets management approach?
- Observability stack?

### UI and customization
- Theme customization scope?
- Font selection?
- Animation intensity?
- Localization?
- RTL support?
- Density preferences?

If a question is needed, ask it before generating an irreversible design choice.

## 28) Forbidden assumptions

Do not assume:
- a provider model choice
- a database schema without confirmation
- an auth system without confirmation
- a deployment target without confirmation
- a vector database without confirmation
- that the frontend should call AI providers directly
- that design should be decorative instead of functional
- that citations can be fabricated

## 29) Coding standards

- Use readable code.
- Use small functions.
- Prefer composable modules.
- Avoid duplicated logic.
- Use consistent naming.
- Use meaningful commits.
- Add tests for core logic.
- Include loading and error states.
- Keep APIs stable where possible.
- Prefer explicit over clever.
- Document edge cases.
- Keep implementation maintainable over time.

## 30) Quality standards

The product should be measured by:
- citation accuracy
- learning retention
- task completion
- session usefulness
- search quality
- response latency
- retention of user context
- user satisfaction
- trust

## 31) Success definition

Lumora succeeds if users can bring in raw information and leave with durable understanding. The system must support that outcome consistently.

## 32) How an AI agent should use this file

Before generating code or docs:
1. read the master context
2. inspect the relevant module docs
3. identify unresolved questions
4. ask only the questions that materially affect the design
5. implement the smallest correct slice
6. document the decision
7. update the context if the product changes

Do not generate disconnected features that ignore the architecture or the learning philosophy.

## 33) The Notion-aligned workspace model

The repository docs should roughly mirror the existing Notion hub:
- Vision
- PRD
- SRS
- Research
- Architecture
- Roadmap
- Tasks
- Ideas Vault
- Documentation
- Experiments
- Development logs
- Context

The master context file is the anchor. Supporting docs expand each domain.

## 34) Final rule

Every feature, design choice, and code path should answer this question:

**Does this help users understand better?**

If the answer is no, remove it or justify it explicitly.
