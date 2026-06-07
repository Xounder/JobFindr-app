# Project Structure

```
jobfindr/
├── apps/
│   ├── frontend/          # React 19 + Vite 6 + Tailwind 4 SPA
│   │   └── src/
│   │       ├── components/  # 18 UI components (JobCard, SearchBar, Filters, Pagination, Modal, MatchExplanation, TrustExplanation, etc.)
│   │       ├── hooks/       # useJobSearch (accepts committed params, no debounce), useDebounce
│   │       ├── pages/       # HomePage (single route)
│   │       ├── services/    # api.ts — HTTP client for backend (port 3001)
│   │       ├── store/       # Zustand searchStore (filters, pagination)
│   │       ├── types/       # Frontend interfaces (Job, SearchParams, FiltersState)
│   │       ├── utils/       # formatDate, truncate, trustLabel, buildQueryString, formatSalary
│   │   └── index.ts             # Public exports
│   │
│   └── backend/            # Node 22 + Fastify 5 + TypeScript 6
│       └── src/
│           ├── config/       # env.ts — environment variables with fallback
│           ├── cache/        # provider-cache-layer, in-memory-cache
│           ├── shared/       # Middleware, logger, metrics, streaming
│           │   ├── middleware/ # error-handler, secure-headers, rate-limiter, validation, sanitization, anti-spam
│           │   ├── logger/    # Structured logger
│           │   ├── metrics/   # error-monitoring, timeout-monitoring, provider-metrics
│           │   ├── services/  # request-batching, provider-isolation
│           │   └── streaming/ # partial-streaming
│           └── modules/      # 7 independent vertical modules
│               ├── search/       # Controller, DTO, validation, aggregation-service, pagination, timeout-manager
│               │   ├── config/       # companies.ts — company→board_token mapping (29 companies)
│               │   ├── domain/       # JobProvider interface, ProviderRegistry, base-provider, api-provider, json-provider, provider-type
│               │   ├── services/     # provider-engine, normalization-pipeline, retry-system, provider-health, provider-loader, provider-fallback
│               │   ├── greenhouse/   # GreenhouseProvider (real) — Public API
│               │   ├── ashby/        # AshbyProvider (real) — Public API with compensation
│               │   ├── lever/        # LeverProvider (real) — Public API
│               │   ├── workday/      # WorkdayProvider (real) — CXS POST API
│               │   └── gupy/         # GupyProvider (real) — Public BR API
│               ├── scraping/     # Axios, Playwright, HTML parser, anti-blocking, rate-limiter, retry
│               ├── normalization/# Salary parser, skill extraction, seniority parser, HTML cleaner
│               ├── matchmaking/  # Weighted scoring, similarity engine, synonym dictionary, semantic matching
│               ├── trust/        # Trust engine, score formula, provider/company reputation, overrides
│               └── ranking/      # Ranking engine, composite score, recency/salary/company scoring
│
├── packages/
│   ├── types/              # @jobfindr/types — NormalizedJob, TrustScore, MatchScore, DTOs, etc.
│   ├── utils/              # @jobfindr/utils — createJobId, clamp, hashString, sleep, parseCommaList, etc.
│   └── configs/            # Skeleton — empty, reserved for shared configurations
│
├── .opencode/              # AI agent configuration and documentation
│   ├── INDEX.md             # Full AI guide — links to all architecture docs
│   ├── project-structure.md # This file — project structure
│   ├── docs-catalog.md      # Doc catalog — what each .md file contains
│   ├── agents/              # Agent definitions (Planning Analyst, PM, TL, Frontend, Backend, QA)
│   ├── architecture/        # 22 architecture files (01-system-overview to 22-testing-philosophy)
│   ├── commands/            # Chat commands (pipeline, QA, validation)
│   ├── hooks/               # PowerShell scripts (validation)
│   ├── plan/                # Epics, tasks, provider acquisition, three-changes-analysis, ux-fix-plan (modularized in folders)
│   │   ├── ux-fix-plan/             # UX Fix Plan — 7 changes (4 MVP + 1 follow-up cycle)
│   │   │   ├── index.md              # Overview of all 7 changes
│   │   │   ├── epics/               # Product Manager output (5 epics)
│   │   │   │   ├── index.md
│   │   │   │   ├── EPIC-01-modal-and-trust-labels.md
│   │   │   │   ├── EPIC-02-search-flow-rework.md
│   │   │   │   ├── EPIC-03-skills-modal-sync.md
│   │   │   │   ├── EPIC-04-show-more-modal.md
│   │   │   │   └── EPIC-05-match-trust-explanation-modals.md
│   │   │   └── tasks/               # Tech Lead output (8 tasks)
│   │   │       ├── index.md
│   │   │       ├── TASK-001-create-modal-component.md
│   │   │       ├── TASK-002-add-trust-slider-labels.md
│   │   │       ├── TASK-003-add-isdirty-store.md
│   │   │       ├── TASK-004-refactor-useJobSearch.md
│   │   │       ├── TASK-005-homepage-draft-commit.md
│   │   │       ├── TASK-006-search-button-glow.md
│   │   │       ├── TASK-007-userskills-modal-local-state.md
│   │   │       └── TASK-008-show-more-modal.md
│   │   ├── three-changes-analysis/  # Three Changes Analysis — Planning Analyst output
│   │   │   ├── index.md              # Overview of all 3 changes
│   │   │   ├── change-1-user-skills.md
│   │   │   ├── change-2-trust-display.md
│   │   │   ├── change-3-trust-redefinition.md
│   │   │   ├── recommendations.md    # Prioritization, phasing, risk
│   │   │   ├── epics/               # Product Manager output (2 epics)
│   │   │   │   ├── index.md
│   │   │   │   ├── EPIC-01-trust-model-rework.md
│   │   │   │   └── EPIC-02-user-skills-matchmaking.md
│   │   │   └── tasks/               # Tech Lead output (16 tasks)
│   │   │       ├── index.md
│   │   │       ├── EPIC-01-tasks.md
│   │   │       └── EPIC-02-tasks.md
│   ├── screenshots/         # Frontend screenshots for reference
│   ├── sessions/            # Historical session .tmp files
│   └── skills/              # 9 skills: pipeline, pipeline-next, branding, learning, continuous-learning, session-save, session-load, doc-audit, codebase-analysis
│
├── AGENTS.md               # Entry point — package manager, commands, conventions, pipeline
├── docker-compose.yml      # Backend container (app + database not mandatory — stateless)
├── opencode.jsonc           # opencode config — commands, MCP servers
├── pnpm-workspace.yaml      # Workspace pnpm (apps/*, packages/*)
├── package.json             # Root — shared scripts
└── pipeline.yaml            # Pipeline state file — tracks current step and status of each phase (used by jobfindr-pipeline and jobfindr-pipeline-next)
```
