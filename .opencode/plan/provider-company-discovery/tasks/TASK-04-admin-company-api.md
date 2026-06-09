# TASK-04-admin-company-api: Build Admin CRUD API for Company Management

## Depends on
- [TASK-01-company-registry](./TASK-01-company-registry.md) — requires `CompanyRegistry` for data storage

## Agent
Senior Backend

## Description
Build the admin API endpoints for managing company configurations across all 5 providers. This enables operators to add, update, disable, and delete company entries for curated providers (Ashby, Lever, Workday) and manually correct dynamic discovery results.

The API also includes a test-connection endpoint for Workday (which requires complex per-tenant configuration) and a sync trigger endpoint.

## Technical Details

### Files to create
- `apps/backend/src/modules/providers/routes/admin-companies.ts` — Fastify route handler
- `apps/backend/src/modules/providers/routes/admin-companies.test.ts` — Route unit/integration tests
- `apps/backend/src/modules/providers/services/admin-validation.ts` — Validation helpers (Workday connection test)

### Files to modify
- `apps/backend/src/app.ts` — Register admin routes
- `apps/backend/src/config/env.ts` — Add admin-specific config if needed

### Endpoints

#### `GET /admin/companies`
List all companies, optionally filtered by provider.

**Query params**: `?provider=greenhouse&enabled=true&source=discovery&page=1&pageSize=50`

**Response**:
```json
{
  "companies": [ /* CompanyConfig[] */ ],
  "total": 200,
  "page": 1,
  "pageSize": 50,
  "providers": {
    "greenhouse": { "total": 100, "discovered": 95, "manual": 5 },
    "ashby": { "total": 50, "discovered": 0, "manual": 50 }
  }
}
```

#### `POST /admin/companies`
Create a new company configuration.

**Request body**:
```json
{
  "provider": "ashby",
  "name": "NewCompany",
  "config": { "board": "newcompany" },
  "priority": 10
}
```

**Validation**: Provider-specific config validation. For Workday, test connection before saving (see below).

**Response**: Created `CompanyConfig` with generated `id`, `createdAt`, `updatedAt`.

#### `PUT /admin/companies/:id`
Update an existing company configuration.

**Request body**: Partial update (only provided fields changed).

**Validation**: Same as POST. If config changed for Workday, re-test connection.

**Response**: Updated `CompanyConfig`.

#### `DELETE /admin/companies/:id`
Disable (soft-delete) a company — sets `enabled: false`.

**Response**: `{ success: true }`

#### `POST /admin/companies/sync`
Trigger an immediate sync for a specific provider.

**Request body**: `{ "provider": "greenhouse" }`

**Response**: `{ "jobId": "sync-xxx", "status": "started", "provider": "greenhouse" }`

#### `GET /admin/companies/status`
Get sync status for all providers.

**Response**:
```json
{
  "syncs": [
    {
      "provider": "greenhouse",
      "lastRunAt": "2026-06-07T03:00:00Z",
      "lastDurationMs": 4500,
      "lastCount": 105,
      "status": "success",
      "nextRunAt": "2026-06-08T03:00:00Z"
    }
  ]
}
```

### Workday Connection Validation

Before saving a Workday company config, test the connection:

1. Send `POST https://{subdomain}.wd1.myworkdayjobs.com/wday/cxs/{tenant}/{careerSite}/jobs` with `{ limit: 1, offset: 0 }`
2. Accept any 2xx response as valid
3. Return error details on failure (timeout, 4xx, 5xx, DNS failure)

```typescript
async function testWorkdayConnection(config: WorkdayConfig): Promise<{ success: boolean; error?: string; latencyMs?: number }>
```

### Auth & Authorization

- Use existing JWT authentication (already set up in the app)
- Require `admin:companies` scope on valid JWT
- Return 401 for missing/invalid token, 403 for missing scope
- Add auth middleware to all admin routes

### Implementation Approach

1. **Route registration pattern** — Follow existing pattern from `provider-status-route.ts`:
   ```typescript
   export function registerAdminCompanyRoutes(app: FastifyInstance, registry: CompanyRegistry): void {
     // Register all admin endpoints
   }
   ```
2. **Validation** — Use Zod schemas per endpoint (matching existing patterns)
3. **Summary counts** — `GET /admin/companies` should return per-provider summary statistics (total, discovered count, manual count)
4. **Sync trigger** — The sync endpoint calls `CompanySync.syncProvider(provider)` from TASK-02/TASK-03 (async, returns immediately with job ID)
5. **Workday test** — Create helper that makes a real HTTP request to the Workday jobs API with limit=1

### Providers summary endpoint

The `GET /admin/companies` provider summary block needs to:
- Group all companies by provider
- Count by source type (discovery vs admin vs static)
- Return alongside paginated company results

## Acceptance Criteria

- [ ] All 6 endpoints implemented (list, create, update, delete, sync, status)
- [ ] Pagination, filtering by provider/enabled/source on list endpoint
- [ ] Provider-specific config validation on create/update
- [ ] Workday connection test endpoint validates config before save
- [ ] JWT auth + `admin:companies` scope enforced on all endpoints
- [ ] Sync trigger returns immediately with job ID
- [ ] Sync status tracking accessible via status endpoint
- [ ] Soft-delete via `DELETE` (sets `enabled: false`)
- [ ] Request/response validation via Zod schemas
- [ ] Comprehensive unit + integration tests

## Testing

- **Unit tests** (`admin-companies.test.ts`):
  - Test all CRUD endpoints with mock registry
  - Test auth middleware (no token → 401, wrong scope → 403)
  - Test validation errors (missing fields, invalid config)
  - Test Workday connection test helper (mock HTTP)
  - Test pagination and filtering
  - Test sync trigger (verify it calls CompanySync)
  - Test soft-delete (verify `enabled: false`)
  - Edge case: update non-existent company → 404
  - Edge case: create duplicate company → 409

- **Integration tests**:
  - Full CRUD flow against test Fastify instance
  - Auth integration (generate JWT, call endpoints)

## References

- [Strategic Plan - Phase 3](../index.md) (lines 35-39)
- [Strategic Plan - Admin API decisions](../index.md) (lines 81-85)
- [Recommendations - Admin API](../recommendations.md) (lines 49-50)
- [Impact Analysis - Files to Create](../impact-analysis.md) (line 18)
- [Risks - R06 Workday config errors](../risks.md) (lines 22-25)
- Code: `apps/backend/src/modules/providers/services/provider-status-route.ts` — Existing route pattern to follow
- Code: `apps/backend/src/config/env.ts` — Add env vars here
- Code: `apps/backend/src/modules/providers/services/company-sync.ts` — Created in TASK-02/TASK-03 for sync trigger
- Code: `apps/backend/src/modules/providers/config/company-registry.ts` — Created in TASK-01 for data operations
