# Codebase Analysis — Combined

Generated: 2026-06-12T03:16:16.038Z

```
# Combined Report

Implementation:

╔══════════════════════════════════════════╗
║     Codebase — Implementation Report     ║
╚══════════════════════════════════════════╝

Generated: 2026-06-12T03:16:15.976Z
Parser:    regex

── Overview ──
  Total files:      139 (TS: 111, TSX: 28)
  Total imports:    321
  Total exports:    290
  Functions:        201
  Arrow functions:  4
  Classes:          31
  Interfaces:       38
  Type aliases:     113
  React components: 4

── Per Package ──
  frontend:
    Files:        38
    Imports:      90
    Exports:      52
    Declarations: 90
  backend:
    Files:        92
    Imports:      226
    Exports:      183
    Declarations: 255
  packages/types:
    Files:        8
    Imports:      5
    Exports:      46
    Declarations: 35
  packages/utils:
    Files:        1
    Imports:      0
    Exports:      9
    Declarations: 7

── Top Dependencies ──
  @jobfindr/types                46
  react                          22
  fastify                        11
  ../../../shared/logger/logger.ts 11
  @/types                        10
  ../config/companies.ts         8
  ../../../config/env.ts         8
  @/hooks                        6
  ../../normalization/services/skill-extraction.ts 6
  ../services/normalization-pipeline.ts 5
  ../services/retry-system.ts    5
  ../../normalization/services/html-cleaner.ts 5
  ../config/company-registry.ts  5
  ./AutocompleteInput            4
  @/store/searchStore            4

── Exported API Surface (2) ──
  types:
    function       getMatchThresholdLabel         packages/types/src/match.types.ts
    function       getTrustVisibility             packages/types/src/trust.types.ts

── Files Scanned ──
  apps/backend/src/app.ts
  apps/backend/src/cache/aggregated-cache.ts
  apps/backend/src/cache/in-memory-cache.ts
  apps/backend/src/cache/provider-cache-layer.ts
  apps/backend/src/config/env.ts
  apps/backend/src/index.ts
  apps/backend/src/modules/matchmaking/domain/match-types.ts
  apps/backend/src/modules/matchmaking/services/match-explanation.ts
  apps/backend/src/modules/matchmaking/services/match-thresholds.ts
  apps/backend/src/modules/matchmaking/services/semantic-matching.ts
  apps/backend/src/modules/matchmaking/services/similarity-engine.ts
  apps/backend/src/modules/matchmaking/services/synonym-dictionary.ts
  apps/backend/src/modules/matchmaking/services/user-skill-parser.ts
  apps/backend/src/modules/matchmaking/services/weighted-match-scoring.ts
  apps/backend/src/modules/normalization/services/benefits-parser.ts
  apps/backend/src/modules/normalization/services/html-cleaner.ts
  apps/backend/src/modules/normalization/services/remote-detection.ts
  apps/backend/src/modules/normalization/services/salary-parser.ts
  apps/backend/src/modules/normalization/services/seniority-parser.ts
  apps/backend/src/modules/normalization/services/skill-extraction.ts
  apps/backend/src/modules/normalization/services/skill-normalizer.ts
  apps/backend/src/modules/providers/ashby/ashby-provider.ts
  apps/backend/src/modules/providers/config/companies.ts
  apps/backend/src/modules/providers/config/company-registry.ts
  apps/backend/src/modules/providers/domain/api-provider.ts
  apps/backend/src/modules/providers/domain/base-provider.ts
  apps/backend/src/modules/providers/domain/job-provider.interface.ts
  apps/backend/src/modules/providers/domain/json-provider.ts
  apps/backend/src/modules/providers/domain/provider-registry.ts
  apps/backend/src/modules/providers/domain/provider-type.ts
  apps/backend/src/modules/providers/greenhouse/greenhouse-provider.ts
  apps/backend/src/modules/providers/gupy/gupy-provider.ts
  apps/backend/src/modules/providers/lever/lever-provider.ts
  apps/backend/src/modules/providers/routes/admin-companies.ts
  apps/backend/src/modules/providers/services/company-discovery.ts
  apps/backend/src/modules/providers/services/company-sync.ts
  apps/backend/src/modules/providers/services/normalization-pipeline.ts
  apps/backend/src/modules/providers/services/provider-engine.ts
  apps/backend/src/modules/providers/services/provider-fallback.ts
  apps/backend/src/modules/providers/services/provider-health.ts
  apps/backend/src/modules/providers/services/provider-loader.ts
  apps/backend/src/modules/providers/services/provider-status-route.ts
  apps/backend/src/modules/providers/services/resilience/backoff-config.ts
  apps/backend/src/modules/providers/services/resilience/circuit-breaker.ts
  apps/backend/src/modules/providers/services/resilience/quota-manager.ts
  apps/backend/src/modules/providers/services/retry-system.ts
  apps/backend/src/modules/providers/workday/workday-provider.ts
  apps/backend/src/modules/ranking/domain/ranking-types.ts
  apps/backend/src/modules/ranking/services/composite-score.ts
  apps/backend/src/modules/ranking/services/large-company-priority.ts
  apps/backend/src/modules/ranking/services/match-score-weight.ts
  apps/backend/src/modules/ranking/services/ranking-engine.ts
  apps/backend/src/modules/ranking/services/recency-ranking.ts
  apps/backend/src/modules/ranking/services/salary-ranking.ts
  apps/backend/src/modules/ranking/services/trust-score-weight.ts
  apps/backend/src/modules/scraping/http/axios-client.ts
  apps/backend/src/modules/scraping/parsing/html-parser.ts
  apps/backend/src/modules/scraping/playwright/playwright-setup.ts
  apps/backend/src/modules/scraping/services/anti-blocking-layer.ts
  apps/backend/src/modules/scraping/services/rate-limiter.ts
  apps/backend/src/modules/scraping/services/request-queue.ts
  apps/backend/src/modules/scraping/services/retry-manager.ts
  apps/backend/src/modules/scraping/services/timeout-wrapper.ts
  apps/backend/src/modules/scraping/services/user-agent-rotation.ts
  apps/backend/src/modules/search/controllers/search-controller.ts
  apps/backend/src/modules/search/dto/search-dto.ts
  apps/backend/src/modules/search/services/aggregation-service.ts
  apps/backend/src/modules/search/services/pagination.ts
  apps/backend/src/modules/search/services/timeout-manager.ts
  apps/backend/src/modules/search/validation/search-validation.ts
  apps/backend/src/modules/suggestions/suggestions-controller.ts
  apps/backend/src/modules/trust/cache/trust-cache.ts
  apps/backend/src/modules/trust/services/company-reputation.ts
  apps/backend/src/modules/trust/services/hidden-companies-config.ts
  apps/backend/src/modules/trust/services/manual-override.ts
  apps/backend/src/modules/trust/services/provider-reputation.ts
  apps/backend/src/modules/trust/services/trust-engine.ts
  apps/backend/src/modules/trust/services/trust-score-formula.ts
  apps/backend/src/shared/logger/logger.ts
  apps/backend/src/shared/metrics/error-monitoring.ts
  apps/backend/src/shared/metrics/metrics.ts
  apps/backend/src/shared/metrics/provider-metrics.ts
  apps/backend/src/shared/metrics/timeout-monitoring.ts
  apps/backend/src/shared/middleware/anti-spam.ts
  apps/backend/src/shared/middleware/error-handler.ts
  apps/backend/src/shared/middleware/rate-limiter.ts
  apps/backend/src/shared/middleware/sanitization.ts
  apps/backend/src/shared/middleware/secure-headers.ts
  apps/backend/src/shared/middleware/validation.ts
  apps/backend/src/shared/services/provider-isolation.ts
  apps/backend/src/shared/services/request-batching.ts
  apps/backend/src/shared/streaming/partial-streaming.ts
  apps/frontend/src/App.tsx
  apps/frontend/src/components/ApplyCta.tsx
  apps/frontend/src/components/AutocompleteInput.tsx
  apps/frontend/src/components/CompanyFilters.tsx
  apps/frontend/src/components/CountryFilter.tsx
  apps/frontend/src/components/EmptyState.tsx
  apps/frontend/src/components/ExpandableDescription.tsx
  apps/frontend/src/components/FiltersPanel.tsx
  apps/frontend/src/components/JobCard.tsx
  apps/frontend/src/components/Layout.tsx
  apps/frontend/src/components/LoadingSkeleton.tsx
  apps/frontend/src/components/LoadingStates.tsx
  apps/frontend/src/components/MatchExplanationModal.tsx
  apps/frontend/src/components/MatchSummary.tsx
  apps/frontend/src/components/Modal.tsx
  apps/frontend/src/components/Pagination.tsx
  apps/frontend/src/components/RemoteModeFilter.tsx
  apps/frontend/src/components/SearchBar.tsx
  apps/frontend/src/components/SenioritySelector.tsx
  apps/frontend/src/components/SkillsTagsInput.tsx
  apps/frontend/src/components/SortToggle.tsx
  apps/frontend/src/components/TrustExplanationModal.tsx
  apps/frontend/src/components/TrustFilters.tsx
  apps/frontend/src/components/UserSkillsInput.tsx
  apps/frontend/src/components/UserSkillsModal.tsx
  apps/frontend/src/contexts/SkillsModalContext.tsx
  apps/frontend/src/hooks/index.ts
  apps/frontend/src/hooks/useDebounce.ts
  apps/frontend/src/hooks/useJobSearch.ts
  apps/frontend/src/hooks/useSuggestions.ts
  apps/frontend/src/main.tsx
  apps/frontend/src/pages/HomePage.tsx
  apps/frontend/src/services/api.ts
  apps/frontend/src/store/searchStore.ts
  apps/frontend/src/test-setup.ts
  apps/frontend/src/types/index.ts
  apps/frontend/src/utils/explain.ts
  apps/frontend/src/utils/index.ts
  packages/types/src/api.types.ts
  packages/types/src/index.ts
  packages/types/src/match.types.ts
  packages/types/src/normalized-job.ts
  packages/types/src/provider.types.ts
  packages/types/src/ranking.types.ts
  packages/types/src/search-dto.ts
  packages/types/src/trust.types.ts
  packages/utils/src/index.ts


Documentation:

╔══════════════════════════════════════════╗
║     Codebase — Documentation Report      ║
╚══════════════════════════════════════════╝

Generated: 2026-06-12T03:16:16.014Z

── Overview ──
  Total files:       53
  Markdown (.md):    48
  JSON:              4
  YAML:              1
  Text (.txt):       0
  Total headings:    334
  Total code blocks: 32
  Total list items:  914

── Code Block Languages ──
  ts                   12
  txt                  8
  (none)               4
  json                 3
  css                  3
  http                 2

── Duplicate Headings (24) ──
  "role" — 5x
  "before you start" — 5x
  "workflow" — 9x
  "when finished" — 3x
  "output" — 3x
  "constraints" — 2x
  "related documents" — 23x
  "retry limit (failure escalation)" — 4x
  "responsibilities" — 7x
  "implementation rules" — 2x
  "rules" — 7x
  "purpose" — 3x
  "provider isolation" — 2x
  "frontend" — 2x
  "backend" — 2x
  ... and 9 more

── All Headings (255) ──
  product manager agent                         .opencode/agents/01-product-manager.md
  role                                          .opencode/agents/01-product-manager.md
  before you start                              .opencode/agents/01-product-manager.md
  requirement: collect information first (terminal-choice wizard) .opencode/agents/01-product-manager.md
  wizard rules                                  .opencode/agents/01-product-manager.md
  when receiving an existing plan/document      .opencode/agents/01-product-manager.md
  handling skipped questions                    .opencode/agents/01-product-manager.md
  workflow                                      .opencode/agents/01-product-manager.md
  output structure example                      .opencode/agents/01-product-manager.md
  when finished                                 .opencode/agents/01-product-manager.md
  output                                        .opencode/agents/01-product-manager.md
  constraints                                   .opencode/agents/01-product-manager.md
  related documents                             .opencode/agents/01-product-manager.md
  tech lead agent                               .opencode/agents/02-tech-lead.md
  retry limit (failure escalation)              .opencode/agents/02-tech-lead.md
  task creation example                         .opencode/agents/02-tech-lead.md
  task-nn-<context>: [descriptive task name]    .opencode/agents/02-tech-lead.md
  depends on                                    .opencode/agents/02-tech-lead.md
  description                                   .opencode/agents/02-tech-lead.md
  technical details                             .opencode/agents/02-tech-lead.md
  implementation approach                       .opencode/agents/02-tech-lead.md
  testing                                       .opencode/agents/02-tech-lead.md
  references                                    .opencode/agents/02-tech-lead.md
  senior frontend agent                         .opencode/agents/03-senior-frontend.md
  responsibilities                              .opencode/agents/03-senior-frontend.md
  implementation rules                          .opencode/agents/03-senior-frontend.md
  branding                                      .opencode/agents/03-senior-frontend.md
  corrections cycle (qa)                        .opencode/agents/03-senior-frontend.md
  senior backend agent                          .opencode/agents/04-senior-backend.md
  qa reviewer agent                             .opencode/agents/05-qa-reviewer.md
  ... and 225 more

── Files Scanned ──
  .opencode/INDEX.md  [7 headings, 0 code blocks]
  .opencode/OPENCODE_PLUGINS.md  [21 headings, 10 code blocks]
  .opencode/agents/00-planning-agent.md  [0 headings, 0 code blocks]
  .opencode/agents/01-product-manager.md  [13 headings, 0 code blocks]
  .opencode/agents/02-tech-lead.md  [17 headings, 0 code blocks]
  .opencode/agents/03-senior-frontend.md  [10 headings, 0 code blocks]
  .opencode/agents/04-senior-backend.md  [8 headings, 0 code blocks]
  .opencode/agents/05-qa-reviewer.md  [13 headings, 0 code blocks]
  .opencode/architecture/01-system-overview.md  [7 headings, 0 code blocks]
  .opencode/architecture/02-architecture-principles.md  [9 headings, 0 code blocks]
  .opencode/architecture/03-monorepo-structure.md  [8 headings, 1 code blocks]
  .opencode/architecture/04-frontend-architecture.md  [7 headings, 1 code blocks]
  .opencode/architecture/05-frontend-guidelines.md  [9 headings, 0 code blocks]
  .opencode/architecture/06-backend-architecture.md  [9 headings, 2 code blocks]
  .opencode/architecture/07-api-architecture.md  [9 headings, 3 code blocks]
  .opencode/architecture/08-provider-architecture.md  [10 headings, 2 code blocks]
  .opencode/architecture/09-scraping-architecture.md  [6 headings, 0 code blocks]
  .opencode/architecture/10-normalization-layer.md  [6 headings, 1 code blocks]
  .opencode/architecture/11-matchmaking-engine.md  [8 headings, 1 code blocks]
  .opencode/architecture/12-trust-engine.md  [7 headings, 0 code blocks]
  .opencode/architecture/13-ranking-engine.md  [5 headings, 0 code blocks]
  .opencode/architecture/14-caching-architecture.md  [5 headings, 0 code blocks]
  .opencode/architecture/15-security-architecture.md  [5 headings, 0 code blocks]
  .opencode/architecture/16-performance-architecture.md  [6 headings, 0 code blocks]
  .opencode/architecture/17-observability-architecture.md  [6 headings, 1 code blocks]
  .opencode/architecture/18-deployment-architecture.md  [6 headings, 0 code blocks]
  .opencode/architecture/19-engineering-guidelines.md  [9 headings, 2 code blocks]
  .opencode/architecture/20-scalability-roadmap.md  [6 headings, 0 code blocks]
  .opencode/architecture/22-testing-philosophy.md  [5 headings, 0 code blocks]
  .opencode/architecture/commit-pattern.md  [6 headings, 2 code blocks]
  .opencode/commands/doc-audit.md  [5 headings, 0 code blocks]
  .opencode/commands/jobfindr-pipeline.md  [0 headings, 0 code blocks]
  .opencode/commands/product-manager.md  [0 headings, 0 code blocks]
  .opencode/commands/qa-reviewer.md  [0 headings, 0 code blocks]
  .opencode/commands/senior-backend.md  [0 headings, 0 code blocks]
  .opencode/commands/senior-frontend.md  [0 headings, 0 code blocks]
  .opencode/commands/tech-lead.md  [0 headings, 0 code blocks]
  .opencode/docs-catalog.md  [7 headings, 0 code blocks]
  .opencode/package-lock.json  [keys: name, lockfileVersion, requires, packages]
  .opencode/package.json  [keys: dependencies]
  .opencode/pipeline.yaml  [keys: pipeline, epics, tasks, steps, current_step]
  .opencode/project-structure.md  [1 headings, 0 code blocks]
  .opencode/skills/06-branding/SKILL.md  [12 headings, 3 code blocks]
  .opencode/skills/codebase-analysis/SKILL.md  [13 headings, 0 code blocks]
  .opencode/skills/codebase-analysis/output/docs-report.json  [keys: generatedAt, mode, summary, files, errors, headingIndex, codeBlockLanguages]
  .opencode/skills/codebase-analysis/output/docs-report.md  [1 headings, 1 code blocks]
  .opencode/skills/codebase-analysis/scripts/package.json  [keys: name, type, private, dependencies]
  .opencode/skills/continuous-learning/SKILL.md  [4 headings, 0 code blocks]
  .opencode/skills/doc-audit/SKILL.md  [11 headings, 0 code blocks]
  .opencode/skills/jobfindr-pipeline-next/SKILL.md  [10 headings, 0 code blocks]
  .opencode/skills/jobfindr-pipeline/SKILL.md  [15 headings, 0 code blocks]
  .opencode/skills/learning-improvement/SKILL.md  [5 headings, 0 code blocks]
  .opencode/skills/session-save/SKILL.md  [7 headings, 2 code blocks]

```
