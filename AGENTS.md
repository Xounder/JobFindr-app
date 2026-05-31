# AGENTS.md — JobFindr

**Startup ritual (executar em toda nova sessão):**
1. Load skill `session-load` — carrega contexto da última sessão
2. Read `.opencode/INDEX.md` — central architecture guide

Sempre utilize o Full AI guide at `.opencode/INDEX.md` é um ponto central que guia para as outras partes.

## Package manager

pnpm ^11.1.3 required. `npm`/`npx` will fail (devEngines enforces pnpm).  
Use `pnpm dlx` instead of `npx` for one-off commands (e.g., Playwright MCP).

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

## Validation (available as chat commands)

| Command              | What it runs                                  |
| -------------------- | --------------------------------------------- |
| `/validate:frontend` | `pnpm --filter frontend lint` + `tsc -b`      |
| `/validate:backend`  | `pnpm --filter backend lint` + `tsc --noEmit` |
| `/validate:both`     | Both in parallel                              |

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

## Playwright checks (Windows)

**⚠ Playwright MCP browser tools não funcionam no Windows** (Chrome não encontrado no path padrão).  
Use o script standalone em `apps/frontend/playwright-check.ts`:

```bash
# 1. Iniciar backend e frontend (terminais separados)
pnpm --filter backend start
pnpm --filter frontend dev

# 2. Executar verificação (usa tsx do backend)
pnpm --filter backend exec tsx apps/frontend/playwright-check.ts
```

O script usa `chromium.launch()` do `@playwright/test` diretamente (não o MCP).  
Playwright Chromium já está instalado em `%USERPROFILE%\AppData\Local\ms-playwright\chromium-*`.

**Notas:**
- `waitUntil: "load"` é mais confiável que `networkidle` quando backend está ativo
- A página tem dois estados visuais: **vazio** (sem backend) e **resultados** (com backend) — os seletores mudam
- Screenshots são salvas em `.opencode/screenshots/`

## Test & CI status

- **vitest** installed in all 3 packages (`frontend`, `backend`, `@jobfindr/utils`)
- **236 tests** created and passing (utils: 15, frontend: 22, backend: 199)
- **No CI/CD** (no GitHub Actions workflows)
- Tests co-located with the module (`*.test.ts` next to the tested file)

## Architecture docs

Full AI guide at `.opencode/INDEX.md`. Layer docs in `.opencode/architecture/` (frontend 04-05, backend 06-07, providers 08-10, matchmaking/trust/ranking 11-13, infra 14-18, governance 19-22).

## Project orientation

Before any implementation work, read these two files to understand project layout and doc catalog — they replace the need to browse the filesystem:

1. **`.opencode/project-structure.md`** — full directory tree with folder-by-folder explanation
2. **`.opencode/docs-catalog.md`** — what every `.md` file in `.opencode/` contains and when to modify it

## Running Playwright (frontend agent)

See **"Playwright checks (Windows)"** section below. The frontend agent must use the standalone script instead of the MCP browser tools (they do not work on Windows).

## Pipeline agents

See `.opencode/skills/jobfindr-pipeline/SKILL.md` for full mode details.

- **Full Pipeline** (`/start`): PM → Tech Lead → Frontend+Backend (parallel) → QA Frontend+QA Backend (parallel) → corrections loop → complete
- **Direct Task Mode**: routes directly to implementation agent → QA → STOP, no PM/TL
- **Planning Analyst** (optional, on-demand): invoke `Task(subagent_type: "Planning Analyst", ...)` before any mode for feasibility, risk, and impact analysis. Output can feed into Product Manager or directly inform implementation.
- QA is mandatory for non-trivial tasks.

## All docs must be in English

All documentation files (`.md`, `.yaml`, `.json`, `.jsonc`, `.ts` comments, etc.) must be **100% in English**. No Portuguese or other languages allowed.
- File names, headings, descriptions, code comments — all English
- If you find a file with non-English content, translate it

## File size limit

No file (including AGENTS.md, `tasks.md`, `epics.md`, etc.) may exceed **400 lines**. If a file exceeds this limit, it MUST be modularized:
- Split sections into separate files within a folder
- Create an `index.md` in the folder with an overview and links
- Update all references that pointed to the original file

## STOP hook (after complete implementation)

At the end of each complete flow (e.g., Frontend → QA → STOP), run in sequence:
1. Load skill `learning-improvement` — evaluate the session
2. Load skill `continuous-learning` — propose and apply doc improvements (with user approval)
3. Load skill `session-save` — save session file
