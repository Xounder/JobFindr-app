# Docs Catalog

Catalog of all `.md` files in `.opencode/` with content description and when to modify them. Used by the `continuous-learning` skill to quickly identify which files to adjust based on each session's learnings.

---

## Entry Points

| File | Content | When to modify |
|---|---|---|
| `AGENTS.md` | pnpm commands, validation, TS quirks, constraints, pipeline modes, test status | Tasks AFFECT commands/scripts/build scripts; new tests created; pipeline mode changes |
| `INDEX.md` | Central guide — links to all architecture docs, constraints, pipeline modes | New docs created; architecture changes; pipeline modes change |

---

## Agents

| File | Content | When to modify |
|---|---|---|
| `agents/00-planning-agent.md` | Planning Analyst — feasibility, risk, impact analysis, on-demand planning docs for PM | New analysis types; planning output format changes |
| `agents/01-product-manager.md` | PM instructions — mandatory questions, folder-per-epic output, plan .md → epics, pipeline.yaml | PM flow changes; new artifact types |
| `agents/02-tech-lead.md` | TL instructions — decomposition, folder-per-task output, one .md per task, pipeline.yaml | Task format changes; allocation changes |
| `agents/03-senior-frontend.md` | Frontend agent instructions | Frontend conventions change |
| `agents/04-senior-backend.md` | Backend agent instructions | Backend conventions change |
| `agents/05-qa-reviewer.md` | QA agent instructions — pipeline.yaml, frontend/backend verification, checklist | QA checklist changes; new patterns |

---

## Skills

| File | Content | When to modify |
|---|---|---|
| `skills/jobfindr-pipeline/SKILL.md` | Orchestrator — Full Pipeline + Direct Task Mode | Pipeline flow changes; new steps; new rules |
| `skills/jobfindr-pipeline-next/SKILL.md` | Pipeline continuation reading pipeline.yaml | pipeline.yaml format changes |

| `skills/06-branding/SKILL.md` | Brand guide — colors, typography, visual rules | Palette changes; new components; dark mode |
| `skills/learning-improvement/SKILL.md` | Session evaluation (step 1/3 of STOP) | Evaluation format changes; chaining enforcement |
| `skills/continuous-learning/SKILL.md` | Doc update proposal (step 2/3 of STOP) | Scope of analyzed docs changes |
| `skills/session-save/SKILL.md` | Session persistence (step 3/3 of STOP) | File format changes |
| `tools/save-session.ts` | Session save custom tool — creates session file, keeps 2 most recent (runs via Bun/Node) | Tool logic changes; retention policy changes |
| `skills/doc-audit/SKILL.md` | Audits .md files for duplicates and intra-file prompt duplication (excludes /plan folder) | New audit rules; file similarity detection changes |
| `skills/codebase-analysis/SKILL.md` | Scans all TS/TSX files with tree-sitter — extracts imports, exports, declarations, React components, dependency maps | New scan targets; grammar changes; output format changes |

---

## Architecture

| File | Content | When to modify |
|---|---|---|
| `architecture/01-system-overview.md` | System overview | General architecture changes |
| `architecture/02-architecture-principles.md` | Principles and philosophy | Principles change |
| `architecture/03-monorepo-structure.md` | Monorepo structure | Packages/folders change |
| `architecture/04-frontend-architecture.md` | Stack, structure, responsibilities | Frontend stack changes |
| `architecture/05-frontend-guidelines.md` | UI principles, state, component rules | Component rules change |
| `architecture/06-backend-architecture.md` | Backend stack, module pattern | Backend stack changes |
| `architecture/07-api-architecture.md` | REST endpoints, pagination, errors | API changes (new endpoints) |
| `architecture/08-provider-architecture.md` | Provider interface, isolation | Providers change |
| `architecture/09-scraping-architecture.md` | Scraping strategies, safety | Scraping changes |
| `architecture/10-normalization-layer.md` | NormalizedJob, cleaning | Normalization changes |
| `architecture/11-matchmaking-engine.md` | Matchmaking pipeline | Scoring/algorithm changes |
| `architecture/12-trust-engine.md` | Trust thresholds, signals | Thresholds/signals change |
| `architecture/13-ranking-engine.md` | Ranking priorities, scoring | Weights/algorithm changes |
| `architecture/14-caching-architecture.md` | Cache strategy, TTLs | Cache/TTL change |
| `architecture/15-security-architecture.md` | Security requirements | Security requirements change |
| `architecture/16-performance-architecture.md` | Performance rules | Metrics/limits change |
| `architecture/17-observability-architecture.md` | Logging, health check, metrics | Observability stack changes |
| `architecture/18-deployment-architecture.md` | Deployment targets, containers | Deploy changes |
| `architecture/22-testing-philosophy.md` | Testing priorities, methodology | Testing strategy changes |
| `architecture/19-engineering-guidelines.md` | Code style, naming, TS rules, anti-patterns | Guidelines change |
| `architecture/20-scalability-roadmap.md` | Scalability philosophy, future | Roadmap changes |
| `architecture/commit-pattern.md` | Commit message convention — type(scope): description | New convention; format changes |

---

## Commands

| File | Content | When to modify |
|---|---|---|
| `commands/jobfindr-pipeline.md` | `/start` pipeline command | Pipeline flow changes |
| `commands/product-manager.md` | PM command | PM process changes |
| `commands/tech-lead.md` | TL command | TL process changes |
| `commands/senior-frontend.md` | Frontend agent command | Frontend tasks change |
| `commands/senior-backend.md` | Backend agent command | Backend tasks change |
| `commands/qa-reviewer.md` | QA Reviewer command | QA process changes |
| `commands/doc-audit.md` | `/doc-audit` command to run doc audit skill | Audit flow changes; new detection rules |

---

## Support

| File | Content | When to modify |
|---|---|---|
| `project-structure.md` | Project structure map | Important folders/files change |
| `docs-catalog.md` | This file — doc catalog | New .md file created in .opencode/ |
