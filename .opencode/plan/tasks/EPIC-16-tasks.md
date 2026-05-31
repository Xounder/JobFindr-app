# EPIC 16 — Provider Acquisition

**Origin:** `.opencode/plan/provider-acquisition/EPIC-PA-01` to `EPIC-PA-13`
**Layer:** Backend

## TASK-112 — Refactor JobProvider Interface for Real Providers
**Layer:** Backend
**Depends on:** TASK-017
### Description
Evolve the existing `JobProvider` interface to support real providers: add metadata (name, version, type), standardized result with errors, and typed search method.
### Deliverables
- `search(params): Promise<ProviderResult>` assinatura
- `ProviderMetadata` type (name, version, providerType, rateLimitInfo)
- `ProviderResult` type (jobs, errors, metadata, duration)

---

## TASK-113 — Create Provider Execution Engine
**Layer:** Backend
**Depends on:** TASK-112, TASK-018
### Description
Create execution engine that runs all providers in parallel with individual timeout, collects results and aggregates with/without errors.
### Deliverables
- `ProviderEngine.runAll(params): Promise<AggregatedResult>`
- Per-provider timeout (configurable, default 10s)
- Isolamento de falha (um provider nunca quebra os outros)
- Duration metrics per provider

---

## TASK-114 — Create Provider Normalization Pipeline
**Layer:** Backend
**Depends on:** TASK-034, TASK-112
### Description
Create normalization pipeline that transforms raw provider data into valid `NormalizedJob`s.
### Deliverables
- `Normalizer<T>` type: `(raw: T) => NormalizedJob`
- Field mapping helpers
- Output validation against schema
- Tratamento de campos ausentes

---

## TASK-115 — Create Provider Health Monitoring
**Layer:** Backend
**Depends on:** TASK-113
### Description
Track health of each provider: successes, failures, average latency.
### Deliverables
- Provider health store
- `GET /providers/status` endpoint
- Per-provider statistics (last hour, last 24h)

---

## TASK-116 — Create ProviderType Classification System
**Layer:** Backend
**Depends on:** TASK-112
### Description
Create provider type system: `api | json | html | browser` with specialized base classes.
### Deliverables
- `ProviderType` union type
- `BaseProvider` abstract class
- `ApiProvider` (HTTP client, pagination, rate-limit)
- `JsonProvider` (endpoint discovery, JSON path extraction)

---

## TASK-117 — Create Retry System with Exponential Backoff
**Layer:** Backend
**Depends on:** TASK-116, TASK-028
### Description
Enhance existing retry manager with exponential backoff, only for transient errors.
### Deliverables
- Reusable retry wrapper
- Configurable attempts (default 2)
- Exponential backoff calculation
- Logging de tentativas

---

## TASK-118 — Create Provider Timeout Manager
**Layer:** Backend
**Depends on:** TASK-113
### Description
Manage timeouts per provider with fallback and notification.
### Deliverables
- Timeout wrapper com AbortController
- Configurable timeout per provider
- Log de timeouts

---

## TASK-119 — Create Company Board Mapping Config
**Layer:** Backend
**Depends on:** TASK-116
### Description
Create centralized company→board token mapping configuration for all providers.
### Deliverables
- `companies.json` ou `companies.ts` com mapping
- 20+ empresas mapeadas para Greenhouse, Ashby, Lever
- Mapping validation schema

---

## TASK-120 — Implement Greenhouse Provider (Real)
**Layer:** Backend
**Depends on:** TASK-116, TASK-119, TASK-114
### Description
Replace mocked Greenhouse provider with real implementation using the public Greenhouse Job Board API.
### Deliverables
- `GreenhouseProvider` extends `ApiProvider`
- GET `/v1/boards/{board_token}/jobs` with pagination
- Mapeamento de campos: title, location, department, description, applyUrl
- Skill extraction from HTML description
- Company mapping via config
- `source: "greenhouse"`

---

## TASK-121 — Implement Ashby Provider
**Layer:** Backend
**Depends on:** TASK-116, TASK-119, TASK-114
### Description
Create provider for Ashby using public job posting API.
### Deliverables
- `AshbyProvider` extends `ApiProvider`
- GET `/posting-api/job-board/{board}` com `includeCompensation=true`
- Salary range extraction (min/max/currency/period)
- Mapeamento de campos para NormalizedJob
- `source: "ashby"`

---

## TASK-122 — Implement Lever Provider
**Layer:** Backend
**Depends on:** TASK-116, TASK-119, TASK-114
### Description
Create provider for Lever using public postings API.
### Deliverables
- `LeverProvider` extends `ApiProvider`
- GET `/v0/postings/{company}`
- Mapeamento: categories.location, categories.team, description, applyUrl
- publishedAt extraction
- `source: "lever"`

---

## TASK-123 — Refactor Workday Provider (Real)
**Layer:** Backend
**Depends on:** TASK-116, TASK-119, TASK-114
### Description
Replace mocked Workday provider with real implementation via POST to CXS API.
### Deliverables
- `WorkdayProvider` extends `JsonProvider`
- POST `/{tenant}/{career_site}/jobs` com headers adequados
- Pagination via body params
- Mapeamento de campos para NormalizedJob
- `source: "workday"`

---

## TASK-124 — Refactor Gupy Provider (Real)
**Layer:** Backend
**Depends on:** TASK-116, TASK-119, TASK-114
### Description
Replace mocked Gupy provider with real implementation with trust integration.
### Deliverables
- `GupyProvider` extends `JsonProvider`
- Research and implementation of the public Gupy endpoint
- Integration with trust engine for filtering
- City/state extraction for location
- `source: "gupy"`

---

## TASK-125 — Implement SmartRecruiters Provider (Post-MVP)
**Layer:** Backend
**Depends on:** TASK-116, TASK-114
### Description
Provider for SmartRecruiters (post-MVP). Validate auth requirement.
### Status: ❌ Deferred (post-MVP)

---

## TASK-126 — Create Company Career Pages Provider (Post-MVP)
**Layer:** Backend
**Depends on:** TASK-116, TASK-114
### Description
HTML scraping provider for companies without known ATS.
### Status: ❌ Deferred (post-MVP)

---

## TASK-127 — Implement Provider Discovery Engine (Post-MVP)
**Layer:** Backend
**Depends on:** TASK-116
### Description
Automatic ATS detection by URL/HTML signature.
### Status: ❌ Deferred (post-MVP)

---

## TASK-128 — Implement Circuit Breaker per Provider (Post-MVP)
**Layer:** Backend
**Depends on:** TASK-115
### Description
Circuit breaker for unstable providers.
### Status: ❌ Deferred (post-MVP)

---

## TASK-129 — Implement Response Streaming (Post-MVP)
**Layer:** Backend
**Depends on:** TASK-113
### Description
Partial streaming of results as providers finish.
### Status: ❌ Deferred (post-MVP)

---

## TASK-130 — Implement Browser Automation Provider (Post-MVP)
**Layer:** Backend
**Depends on:** TASK-025, TASK-116
### Description
Playwright-based provider for dynamic sites (last resort).
### Status: ❌ Deferred (post-MVP)
