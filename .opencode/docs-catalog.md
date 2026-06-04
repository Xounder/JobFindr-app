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
| `plan/ux-filter-modal-changes/index.md` | UX Filter/Modal Changes overview | New analysis or updates |
| `plan/ux-filter-modal-changes/item-1-clean-button.md` | Item 1 — Add → Clean button for AutocompleteInput | Requirements for Clean button change |
| `plan/ux-filter-modal-changes/item-2-company-exclusion.md` | Item 2 — Mutual exclusion Include/Exclude companies | Requirements for company exclusion change |
| `plan/ux-filter-modal-changes/item-3-skills-modal.md` | Item 3 — Your Skills modal rework (Save/discard) | Requirements for Skills modal change |
| `plan/ux-filter-modal-changes/item-4-show-more-modal.md` | Item 4 — Show More modal 70% sizing + title | Requirements for Show More modal change |
| `plan/ux-filter-modal-changes/item-5-trust-match-buttons.md` | Item 5 — Trust/Match explanation buttons (needs backend) | Requirements for Trust/Match button change |
| `plan/ux-filter-modal-changes/epics/index.md` | Epic overview — 4 epics (Filter Input, Modal Rework, Detail Modal, Trust/Match) | Epic refinement |
| `plan/ux-filter-modal-changes/epics/EPIC-01-filter-input-improvements.md` | Epic 01 — Clean button + Company mutual exclusion | Epic refinement |
| `plan/ux-filter-modal-changes/epics/EPIC-02-your-skills-modal-rework.md` | Epic 02 — Your Skills modal save/discard | Epic refinement |
| `plan/ux-filter-modal-changes/epics/EPIC-03-job-detail-modal-enhancement.md` | Epic 03 — Show More 70% sizing + title | Epic refinement |
| `plan/ux-filter-modal-changes/epics/EPIC-04-interactive-trust-match-explanations.md` | Epic 04 — Trust/Match breakdown + explanation modals | Epic refinement |
| `plan/ux-filter-modal-changes/tasks/index.md` | Task overview — 6 tasks across 4 epics | Task changes |
| `plan/ux-filter-modal-changes/tasks/TASK-001-clean-button-autocomplete.md` | Task 001 — Clean button on AutocompleteInput | Task changes |
| `plan/ux-filter-modal-changes/tasks/TASK-002-company-mutual-exclusion.md` | Task 002 — Company mutual exclusion | Task changes |
| `plan/ux-filter-modal-changes/tasks/TASK-003-skills-modal-save-discard.md` | Task 003 — Your Skills modal save/discard | Task changes |
| `plan/ux-filter-modal-changes/tasks/TASK-004-modal-sizing-job-title.md` | Task 004 — Modal 70% sizing + job title | Task changes |
| `plan/ux-filter-modal-changes/tasks/TASK-005-backend-trust-match-breakdown.md` | Task 005 — Backend trust/match breakdown data | Task changes |
| `plan/ux-filter-modal-changes/tasks/TASK-006-frontend-trust-match-modals.md` | Task 006 — Frontend trust/match explanation modals | Task changes |
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
| `plan/ux-fix-plan/index.md` | UX Fix Plan overview — 7 changes analysis | New planning cycle |
| `plan/ux-fix-plan/feasibility.md` | Technical feasibility, approaches for each change | Approach changes |
| `plan/ux-fix-plan/impact-analysis.md` | Impact per layer, 18-22 files touched | Impact assessment updates |
| `plan/ux-fix-plan/risks.md` | Risk assessment, regressions, mitigations | Risk updates |
| `plan/ux-fix-plan/recommendations.md` | Build order, phasing, MVP vs follow-up | Priority/dependency changes |
| `plan/ux-fix-plan/epics/index.md` | Epic overview — 5 epics (4 MVP + 1 follow-up) | Epic refinement |
| `plan/ux-fix-plan/epics/EPIC-01-modal-and-trust-labels.md` | Epic 01 — Modal component + trust slider labels | Epic refinement |
| `plan/ux-fix-plan/epics/EPIC-02-search-flow-rework.md` | Epic 02 — Draft/commit search flow rework | Epic refinement |
| `plan/ux-fix-plan/epics/EPIC-03-skills-modal-sync.md` | Epic 03 — Your Skills local state + sync on close | Epic refinement |
| `plan/ux-fix-plan/epics/EPIC-04-show-more-modal.md` | Epic 04 — Show More as modal | Epic refinement |
| `plan/ux-fix-plan/epics/EPIC-05-match-trust-explanation-modals.md` | Epic 05 — Match/Trust explanation modals (follow-up) | Epic refinement |
| `plan/ux-fix-plan/tasks/index.md` | Task overview — 8 frontend tasks | Task changes |
| `plan/ux-fix-plan/tasks/TASK-001-create-modal-component.md` | Task 001 — Create reusable Modal | Task changes |
| `plan/ux-fix-plan/tasks/TASK-002-add-trust-slider-labels.md` | Task 002 — Trust descriptions on slider | Task changes |
| `plan/ux-fix-plan/tasks/TASK-003-add-isdirty-store.md` | Task 003 — isDirty state + commitSearch to store | Task changes |
| `plan/ux-fix-plan/tasks/TASK-004-refactor-useJobSearch.md` | Task 004 — Refactor useJobSearch to accept params | Task changes |
| `plan/ux-fix-plan/tasks/TASK-005-homepage-draft-commit.md` | Task 005 — Draft/commit pattern in HomePage | Task changes |
| `plan/ux-fix-plan/tasks/TASK-006-search-button-glow.md` | Task 006 — Search button glow animation | Task changes |
| `plan/ux-fix-plan/tasks/TASK-007-userskills-modal-local-state.md` | Task 007 — UserSkillsModal local state | Task changes |
| `plan/ux-fix-plan/tasks/TASK-008-show-more-modal.md` | Task 008 — Show More as modal | Task changes |
| `plan/homepage-fixes/index.md` | Homepage Fixes overview — 3 issues | New analysis or updates |
| `plan/homepage-fixes/feasibility.md` | Technical feasibility and approaches for all 3 issues | Approach changes |
| `plan/homepage-fixes/impact-analysis.md` | Impact per layer — 3-4 files changed | Impact assessment updates |
| `plan/homepage-fixes/risks.md` | Risk assessment — persist migration risk, low overall | Risk updates |
| `plan/homepage-fixes/recommendations.md` | Recommendations — single frontend sprint | Priority/dependency changes |

---

## Support

| File | Content | When to modify |
|---|---|---|
| `hooks/README.md` | Available hooks and STOP flow | New hook; STOP flow changes |
| `project-structure.md` | Project structure map | Important folders/files change |
| `docs-catalog.md` | This file — doc catalog | New .md file created in .opencode/ |
