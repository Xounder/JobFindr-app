# TASK-01-company-registry: Build CompanyRegistry Service

## Depends on
None — this is the foundational task.

## Agent
Senior Backend

## Description
Build the `CompanyRegistry` service that acts as the central source of truth for company configurations across all 5 providers. This service replaces direct static imports from `companies.ts` with a dynamic registry supporting in-memory caching, 24h TTL, feature flag fallback, and CRUD operations.

The registry must support both dynamically discovered companies (Greenhouse, Gupy) and manually curated companies (Ashby, Lever, Workday), with metadata per entry (enabled, priority, provider config).

## Technical Details

### Files to create
- `apps/backend/src/modules/providers/config/company-registry.ts` — Main registry service
- `apps/backend/src/modules/providers/config/company-registry.test.ts` — Unit tests

### Files to modify
- `apps/backend/src/config/env.ts` — Add registry-related env vars

### Registry Types & Interfaces

```typescript
// Unified company config type covering all providers
type CompanyConfig = {
  id: string                           // UUID or provider:boardToken composite
  provider: 'greenhouse' | 'ashby' | 'lever' | 'workday' | 'gupy'
  name: string
  enabled: boolean
  priority: number                     // Lower = higher priority for ranking
  createdAt: string                    // ISO date
  updatedAt: string                    // ISO date
  // Provider-specific config (discriminated union)
  config: GreenhouseConfig | AshbyConfig | LeverConfig | WorkdayConfig | GupyConfig
  metadata?: {
    source: 'discovery' | 'admin' | 'static'
    lastSyncedAt?: string
    staleAt?: string
    discoveredCount?: number
  }
}

type GreenhouseConfig = { boardToken: string }
type AshbyConfig = { board: string }
type LeverConfig = { slug: string }
type WorkdayConfig = { subdomain: string; tenant: string; careerSite: string }
type GupyConfig = { careerPageId: number; careerPageName: string }
```

### Registry Service API

```typescript
class CompanyRegistry {
  // Lifecycle
  constructor(options?: { ttlMs?: number; fallbackOnEmpty?: boolean })
  async initialize(): Promise<void>         // Load fallback data from companies.ts

  // Read
  async getAll(provider: ProviderType): Promise<CompanyConfig[]>
  async getById(id: string): Promise<CompanyConfig | undefined>
  async getEnabled(provider: ProviderType): Promise<CompanyConfig[]>
  async count(provider: ProviderType): Promise<number>

  // Write
  async upsert(config: Omit<CompanyConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<CompanyConfig>
  async disable(id: string): Promise<boolean>
  async delete(id: string): Promise<boolean>

  // Bulk operations
  async upsertMany(configs: Omit<CompanyConfig, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<CompanyConfig[]>
  async replaceAll(provider: ProviderType, configs: Omit<CompanyConfig, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<CompanyConfig[]>

  // Cache control
  async refresh(provider?: ProviderType): Promise<void>   // Force refresh from fallback
  invalidateCache(provider?: ProviderType): void
  getCacheStats(): { size: number; hitRate: number; entries: Array<{ provider: string; count: number; age: number }> }
}
```

### Implementation Details

1. **In-memory cache**: Use `Map<ProviderType, CompanyConfig[]>` with TTL tracking per provider
2. **TTL**: Default 24 hours (86400s), configurable via `COMPANY_REGISTRY_TTL_SECONDS` env var
3. **ID generation**: Composite key `{provider}:{identifier}` — e.g., `greenhouse:stripe`, `workday:target`
4. **Fallback**: On `initialize()`, load all static arrays from `companies.ts` with `source: 'static'`
5. **Feature flag check**: If `{PROVIDER}_DYNAMIC_COMPANIES=false` for a provider, return only static fallback data
6. **Thread safety**: Use `ReadWriteLock` or similar for concurrent access during sync operations

### Env vars to add in `env.ts`

```typescript
COMPANY_REGISTRY_TTL_SECONDS: getEnvInt('COMPANY_REGISTRY_TTL_SECONDS', 86400),
GREENHOUSE_DYNAMIC_COMPANIES: getEnv('GREENHOUSE_DYNAMIC_COMPANIES', 'true') === 'true',
GUPY_DYNAMIC_COMPANIES: getEnv('GUPY_DYNAMIC_COMPANIES', 'true') === 'true',
ASHBY_DYNAMIC_COMPANIES: getEnv('ASHBY_DYNAMIC_COMPANIES', 'false') === 'true',
LEVER_DYNAMIC_COMPANIES: getEnv('LEVER_DYNAMIC_COMPANIES', 'false') === 'true',
WORKDAY_DYNAMIC_COMPANIES: getEnv('WORKDAY_DYNAMIC_COMPANIES', 'false') === 'true',
```

## Acceptance Criteria

- [ ] `CompanyRegistry` class implemented with all specified methods
- [ ] In-memory cache with configurable TTL and automatic expiry
- [ ] Fallback to static `companies.ts` when feature flag is off
- [ ] Composite ID generation (`{provider}:{identifier}`)
- [ ] Thread-safe concurrent access (sync operations)
- [ ] All env vars added to `env.ts` with defaults
- [ ] Cache hit/miss stats tracking
- [ ] Existing tests still pass

## Implementation Approach

1. **Design types** — Define `CompanyConfig`, all provider-specific config types, and a `ProviderCompanyConfig` discriminated union in a new file or in `company-registry.ts`
2. **Implement core registry** — Start with the in-memory `Map`-backed store with TTL tracking. Each provider gets its own expiry timestamp.
3. **Implement fallback loading** — On `initialize()`, load all static arrays from `companies.ts` into the registry with `source: 'static'`. Keep a reference to the static data for fallback.
4. **Implement CRUD** — `upsert` generates IDs and timestamps, upserts into the map. `disable` sets `enabled: false`. `delete` removes entirely.
5. **Add cache logic** — Before returning from `getAll`/`getEnabled`, check TTL. If expired, re-check feature flag — if dynamic is off, return fallback; if on, return stale data with a warning (caller decides whether to refresh).
6. **Add env vars** — Add registry TTL and all 5 provider feature flags to `env.ts`
7. **Write unit tests** — Cover: basic CRUD, cache expiry, fallback mode, feature flag toggling, concurrent access, empty state

## Testing

- **Unit tests** (`company-registry.test.ts`):
  - Create registry with test data, verify `getAll` returns expected
  - Test cache TTL expiry (using mock clock or short TTL)
  - Test `disable(id)` marks as disabled
  - Test `upsert` creates new and updates existing
  - Test fallback loading from static data
  - Test feature flag interaction (flag off → fallback)
  - Test thread safety (concurrent upsert + read)
  - Test cache stats accuracy
  - Edge cases: empty provider, unknown provider, disabled company excluded from `getEnabled`

## References

- [Strategic Plan - Registry Design](../index.md) (lines 70-74)
- [Recommendations - Company Registry Service](../recommendations.md) (lines 42-43)
- [Impact Analysis - Files to Create](../impact-analysis.md) (line 15)
- Code: `apps/backend/src/modules/providers/config/companies.ts` — Static company arrays (fallback source)
- Code: `apps/backend/src/config/env.ts` — Add new env vars here
- Code: `apps/backend/src/cache/in-memory-cache.ts` — Existing cache pattern to reference
