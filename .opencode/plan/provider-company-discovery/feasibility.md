# Feasibility Analysis — Provider Company Discovery

## Technical Feasibility: ✅ HIGH

### Existing Infrastructure Supports This
- **Provider abstraction**: `BaseProvider` → `ApiProvider`/`JsonProvider` pattern cleanly separates HTTP logic
- **Registry pattern**: `providerRegistry` already manages provider lifecycle
- **Loader pattern**: `ProviderLoader` dynamically imports and instantiates providers
- **Caching layer**: `ProviderCacheLayer` + `aggregatedCache` patterns exist
- **Scheduled jobs**: `node-cron` or similar can be added for sync jobs
- **Admin endpoints**: Fastify routes pattern established in `provider-status-route.ts`

### Provider API Feasibility

| Provider | Discovery Feasibility | Evidence |
|----------|----------------------|----------|
| **Greenhouse** | ✅ HIGH | Public `/v1/boards` endpoint documented; returns board_token + name |
| **Ashby** | ❌ LOW | No public org listing in API docs; requires curated approach |
| **Lever** | ❓ UNKNOWN | Need to test `/v0/postings` without company param |
| **Workday** | ❌ LOW | Architecturally impossible (per-tenant CXS endpoints) |
| **Gupy** | ✅ MEDIUM | Search returns `careerPageName`/`careerPageId`; iterative discovery possible |

### Implementation Complexity

| Component | Complexity | Est. Days |
|-----------|------------|-----------|
| CompanyRegistry service | Low | 1-2 |
| Greenhouse discovery | Low | 1 |
| Gupy search discovery | Medium | 2-3 |
| Admin CRUD API | Medium | 2 |
| Sync scheduler | Low | 1 |
| Provider loader integration | Low | 1 |
| Tests (unit + integration) | Medium | 3 |
| **Total** | **Medium** | **11-13 days** |

## Resource Feasibility: ✅ HIGH

### Team Capacity
- 1 Senior Backend developer (available)
- No blocking dependencies on other teams
- No external approvals needed (all public APIs)

### Infrastructure
- No new infrastructure required
- Existing Redis/cache layer can store company registry
- Existing logging/metrics cover new components

## Operational Feasibility: ✅ HIGH

### Rate Limit Analysis

| Provider | Discovery Calls | Rate Limit | Feasible? |
|----------|-----------------|------------|-----------|
| Greenhouse | ~150 (50 boards × 3 pages) | Unknown, likely generous | ✅ Yes |
| Gupy | ~50-100 searches | Unknown | ✅ Yes (staggered) |
| Ashby/Lever/Workday | 0 (curated) | N/A | ✅ Yes |

### Maintenance Burden
- **Greenhouse/Gupy**: Automated daily sync, self-healing
- **Ashby/Lever/Workday**: Manual admin updates (low frequency)
- **Monitoring**: Add to existing dashboards

## Cost-Benefit Analysis

### Benefits
| Metric | Current | Target | Value |
|--------|---------|--------|-------|
| Greenhouse companies | 13 | 50+ | 4x more jobs |
| Ashby companies | 6 | 50+ | 8x more jobs |
| Lever companies | 6 | 50+ | 8x more jobs |
| Workday companies | 4 | 50+ | 12x more jobs |
| Gupy companies | 0 | 50+ | Infinite (new source) |
| **Total job volume** | Baseline | **Est. 5-10x increase** | **High** |

### Costs
- **Development**: ~13 days (1 developer)
- **Ongoing**: Minimal (automated sync + occasional admin)
- **Risk**: Low (feature flags, rollback plan)

### ROI
**Strongly positive** - Single investment unlocks 5-10x more job content permanently.

## Decision Gates

### Gate 1: Greenhouse `/v1/boards` Test (Day 1)
- **Pass**: Returns 100+ boards with valid tokens → proceed with dynamic
- **Fail**: Requires auth or returns error → fallback to curated+admin

### Gate 2: Lever `/v0/postings` Test (Day 1)
- **Pass**: Returns postings with company metadata → dynamic discovery
- **Fail**: Returns 401/403 or empty → curated+admin

### Gate 3: Gupy Search Discovery Prototype (Day 3)
- **Pass**: Discovers 20+ unique companies in <50 API calls → proceed
- **Fail**: Too slow, too many calls, poor coverage → refine algorithm or reduce target

## Go/No-Go Recommendation

**GO** - All indicators positive:
- Technical foundation exists
- 2/5 providers support dynamic discovery natively
- 3/5 need curated approach (standard pattern, low risk)
- High ROI, low ongoing cost
- Clear rollback strategy

**Start immediately** with Gate 1 & 2 tests to validate assumptions.