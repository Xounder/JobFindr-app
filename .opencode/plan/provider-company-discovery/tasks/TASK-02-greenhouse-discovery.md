# TASK-02-greenhouse-discovery: Implement Greenhouse Dynamic Company Discovery

## Depends on
- [TASK-01-company-registry](./TASK-01-company-registry.md) — requires `CompanyRegistry` for storing discovered companies

## Agent
Senior Backend

## Description
Implement dynamic company discovery for the Greenhouse provider by fetching all boards from the public `GET /v1/boards` endpoint, mapping results to the `CompanyRegistry` format, and scheduling daily sync via `node-cron`.

Currently Greenhouse has 13 hardcoded companies. After this task, the system should discover 100+ companies automatically and store them in the registry with `source: 'discovery'`.

## Technical Details

### Files to create
- `apps/backend/src/modules/providers/services/company-discovery.ts` — Provider-specific discovery logic (add Greenhouse section)
- `apps/backend/src/modules/providers/services/company-sync.ts` — Scheduled sync orchestration
- `apps/backend/src/modules/providers/services/company-discovery.test.ts` — Discovery unit tests
- `apps/backend/src/modules/providers/services/company-sync.test.ts` — Sync job unit tests

### Files to modify
- `apps/backend/src/config/env.ts` — Add discovery sync interval, Greenhouse-specific discovery config
- `apps/backend/package.json` — Add `node-cron` dependency

### Greenhouse API Details

**Endpoint**: `GET https://boards-api.greenhouse.io/v1/boards`

**Response shape** (observed in the wild):
```json
{
  "boards": [
    {
      "name": "Stripe",
      "board_token": "stripe"
    },
    ...
  ],
  "meta": {
    "page": 1,
    "per_page": 50,
    "total": 120
  }
}
```

**Pagination**: Page-based (`?page=N`), likely generous limits.

### Implementation: Discovery Logic

1. **Fetch all boards**: Paginated fetch of `GET /v1/boards` up to configurable max pages
2. **Validate**: Each board must have a non-empty `board_token` and `name`
3. **Map to `CompanyConfig`**: Convert each board to registry-compatible format:
   ```typescript
   {
     provider: 'greenhouse',
     name: board.name,
     config: { boardToken: board.board_token },
     metadata: { source: 'discovery', lastSyncedAt: new Date().toISOString() }
   }
   ```
4. **Store in registry**: Call `companyRegistry.replaceAll('greenhouse', discoveredConfigs)`
5. **Count validation**: Log warning if discovered count < 10 (possible API issue)

### Implementation: Sync Scheduler

1. Use `node-cron` for scheduled job execution
2. Greenhouse sync interval: daily at configurable hour (default: 03:00 UTC)
3. Implement `CompanySync` class:
   ```typescript
   class CompanySync {
     constructor(private registry: CompanyRegistry)
     async startAll(): Promise<void>     // Start all provider sync jobs
     async stopAll(): Promise<void>       // Stop all sync jobs
     async syncProvider(provider: ProviderType): Promise<SyncResult>
     getStatus(): SyncStatus[]
     isRunning(provider: ProviderType): boolean
   }

   type SyncResult = {
     provider: string
     success: boolean
     discoveredCount: number
     errors: string[]
     durationMs: number
   }
   ```
4. Each sync job:
   - Checks feature flag (skip if disabled)
   - Calls discovery logic
   - Replaces registry entries for that provider
   - Records metrics (duration, count, errors)

### Rate Limiting

- Respect `Retry-After` headers if present (already handled in `ApiProvider`)
- Add configurable delay between pages: `GREENHOUSE_DISCOVERY_PAGE_DELAY_MS` (default: 200ms)
- Max pages: `GREENHOUSE_DISCOVERY_MAX_PAGES` (default: 10)

### Env vars to add

```typescript
GREENHOUSE_DISCOVERY_INTERVAL: getEnv('GREENHOUSE_DISCOVERY_INTERVAL', '0 3 * * *'),  // cron: daily 3am
GREENHOUSE_DISCOVERY_MAX_PAGES: getEnvInt('GREENHOUSE_DISCOVERY_MAX_PAGES', 10),
GREENHOUSE_DISCOVERY_PAGE_DELAY_MS: getEnvInt('GREENHOUSE_DISCOVERY_PAGE_DELAY_MS', 200),
```

## Acceptance Criteria

- [ ] Greenhouse boards API fetch working with pagination
- [ ] Discovered boards mapped to `CompanyConfig` format
- [ ] Discovered companies stored in `CompanyRegistry` via `replaceAll`
- [ ] Scheduled daily sync via `node-cron`
- [ ] Feature flag `GREENHOUSE_DYNAMIC_COMPANIES` respected (off → no discovery)
- [ ] Sync status tracking (last run, success/failure, count)
- [ ] Rate limiting with configurable page delay
- [ ] Existing Greenhouse provider tests still pass (provider loads from registry or fallback)

## Implementation Approach

1. **Add dependency** — Install `node-cron` in `apps/backend/package.json`
2. **Implement `CompanyDiscovery.greenhouse()`** — Static method or dedicated class method that fetches paginated boards, validates, maps, and returns `CompanyConfig[]`
3. **Implement `CompanySync` class** — Manages cron jobs per provider, orchestrates discovery → registry store cycle
4. **Discovery logic** — Fetch page 1, parse meta.total and meta.page, iterate remaining pages with configurable delay
5. **Error handling** — If fetch fails (network, 5xx), log error, retry once after 5s, then mark sync as failed. Do not clear existing registry entries on failure.
6. **Integration with registry** — After successful discovery, call `companyRegistry.replaceAll('greenhouse', configs)` which atomically replaces all greenhouse entries
7. **Write tests** — Mock HTTP responses, verify mapping, pagination, error handling

## Testing

- **Unit tests** (`company-discovery.test.ts`):
  - Mock Greenhouse boards API response with 3 boards
  - Verify correct `CompanyConfig` mapping (name, boardToken)
  - Test pagination: mock multi-page response, verify all pages fetched
  - Test error handling: API returns 500 → returns empty array, no throw
  - Test empty response handling
  - Test invalid board (missing board_token) is filtered out

- **Unit tests** (`company-sync.test.ts`):
  - Mock `CompanyDiscovery.greenhouse()` and `CompanyRegistry.replaceAll()`
  - Verify sync calls discovery → registry.replaceAll
  - Verify feature flag check (disabled = skip)
  - Verify timing and error recording
  - Test cron scheduling (mock cron, verify callback registered)

## References

- [Strategic Plan - Phase 1](../index.md) (lines 21-26)
- [Recommendations - Greenhouse Full Dynamic Discovery](../recommendations.md) (lines 10-13)
- [Feasibility Analysis - Provider API Feasibility](../feasibility.md) (lines 15-21)
- [Impact Analysis - Files to Create](../impact-analysis.md) (lines 13-19)
- Code: `apps/backend/src/modules/providers/greenhouse/greenhouse-provider.ts` — Current provider implementation (uses static companies)
- Code: `apps/backend/src/modules/providers/domain/api-provider.ts` — Parent class with HTTP client and Retry-After handling
- Code: `apps/backend/src/config/env.ts` — Add env vars here
