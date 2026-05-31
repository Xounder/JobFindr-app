# Project Structure

```
jobfindr/
├── apps/
│   ├── frontend/          # React 19 + Vite 6 + Tailwind 4 SPA
│   │   └── src/
│   │       ├── components/  # 15 UI components (JobCard, SearchBar, Filters, Pagination, etc.)
│   │       ├── hooks/       # useJobSearch, useDebounce
│   │       ├── pages/       # HomePage (single route)
│   │       ├── services/    # api.ts — HTTP client for backend (port 3001)
│   │       ├── store/       # Zustand searchStore (filters, pagination)
│   │       ├── types/       # Frontend interfaces (Job, SearchParams, FiltersState)
│   │   └── utils/       # formatDate, truncate, trustLabel, buildQueryString, formatSalary
│   │   └── playwright-check.ts  # Standalone Playwright script for frontend verification (Windows)
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
│   ├── agents/              # Agent definitions (PM, TL, Frontend, Backend, QA)
│   ├── architecture/        # 22 architecture files (01-system-overview to 22-testing-philosophy)
│   ├── commands/            # Chat commands (pipeline, QA, validation)
│   ├── hooks/               # PowerShell scripts (validation)
│   ├── plan/                # Epics, tasks, provider acquisition (modularized in folders)
│   ├── screenshots/         # Frontend screenshots for reference
│   ├── sessions/            # Historical session .tmp files
│   └── skills/              # 5 skills: pipeline, branding, learning, session, continuous-learning
│
├── AGENTS.md               # Entry point — package manager, commands, conventions, pipeline
├── docker-compose.yml      # Backend container (app + database not mandatory — stateless)
├── opencode.jsonc           # opencode config — commands, MCP servers
├── pnpm-workspace.yaml      # Workspace pnpm (apps/*, packages/*)
├── package.json             # Root — shared scripts
└── pipeline.yaml            # Current pipeline state (used by jobfindr-pipeline-next)
```
