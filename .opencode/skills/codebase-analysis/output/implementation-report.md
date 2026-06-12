# Codebase Analysis — Implementation

Generated: 2026-06-12T03:16:15.976Z

```

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

```
