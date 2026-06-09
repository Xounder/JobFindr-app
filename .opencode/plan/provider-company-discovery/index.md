# Provider Company Discovery — Strategic Plan for Tech Lead

**Date:** 2026-06-06
**Status:** Draft
**Audience:** Tech Lead (for task breakdown and implementation planning)

---

## Executive Summary

All 5 JobFindr providers (Greenhouse, Ashby, Lever, Workday, Gupy) already use **real APIs in production** — there are no mocks to remove. The only "hardcoded" element is the company/board configuration lists in `apps/backend/src/modules/providers/config/companies.ts`.

This plan expands coverage from ~29 total companies to **50+ per provider** (250+ total) through a hybrid approach:
- **Dynamic discovery** where APIs support it (Greenhouse, Gupy)
- **Curated lists + admin management** where they don't (Ashby, Lever, Workday)

---

## Strategic Direction

### Phase 1: Foundation & Greenhouse (Week 1-2)
**Goal**: Build `CompanyRegistry` service + Greenhouse dynamic discovery
- Create registry service with caching, TTL, feature flags
- Implement Greenhouse `/v1/boards` discovery
- Migrate Greenhouse provider to use registry
- Validate: job count increase, sync reliability

### Phase 2: Gupy Search Discovery (Week 2-3)
**Goal**: Implement search-based company discovery for Gupy
- Build iterative search algorithm (common terms → careerPageId dedupe)
- Weekly sync job with rate limiting
- Migrate Gupy to registry

### Phase 3: Curated Providers + Admin API (Week 3-4)
**Goal**: Admin management for Ashby, Lever, Workday
- Build admin CRUD API for company configs
- Migrate Ashby, Lever, Workday to registry
- Add validation for Workday (test connection before save)

### Phase 4: Resilience & Observability (Week 4-5)
**Goal**: Production hardening
- Circuit breaker per provider
- Per-provider quotas (rate limiting)
- Exponential backoff config
- Monitoring/alerting dashboards

### Phase 5: Testing & Validation (Ongoing)
**Goal**: Quality gates
- Integration tests for discovery flows
- Contract tests for provider APIs
- Chaos tests for sync failures
- Load tests with 500+ companies

---

## Provider-Specific Strategy

| Provider | Current | Target | Approach | Key Decision |
|----------|---------|--------|----------|--------------|
| **Greenhouse** | 13 | 100+ | Dynamic | `GET /v1/boards` — **test Day 1** |
| **Ashby** | 6 | 50+ | Curated + Admin | No API — admin CRUD only |
| **Lever** | 6 | 50+ | Test First | `GET /v0/postings` no company — **test Day 1** |
| **Workday** | 4 | 50+ | Curated + Admin | Per-tenant config — admin with validation |
| **Gupy** | 0 | 50+ | Search-based | Iterative searches — prototype Day 3 |

---

## Key Technical Decisions for Tech Lead

### 1. Registry Design
- **Scope**: Per-provider company lists with metadata (enabled, priority, config)
- **Storage**: In-memory + Redis, 24h TTL, background refresh
- **API**: `getAll(provider)`, `getById(id)`, `upsert(config)`, `disable(id)`
- **Fallback**: Static `companies.ts` when feature flag off

### 2. Discovery Implementation
- **Greenhouse**: Simple paginated fetch, map to registry format
- **Gupy**: Search terms array → parallel requests → dedupe by careerPageId
- **Scheduler**: `node-cron`, configurable interval per provider

### 3. Admin API
- **Endpoints**: CRUD + `POST /sync` trigger + `GET /status`
- **Auth**: Existing JWT + `admin:companies` scope
- **Validation**: Workday connection test, Lever/Greenhouse board test

### 4. Resilience (Cross-Cutting)
- **Circuit Breaker**: Wrap provider `search()` calls, config per provider
- **Quotas**: Token bucket per provider (requests/min, concurrent)
- **Backoff**: Configurable base/max/jitter in `env.ts`

### 5. Feature Flags
```
GREENHOUSE_DYNAMIC_COMPANIES=true
GUPY_DYNAMIC_COMPANIES=true
ASHBY_DYNAMIC_COMPANIES=false  # curated only
LEVER_DYNAMIC_COMPANIES=false  # depends on Gate 2
WORKDAY_DYNAMIC_COMPANIES=false
```

---

## Validation Gates (Must Pass Before Proceeding)

| Gate | Test | Pass Criteria | Owner |
|------|------|---------------|-------|
| **Gate 1** | `GET https://boards-api.greenhouse.io/v1/boards` | Returns 50+ boards with valid tokens | Tech Lead |
| **Gate 2** | `GET https://api.lever.co/v0/postings` (no company) | Returns postings with company metadata OR 401/403 | Tech Lead |
| **Gate 3** | Gupy search prototype (10 terms) | Discovers 20+ unique careerPageId in <50 calls | Tech Lead |

**If Gate 1 fails** → Greenhouse falls back to curated + admin
**If Gate 2 fails** → Lever uses curated + admin
**If Gate 3 fails** → Reduce Gupy target or refine algorithm

---

## Supporting Documents

| Document | Purpose |
|----------|---------|
| [recommendations.md](./recommendations.md) | Technical approach per provider + resilience gaps |
| [risks.md](./risks.md) | Risk matrix with mitigations |
| [impact-analysis.md](./impact-analysis.md) | File changes, data flow, migration strategy |
| [feasibility.md](./feasibility.md) | Technical feasibility, ROI, decision gates |

---

## Tech Lead Next Actions

1. **This week**: Run Gate 1 & 2 API tests (can use curl/Postman)
2. **Day 3**: Run Gate 3 Gupy prototype (write quick script)
3. **Week 1**: Break down Phase 1 into dev tasks, assign to Senior Backend
4. **Ongoing**: Review progress weekly, adjust scope based on findings

---

## Out of Scope (Future)

- Private API authentication (LinkedIn, Indeed) — Phase 3 Auth Framework
- Frontend admin UI — separate frontend task
- Cross-provider company deduplication — nice to have
- Historical company analytics — future enhancement