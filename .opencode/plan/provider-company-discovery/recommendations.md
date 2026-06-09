# Recommendations — Provider Company Discovery

## Executive Summary

All 5 providers already use real APIs in production. The only "mock" element is the hardcoded company lists. The recommended approach is a hybrid model: dynamic discovery where APIs support it, curated lists with admin management where they don't.

## Provider-Specific Recommendations

### Greenhouse — Full Dynamic Discovery
- **Approach**: Use `GET https://boards-api.greenhouse.io/v1/boards`
- **Why**: Public endpoint exists, returns all boards with tokens
- **Implementation**: Scheduled job (daily) to fetch and cache all boards
- **Target**: 100+ companies (currently 13)

### Ashby — Curated List + Admin API
- **Approach**: No public org listing endpoint; maintain curated list
- **Why**: Ashby API docs show no organization enumeration
- **Implementation**: Admin CRUD endpoints for company management
- **Target**: 50+ companies (currently 6)

### Lever — Test Unauthenticated Listing
- **Approach**: Test `GET https://api.lever.co/v0/postings` without company param
- **Why**: May return all postings across companies
- **If successful**: Build discovery from response metadata
- **If fails**: Fall back to curated + admin (like Ashby)
- **Target**: 50+ companies (currently 6)

### Workday — Curated List + Admin API
- **Approach**: No central directory; each company unique subdomain/tenant/careerSite
- **Why**: Workday architecture is per-tenant, no global listing
- **Implementation**: Admin management for the 4-field config per company
- **Target**: 50+ companies (currently 4)

### Gupy — Search-Based Discovery
- **Approach**: Iterative broad searches to discover `careerPageName`/`careerPageId`
- **Why**: Search endpoint returns company metadata in results
- **Algorithm**: Search common terms → deduplicate by careerPageId → cache
- **Target**: 50+ companies (currently 0)

## Cross-Cutting Recommendations

### 1. Company Registry Service
New service `CompanyRegistry` replacing static arrays in `companies.ts`. Centralizes company configuration, supports dynamic discovery results and manual overrides.

### 2. Caching Strategy
Redis/in-memory cache with 24h TTL, background refresh. Cache discovered companies per provider with staleness tracking.

### 3. Admin API
REST endpoints for CRUD company configs, manual overrides, and triggering sync jobs. Required for curated providers (Ashby, Lever, Workday) and manual corrections.

### 4. Migration Path
Feature flag per provider (`GREENHOUSE_DYNAMIC_COMPANIES`, etc.) to switch from hardcoded → dynamic gradually with instant rollback.

### 5. Observability & Monitoring
Track discovered company count, API success rates, staleness, sync job duration. Alert on provider failure rates, latency spikes, company count drops >20%.

### 6. Resilience & Reliability (Gap Analysis)
Current providers have `withRetry`, rate-limit handling (`Retry-After`), and provider isolation. **Gaps to address:**
- **Circuit breaker** per provider to prevent cascade failures
- **Per-provider quotas** (requests/minute, concurrent requests)
- **Exponential backoff configuration** (base delay, max retries, jitter)
- **API key rotation framework** for future private APIs

### 7. Authentication Framework
All current APIs are public (no auth). If adding private APIs (LinkedIn, Indeed), need credential management: secret manager integration, scoped credentials per provider, rotation policy.

### 8. Testing Strategy
- **Unit tests**: Keep mocking HTTP (fast, reliable)
- **Integration tests**: Scheduled CI job hitting real APIs with rate limit guards
- **Contract tests**: Detect API schema changes
- **Chaos tests**: Provider API failures during sync

## Architecture Changes

```
apps/backend/src/modules/providers/
├── config/
│   ├── companies.ts              # DEPRECATE - keep for fallback only
│   └── company-registry.ts       # NEW - dynamic registry service
├── services/
│   ├── company-discovery.ts      # NEW - provider-specific discovery logic
│   ├── company-sync.ts           # NEW - scheduled sync jobs
│   └── resilience/               # NEW - circuit breaker, quotas, backoff
│       ├── circuit-breaker.ts
│       ├── quota-manager.ts
│       └── backoff-config.ts
└── routes/
    └── admin-companies.ts        # NEW - admin management endpoints
```

## Tech Lead Guidance

This plan provides strategic direction. The Tech Lead should:
1. **Validate provider API assumptions** (Greenhouse `/v1/boards`, Lever `/v0/postings`, Gupy search) before committing
2. **Break into implementation tasks** with clear ownership and sequencing
3. **Prioritize Phase 1** (Greenhouse dynamic + registry foundation) as it unlocks most value
4. **Defer Phase 3** (Auth framework) until private APIs are needed
5. **Integrate resilience** (circuit breaker, quotas) into provider base classes, not per-provider