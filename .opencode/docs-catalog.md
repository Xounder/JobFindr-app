# Docs Catalog

Catalog of all `.md` files in `.opencode/` with content description and when to modify them. Used by the `continuous-learning` skill to quickly identify which files to adjust based on each session's learnings.

---

## Entry Points

| File | Content | When to modify |
|---|---|---|
| `AGENTS.md` | pnpm commands, validation, TS quirks, constraints, pipeline modes, test status, Playwright checks (Windows), Running Playwright (frontend agent) | Tasks AFFECT commands/scripts/build scripts; new tests created; pipeline mode changes; Playwright check flow changes |
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
| ~~`skills/01-product-manager/SKILL.md`~~ | Removed — content migrated to `agents/01-product-manager.md` | N/A |
| ~~`skills/02-tech-lead/SKILL.md`~~ | Removed — content migrated to `agents/02-tech-lead.md` | N/A |
| ~~`skills/05-qa-reviewer/SKILL.md`~~ | Removed — content migrated to `agents/05-qa-reviewer.md` | N/A |
| `skills/06-branding/SKILL.md` | Brand guide — colors, typography, visual rules | Palette changes; new components; dark mode |
| `skills/learning-improvement/SKILL.md` | Session evaluation (step 1/3 of STOP) | Evaluation format changes; chaining enforcement |
| `skills/continuous-learning/SKILL.md` | Doc update proposal (step 2/3 of STOP) | Scope of analyzed docs changes |
| `skills/session-save/SKILL.md` | Session persistence (step 3/3 of STOP) | File format changes |

---

## Architecture

| File | Content | When to modify |
|---|---|---|
| `architecture/architecture.md` | General architecture index — folder README | General architecture changes |
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
| `architecture/19-engineering-guidelines.md` | Code style, naming, TS rules | Guidelines change |
| `architecture/20-scalability-roadmap.md` | MVP philosophy, future | Roadmap changes |
| `architecture/21-anti-patterns.md` | Forbidden patterns | New anti-patterns |

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

---

## Plan

| File | Content | When to modify |
|---|---|---|
| `plan/epics/index.md` | Product epics (modularized by EPIC) | New epic; epic refined |
| `plan/epics/EPIC-NN-*.md` | Individual epic | Specific EPIC changes |
| `plan/tasks/index.md` | Detailed technical tasks (modularized by EPIC) | New task; task completed |
| `plan/tasks/EPIC-NN-tasks.md` | Tasks of a specific EPIC | Task of that EPIC changes |
| ~~`plan/EPIC-01-tasks.md`~~ | Removed — modularized into `plan/tasks/EPIC-01-tasks.md` | N/A |
| ~~`plan/epics.md`~~ | Removed — modularized into `plan/epics/index.md` + EPIC files | N/A |
| ~~`plan/PROVIDER_ACQUISITION_PLAN.md`~~ | Removed — modularized into `plan/provider-acquisition-plan/` | N/A |
| `plan/provider-acquisition/index.md` | Provider acquisition overview — phase→epic mapping | New provider; removed phase |
| `plan/provider-acquisition/EPIC-PA-01-provider-foundation.md` | Provider Foundation — interface, registry, engine | Infrastructure provider changes |
| `plan/provider-acquisition/EPIC-PA-02-provider-classification.md` | Provider Classification — ApiProvider, JsonProvider | Classification changes |
| `plan/provider-acquisition/EPIC-PA-03-greenhouse.md` | Greenhouse Integration | Greenhouse provider changes |
| `plan/provider-acquisition/EPIC-PA-04-ashby.md` | Ashby Integration | Ashby provider changes |
| `plan/provider-acquisition/EPIC-PA-05-lever.md` | Lever Integration | Lever provider changes |
| `plan/provider-acquisition/EPIC-PA-06-workday.md` | Workday Integration | Workday provider changes |
| `plan/provider-acquisition/EPIC-PA-07-gupy.md` | Gupy Integration | Gupy provider changes |
| `plan/provider-acquisition/EPIC-PA-08-smartrecruiters.md` | SmartRecruiters (post-MVP) | SmartRecruiters changes |
| `plan/provider-acquisition/EPIC-PA-09-company-career-pages.md` | Career pages scraping (post-MVP) | Scraping changes |
| `plan/provider-acquisition/EPIC-PA-10-provider-discovery-engine.md` | ATS auto-discovery (post-MVP) | Discovery changes |
| `plan/provider-acquisition/EPIC-PA-11-reliability-layer.md` | Circuit breaker, health scoring (post-MVP) | Reliability changes |
| `plan/provider-acquisition/EPIC-PA-12-optimization.md` | Streaming, cache, dedup (post-MVP) | Optimization changes |
| `plan/provider-acquisition/EPIC-PA-13-browser-automation.md` | Playwright automation (post-MVP, last resort) | Browser automation changes |
| `plan/three-changes-analysis/index.md` | Three Changes Analysis overview | New analysis or updates |
| `plan/three-changes-analysis/change-1-user-skills.md` | Change 1 — User Skills Tab analysis | Requirements for User Skills change |
| `plan/three-changes-analysis/change-2-trust-display.md` | Change 2 — Trust Display Fix analysis | Requirements for Trust Display change |
| `plan/three-changes-analysis/change-3-trust-redefinition.md` | Change 3 — Trust Redefinition analysis | Requirements for Trust Redefinition change |
| `plan/three-changes-analysis/recommendations.md` | Cross-cutting recommendations and prioritization | Priority/dependency changes |
| `plan/three-changes-analysis/epics/index.md` | Epic overview for Trust Model Rework + User Skills | New epic definitions |
| `plan/three-changes-analysis/epics/EPIC-01-trust-model-rework.md` | Epic 01 — Trust Model Rework (Changel 2+3) | Epic refinement |
| `plan/three-changes-analysis/epics/EPIC-02-user-skills-matchmaking.md` | Epic 02 — User Skills & Matchmaking (Change 1) | Epic refinement |
| `plan/three-changes-analysis/tasks/index.md` | Task overview for Three Changes Analysis | New task definitions |
| `plan/three-changes-analysis/tasks/EPIC-01-tasks.md` | Tasks for EPIC-01 (Trust Model Rework) | Task changes for Trust Model |
| `plan/three-changes-analysis/tasks/EPIC-02-tasks.md` | Tasks for EPIC-02 (User Skills & Matchmaking) | Task changes for User Skills |
| `plan/prioridades-ux/index.md` | Prioridades UX — 4 changes analysis overview | New planning cycle |
| `plan/prioridades-ux/change-1-user-skills-header.md` | Change 1 — Your Skills in header modal | Your Skills requirements change |
| `plan/prioridades-ux/change-2-trust-ordering.md` | Change 2 — Trust-first default ordering | Ordering requirements change |
| `plan/prioridades-ux/change-3-search-bar.md` | Change 3 — Search bar visual indicator + suggestions | Search bar requirements change |
| `plan/prioridades-ux/change-4-sort-toggle.md` | Change 4 — Sort preference toggle (trust vs match) | Sort requirements change |
| `plan/prioridades-ux/impact-analysis.md` | Impact per layer for all 4 changes | Impact analysis updates |
| `plan/prioridades-ux/risks.md` | Risk assessment for all 4 changes | Risk updates |
| `plan/prioridades-ux/recommendations.md` | Phasing, epics, and recommendations | Priority/dependency changes |

---

## Support

| File | Content | When to modify |
|---|---|---|
| `hooks/README.md` | Available hooks and STOP flow | New hook; STOP flow changes |
| `project-structure.md` | Project structure map | Important folders/files change |
| `docs-catalog.md` | This file — doc catalog | New .md file created in .opencode/ |
