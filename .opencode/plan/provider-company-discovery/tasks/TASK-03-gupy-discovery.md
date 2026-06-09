# TASK-03-gupy-discovery: Implement Gupy Search-Based Company Discovery

## Depends on
- [TASK-01-company-registry](./TASK-01-company-registry.md) — requires `CompanyRegistry` for storing discovered companies

## Agent
Senior Backend

## Description
Implement search-based company discovery for the Gupy provider. Gupy's API does not have a company listing endpoint, so we must discover companies iteratively by searching with common terms and deduplicating results by `careerPageId`.

Currently Gupy has 0 explicitly configured companies (it fetches jobs from a single endpoint with no company filtering). After this task, the system should discover 50+ companies with their `careerPageId` and `careerPageName`, enabling per-company job filtering.

## Technical Details

### Files to create
- `apps/backend/src/modules/providers/services/company-discovery.ts` — Add Gupy discovery section (same file as TASK-02)
- `apps/backend/src/modules/providers/services/company-discovery.test.ts` — Add Gupy tests

### Files to modify
- `apps/backend/src/config/env.ts` — Add Gupy discovery specific env vars
- `apps/backend/src/modules/providers/gupy/gupy-provider.ts` — Update to use `careerPageId` from registry for filtering (post TASK-05)

### Gupy API Details

**Endpoint**: `GET https://portal.api.gupy.io/api/v1/jobs`

**Query params**: `?search=<term>&limit=50&offset=0`

**Response fields** (job object):
```json
{
  "id": 123,
  "name": "Software Engineer",
  "careerPageName": "Nubank",
  "careerPageId": 456,
  "publishedDate": "2024-01-15T10:00:00.000Z",
  "city": "São Paulo",
  "state": "SP",
  "modality": "remoto"
}
```

### Discovery Algorithm

1. **Search terms array**: Start with broad/common terms in English and Portuguese:
   ```
   ["engineer", "developer", "analyst", "manager", "designer",
    "marketing", "sales", "support", "finance", "operations",
    "software", "data", "product", "estágio", "júnior",
    "pleno", "sênior", "analista", "desenvolvedor"]
   ```
   Terms should be configurable via env var or config array.

2. **Iterative search**: For each term:
   - Send `GET /api/v1/jobs?search={term}&limit=50`
   - Extract all unique `(careerPageId, careerPageName)` pairs from results
   - Add to deduplication set
   - Configurable delay between requests (default: 500ms)

3. **Parallel execution**: Run 3 search requests concurrently (configurable via `GUPY_DISCOVERY_CONCURRENCY`)

4. **Deduplication**: Use `Map<careerPageId, careerPageName>` to eliminate duplicates

5. **Minimum threshold**: Require a minimum of 3 job postings from a careerPage to include it (filter out companies with only 1-2 sporadic postings)

### Implementation Steps

1. **Add Gupy discovery method** to `CompanyDiscovery` class:
   ```typescript
   class CompanyDiscovery {
     static async gupy(): Promise<CompanyConfig[]> {
       // 1. Load search terms
       // 2. Execute parallel searches with rate limiting
       // 3. Deduplicate results
       // 4. Filter by minimum job count threshold
       // 5. Map to CompanyConfig format
       // 6. Return configs
     }
   }
   ```

2. **Search executor**: Create a helper that manages concurrency:
   ```typescript
   async function executeGupySearches(
     terms: string[],
     options: { concurrency: number; delayMs: number; minJobsThreshold: number }
   ): Promise<Map<number, { name: string; jobCount: number }>>
   ```

3. **Mapping to CompanyConfig**:
   ```typescript
   {
     provider: 'gupy',
     name: careerPageName,
     config: { careerPageId, careerPageName },
     metadata: { source: 'discovery', lastSyncedAt: new Date().toISOString() }
   }
   ```

4. **Store in registry**: Call `companyRegistry.replaceAll('gupy', discoveredConfigs)`

### Env vars to add

```typescript
GUPY_DISCOVERY_INTERVAL: getEnv('GUPY_DISCOVERY_INTERVAL', '0 5 * * 0'),  // cron: weekly Sunday 5am
GUPY_DISCOVERY_CONCURRENCY: getEnvInt('GUPY_DISCOVERY_CONCURRENCY', 3),
GUPY_DISCOVERY_DELAY_MS: getEnvInt('GUPY_DISCOVERY_DELAY_MS', 500),
GUPY_DISCOVERY_MIN_JOBS: getEnvInt('GUPY_DISCOVERY_MIN_JOBS', 3),
GUPY_DISCOVERY_SEARCH_TERMS: getEnv('GUPY_DISCOVERY_SEARCH_TERMS',
  'engineer,developer,analyst,manager,designer,marketing,sales,support,finance,operations'),
```

## Acceptance Criteria

- [ ] Search-based discovery discovers 50+ unique careerPageIds
- [ ] Deduplication by `careerPageId` works correctly
- [ ] Parallel execution with configurable concurrency
- [ ] Configurable delay between requests (rate limiting)
- [ ] Minimum job count threshold filter works
- [ ] Discovered companies stored in `CompanyRegistry` via `replaceAll`
- [ ] Weekly sync scheduled via `node-cron`
- [ ] Feature flag `GUPY_DYNAMIC_COMPANIES` respected
- [ ] No duplicate companies in registry after multiple syncs

## Implementation Approach

1. **Search term configuration** — Define default terms in a config array; allow override via env var (comma-separated)
2. **Rate-limited executor** — Use a simple semaphore pattern to limit concurrency. After each batch, apply delay.
3. **Dedup logic** — Use `Map<number, { name: string; count: number }>`. After all searches complete, filter by `count >= minJobs`.
4. **Error resilience** — Individual request failures should not stop the whole discovery. Log error and continue with next term.
5. **Sync scheduling** — Add Gupy to `CompanySync` alongside Greenhouse (from TASK-02). Weekly schedule to avoid excessive API calls.
6. **Integration testing** — Run a quick smoke test against the real Gupy API with 3-5 terms to validate the algorithm works.

## Testing

- **Unit tests**:
  - Mock Gupy API response with mixed companies, verify dedup filter works
  - Test minimum job threshold (companies with < 3 jobs excluded)
  - Test error handling: one request fails, others continue
  - Test concurrent execution: 3 parallel requests, verify order
  - Test empty search results handling
  - Test `Map<careerPageId, name>` deduplication across multiple search terms
  - Edge case: all searches return empty → empty result
  - Edge case: only one company found → still returned

## References

- [Strategic Plan - Phase 2](../index.md) (lines 28-32)
- [Recommendations - Gupy Search-Based Discovery](../recommendations.md) (lines 35-38)
- [Feasibility Analysis - Provider API Feasibility](../feasibility.md) (lines 15-22)
- Code: `apps/backend/src/modules/providers/gupy/gupy-provider.ts` — Current Gupy provider implementation
- Code: `apps/backend/src/modules/providers/services/company-discovery.ts` — Created in TASK-02, add Gupy section here
- Code: `apps/backend/src/modules/providers/services/company-sync.ts` — Created in TASK-02, add Gupy sync job here
