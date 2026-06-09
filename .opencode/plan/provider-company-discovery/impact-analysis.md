# Impact Analysis — Provider Company Discovery

## Scope of Changes

### Files to Modify
| File | Change Type | Risk Level |
|------|-------------|------------|
| `apps/backend/src/modules/providers/config/companies.ts` | Deprecate (keep for fallback) | Low |
| `apps/backend/src/modules/providers/services/provider-loader.ts` | Modify to use registry | Medium |
| `apps/backend/src/modules/providers/domain/provider-registry.ts` | No change (consumes providers) | None |

### Files to Create
| File | Purpose | Complexity |
|------|---------|------------|
| `apps/backend/src/modules/providers/config/company-registry.ts` | Dynamic company registry service | Medium |
| `apps/backend/src/modules/providers/services/company-discovery.ts` | Provider-specific discovery logic | High |
| `apps/backend/src/modules/providers/services/company-sync.ts` | Scheduled sync jobs | Medium |
| `apps/backend/src/modules/providers/routes/admin-companies.ts` | Admin management endpoints | Medium |
| `apps/backend/src/modules/providers/config/discovery-config.ts` | Discovery configuration | Low |

### Tests to Add/Modify
| Test File | Change |
|-----------|--------|
| `company-registry.test.ts` | New - registry CRUD, caching |
| `company-discovery.test.ts` | New - discovery logic per provider |
| `company-sync.test.ts` | New - sync job behavior |
| `admin-companies.test.ts` | New - admin endpoint validation |
| `provider-loader.test.ts` | Update - use registry instead of static imports |
| Integration tests | New - end-to-end discovery → sync → search |

## Component Impact

### Backend Services Affected
1. **Aggregation Service** (`aggregation-service.ts`) - No direct change (uses `providerRegistry.getAll()`)
2. **Provider Loader** (`provider-loader.ts`) - Must load companies from registry before instantiating providers
3. **Provider Implementations** (5 providers) - Constructor may receive company list from registry
4. **Search Controller** - No change (delegates to aggregation)

### Data Flow Changes

**Current (Hardcoded):**
```
provider-loader.ts → imports companies.ts → creates providers with static arrays
```

**Future (Dynamic):**
```
provider-loader.ts → companyRegistry.getAll(provider) → creates providers with dynamic lists
                        ↑
              company-sync.ts (scheduled) → company-discovery.ts → APIs
                        ↑
              admin-companies.ts (manual) → companyRegistry
```

### Configuration Impact
- New env vars for discovery: `DISCOVERY_ENABLED`, `DISCOVERY_INTERVAL_HOURS`, `DISCOVERY_CONCURRENCY`
- Feature flags per provider: `GREENHOUSE_DYNAMIC_COMPANIES`, `ASHBY_DYNAMIC_COMPANIES`, etc.
- Cache TTL config: `COMPANY_REGISTRY_TTL_SECONDS`

## Frontend Impact

**None directly** - Frontend only calls `/jobs/search` and receives results. Company list is backend-internal.

**Indirect benefit**: More companies = more jobs = better search results for users.

## Migration Strategy

### Phase 1: Greenhouse Only (Week 1-2)
- Implement registry, discovery, sync for Greenhouse
- Feature flag: `GREENHOUSE_DYNAMIC_COMPANIES=true`
- Validate: Compare job counts before/after

### Phase 2: Gupy Search Discovery (Week 2-3)
- Implement search-based discovery for Gupy
- Feature flag: `GUPY_DYNAMIC_COMPANIES=true`

### Phase 3: Curated+Admin for Ashby, Lever, Workday (Week 3-4)
- Admin API for all providers
- Migrate Ashby, Lever, Workday to registry
- Feature flags for each

### Phase 4: Cleanup (Week 4)
- Deprecate `companies.ts` (keep as fallback)
- Remove feature flags (enable all by default)
- Update documentation

## Rollback Plan

If issues detected:
1. Set feature flag to `false` for affected provider
2. Provider loader falls back to `companies.ts` static arrays
3. No code deployment needed - config change only

## Performance Impact

| Metric | Current | Expected | Impact |
|--------|---------|----------|--------|
| Provider init time | ~50ms | ~100ms (registry lookup) | Negligible |
| Search latency | No change | No change | None |
| Memory (company cache) | ~1KB | ~50KB (500 companies) | Negligible |
| Discovery API calls/day | 0 | ~500 (all providers) | Within rate limits |
| Admin API calls | N/A | Low (manual) | Negligible |

## Operational Impact

- **New monitoring**: Company count per provider, discovery success rate, sync job duration
- **New alerts**: Discovery failure >2 consecutive runs, company count drops >20%
- **Runbook**: Manual sync trigger, admin company CRUD, feature flag toggle