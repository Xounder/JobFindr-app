# AGENTS.md — JobFindr (Operational Guide)

**Startup ritual (run in every new session):**
Read `.opencode/INDEX.md` — central architecture guide

> **Note**: This file (AGENTS.md) contains operational rules, commands, and conventions. For architectural navigation and design principles, see `.opencode/INDEX.md` (Architecture Guide).

## Package manager

pnpm ^11.1.3 required. `npm`/`npx` will fail (devEngines enforces pnpm).  

## Commands

```bash
pnpm install                          # install all workspace deps

# Frontend (port 5173)
pnpm --filter frontend dev            # vite dev server
pnpm --filter frontend build          # tsc -b && vite build
pnpm --filter frontend lint           # eslint . (flat config)

# Backend (port 3001)
pnpm --filter backend dev             # tsx watch src/index.ts
pnpm --filter backend build           # tsc -b
pnpm --filter backend start           # node dist/index.js

# Shared packages (must build before backend)
pnpm --filter @jobfindr/types build
pnpm --filter @jobfindr/utils build

# Docker (backend only)
docker compose up
```

## Monorepo layout

```
apps/frontend/   — React 19 + Vite 6 + Tailwind 4 + Zustand + TanStack Query
apps/backend/    — Node 22 + Fastify 5 + TypeScript 6
packages/types/  — @jobfindr/types (NormalizedJob, SearchParams, DTOs)
packages/utils/  — @jobfindr/utils (createJobId, sleep, clamp, hashString, etc.)
packages/configs/ — skeleton only (empty src/)
```

## TypeScript quirks (all packages share these)

- `verbatimModuleSyntax: true` → use `import type` for type-only imports
- `erasableSyntaxOnly: true` → no enums, no namespaces, no parameter properties
- `noUnusedLocals` + `noUnusedParameters` enabled
- `composite: true` → project references; must build before consuming
- `moduleResolution: bundler`, `allowImportingTsExtensions`, `rewriteRelativeImportExtensions`
- `baseUrl` is **deprecated in TS 6.0** — do not use it; `paths` resolves relative to tsconfig dir

## Architecture constraints

See `.opencode/INDEX.md` for full list. Key highlights:
- **Stateless**: no user accounts, resumes, personal data, or search history
- **Provider isolation**: each provider fails independently
- **Frontend has zero business logic

## Backend execution flow (non-obvious from file tree)

```
GET /jobs/search
  → search-controller.ts (validates via Zod)
    → aggregation-service.ts
      → providers (parallel: Greenhouse, Ashby, Lever, Workday, Gupy)
      → matchmaking (weighted skill scoring)
      → trust engine (threshold filter, default 6.5/10)
      → ranking (recency, salary, trust, match, company size)
      → pagination (max 20 per page)
```

**Entrypoint**: `apps/backend/src/app.ts` → `startServer()` (called by `src/index.ts`)

## Provider timeout env vars

| Variable                | Default | Provider   |
|-------------------------|---------|------------|
| `PROVIDER_TIMEOUT_MS`   | 10000   | Axios HTTP |
| `GREENHOUSE_TIMEOUT_MS` | 30000   | Greenhouse |
| `ASHBY_TIMEOUT_MS`      | 20000   | Ashby      |
| `LEVER_TIMEOUT_MS`      | 20000   | Lever      |
| `WORKDAY_TIMEOUT_MS`    | 15000   | Workday    |
| `GUPY_TIMEOUT_MS`       | 10000   | Gupy       |
| `ADZUNA_TIMEOUT_MS`     | 10000   | Adzuna     |
| `THEIRSTACK_TIMEOUT_MS` | 10000   | TheirStack |

## Frontend architecture

**Entrypoint**: `apps/frontend/src/main.tsx`  
**Import alias**: `@/` maps to `./src` (configured in vite.config.ts)  
**API client**: `apps/frontend/src/services/api.ts` — uses `VITE_API_URL` (default `http://localhost:3001`)  

## Parameter naming convention (frontend ↔ backend)

Frontend query param names must match backend expectations exactly:

| Frontend sends           | Backend expects        |
|--------------------------|------------------------|
| `excludedCompanies`      | `excludedCompanies`    |
| `minTrustScore`          | `minTrustScore`        |

The backend validation accepts both old and new names (alias fallback), but new code should use the canonical names above.

## Import patterns

- Backend cross-module: relative (`../../matchmaking/...`)
- Backend shared packages: scoped (`@jobfindr/types`, `@jobfindr/utils`)
- Frontend: path alias (`@/components/...`, `@/hooks/...`)

## Error Reporting

**Pipeline.yaml problems section**: Each step in `pipeline.yaml` must include a `problems` array to track non-code errors:

```yaml
steps:
  senior-frontend:
    status: "in_progress"
    notes: ""
    updated_at: ""
    problems: []  # e.g., ["Port 5173 in use", "Build failed"]
```

**Error reporting** (updated): All agents MUST return a summary of any errors encountered — including tool failures, process spawn issues, port conflicts, build tool problems, test failures. These must be reported in the agent's final return message AND added to the step's `problems` array in `pipeline.yaml`.

## Test & CI status

- **vitest** installed in all 3 packages (`frontend`, `backend`, `@jobfindr/utils`)
- **474 tests** created and passing (utils: 15, frontend: 179, backend: 280)
- **No CI/CD** (no GitHub Actions workflows)
- Tests co-located with the module (`*.test.ts` next to the tested file)

## Commit Message Conventions

**See `.opencode/architecture/commit-pattern.md` for full commit pattern rules, types, scopes, and examples.**

## Architecture docs

Full AI guide at `.opencode/INDEX.md`. Layer docs in `.opencode/architecture/` (frontend 04-05, backend 06-07, providers 08-10, matchmaking/trust/ranking 11-13, infra 14-18, governance 19-22).

## Project orientation

Before any implementation work, read these two files to understand project layout and doc catalog — they replace the need to browse the filesystem:

1. **`.opencode/project-structure.md`** — full directory tree with folder-by-folder explanation
2. **`.opencode/docs-catalog.md`** — what every `.md` file in `.opencode/` contains and when to modify it

## Pipeline agents

See `.opencode/skills/jobfindr-pipeline/SKILL.md` for full mode details and authoritative pipeline specification.

- **Planning Analyst** (mandatory for planning): MUST be auto-invoked via `Task(subagent_type: "Planning Analyst", ...)` whenever the user asks for planning, feasibility, risk, impact analysis, or technical approach. Do NOT start manual exploration — route to Planning Analyst immediately.
- QA is mandatory for non-trivial tasks.
- **Pipeline.yaml structure**: PM and Tech Lead agents MUST update `pipeline.yaml` with nested structure containing `status`, `notes`, and `updated_at` for each step (see `jobfindr-pipeline/SKILL.md` for format). Orchestrator must NOT update `pipeline.yaml` directly — only PM/Tech Lead agents own their step's status and notes.

## All docs must be in English

All documentation files (`.md`, `.yaml`, `.json`, `.jsonc`, `.ts` comments, etc.) must be **100% in English**. No Portuguese or other languages allowed.
- File names, headings, descriptions, code comments — all English
- If you find a file with non-English content, translate it

## Epics & tasks folder convention

All epics and tasks MUST use the **folder-per-context** pattern:

```
.opencode/plan/<context-name>/
├── epics/        # PM creates — one .md per epic + index.md
└── tasks/        # Tech Lead creates — one .md per task + index.md
```

Example from this session: `.opencode/plan/three-changes-analysis/epics/` and `.opencode/plan/three-changes-analysis/tasks/`. The `epics/` and `tasks/` subfolders live inside the same context folder — never in separate top-level folders.

## External files restriction

Never open, read, write, or request files outside this project directory. All operations must stay within the project root.

## File size limit

No file (including AGENTS.md, `tasks.md`, `epics.md`, etc.) may exceed **400 lines**. If a file exceeds this limit, it MUST be modularized:
- Split sections into separate files within a folder
- Create an `index.md` in the folder with an overview and links
- Update all references that pointed to the original file

## Agent rules

### External files restriction
Never open, read, write, or request files outside this project directory. All operations must stay within the project root.

### Process handling
- **Never check if a process is running** (no Get-Process, ps, etc.)
- **Never kill/taskkill processes yourself** — just run `pnpm` commands as-is
- If a port is already in use, report the error to the orchestrator — do not resolve it

### Tool preference for file operations
Prefer the **dedicated tools** (`grep`, `glob`, `read`, `edit`, `write`) for file searching and content operations over `bash`/PowerShell. Use `bash` only as a last resort when the dedicated tools cannot accomplish the task.

### Bash command restrictions
The shell environment rejects the following patterns:
- **Chained commands**: `&&`, `||`, `;`, `|`, backticks (`\``), `$()`, `${}`, literal newlines — each command must be a single statement
- **Unrecognized commands**: only the commands documented in this file (pnpm, git, docker, curl, ls, cat, etc.) and a few utility commands are accepted
- **Node/tsx execution**: scripts must be inside the project directory with `.ts`, `.js`, or `.tsx` extension; the script path is resolved from the project root (not from any `workdir` override); flags like `-e`, `--eval`, `--require` are blocked
- **File operations**: all file paths must resolve inside the project root
- **Curl**: only allowed to `localhost` URLs

### All tasks must be completed
The orchestrator MUST auto-continue phases until ALL tasks in the plan are implemented, validated, and QA-approved. Never stop after a partial phase. Only run the STOP hook after ALL tasks are done.

### Error reporting
All agents (Senior Frontend, Senior Backend, QA Reviewer) MUST return a summary of any errors encountered during their execution — including tool failures, process spawn issues, port conflicts, build tool problems. These must be reported back to the orchestrator in the final return message of the task.

### App cleanup
After running the application for validation (HTTP tests, etc.), agents MUST stop/terminate the running apllication. Do not leave the app running after validation is complete.

## STOP hook (after complete implementation)

At the end of each complete flow (e.g., Frontend → QA → STOP), run in sequence:
1. Load skill `learning-improvement` — evaluate the session
2. Load skill `continuous-learning` — propose and apply doc improvements (with user approval)
3. Load skill `session-save` — save session file
