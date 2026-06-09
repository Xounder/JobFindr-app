# TASK-05-migrate-providers-to-registry: Migrate All Providers to Use CompanyRegistry

## Depends on
- [TASK-01-company-registry](./TASK-01-company-registry.md) — `CompanyRegistry` service must exist
- [TASK-02-greenhouse-discovery](./TASK-02-greenhouse-discovery.md) — Greenhouse provider must support dynamic discovery
- [TASK-03-gupy-discovery](./TASK-03-gupy-discovery.md) — Gupy provider must support search discovery
- [TASK-04-admin-company-api](./TASK-04-admin-company-api.md) — Admin CRUD API must be available for manual management

## Agent
Senior Backend

## Description
Migrate all 5 provider implementations to use the `CompanyRegistry` service instead of directly importing static arrays from `companies.ts`. This is the integration task that ties the registry, discovery, and admin systems together.

Each provider's factory function will receive company configurations from the registry, with a feature-flag-based fallback to the static `companies.ts` when dynamic mode is disabled.

## Technical Details

### Files to modify

**Provider implementations** (modify factory functions):

| File | Change |
|------|--------|
| `apps/backend/src/modules/providers/greenhouse/greenhouse-provider.ts` | Remove `GREENHOUSE_COMPANIES` import; receive via constructor or factory param |
| `apps/backend/src/modules/providers/ashby/ashby-provider.ts` | Remove `ASHBY_COMPANIES` import; receive via constructor or factory param |
| `apps/backend/src/modules/providers/lever/lever-provider.ts` | Remove `LEVER_COMPANIES` import; receive via constructor or factory param |
| `apps/backend/src/modules/providers/workday/workday-provider.ts` | Remove `WORKDAY_COMPANIES` import; receive via constructor or factory param |
| `apps/backend/src/modules/providers/gupy/gupy-provider.ts` | Receive `GupyConfig[]` from registry (already no static import for companies) |
| `apps/backend/src/modules/providers/services/provider-loader.ts` | Inject `CompanyRegistry` into provider factories |
| `apps/backend/src/modules/providers/config/companies.ts` | Deprecate (keep as fallback source) |

### Detailed Changes per Provider

#### 1. Provider Factory Functions

Update each `createXxxProvider()` to accept companies from registry:

```typescript
// Before
export async function createGreenhouseProvider(): Promise<GreenhouseProvider> {
  return new GreenhouseProvider()
}

// After
export async function createGreenhouseProvider(
  companies?: GreenhouseCompany[]
): Promise<GreenhouseProvider> {
  const companyList = companies ?? GREENHOUSE_COMPANIES  // fallback to static
  return new GreenhouseProvider(companyList)
}
```

#### 2. Provider Constructors

Update each provider class to accept company list in constructor:

```typescript
class GreenhouseProvider extends ApiProvider {
  private companies: GreenhouseCompany[]

  constructor(companies: GreenhouseCompany[]) {
    super()
    this.companies = companies
  }

  // Use this.companies instead of importing GREENHOUSE_COMPANIES
}
```

#### 3. Provider Loader

Update `provider-loader.ts` to fetch companies from registry before creating providers:

```typescript
class ProviderLoader {
  constructor(private registry: CompanyRegistry) {}

  async loadAll(): Promise<void> {
    // ... dynamic imports ...

    const greenhouseCompanies = await this.registry.getEnabled('greenhouse')
    const greenhouseProvider = await createGreenhouseProvider(
      greenhouseCompanies.map(c => ({ name: c.name, boardToken: (c.config as GreenhouseConfig).boardToken }))
    )
    // ... register ...
  }
}
```

#### 4. Provider-Specific Integrations

**Greenhouse**: Replace `GREENHOUSE_COMPANIES.find(c => c.boardToken === boardToken)` in `mapJob()` with `this.companies.find(c => c.boardToken === boardToken)`

**Ashby**: Replace `ASHBY_COMPANIES.find(c => c.board === board)` pattern with `this.companies.find(...)`

**Lever**: Replace `LEVER_COMPANIES.find(c => c.slug === slug)` pattern with `this.companies.find(...)`

**Workday**: Replace `WORKDAY_COMPANIES` iteration with `this.companies` iteration in `search()` method

**Gupy**: Add `careerPageId` filtering. When `GUPY_DYNAMIC_COMPANIES=true`, the provider should filter jobs by the discovered `careerPageId` list.

#### 5. companies.ts Deprecation

- Add a `@deprecated` JSDoc comment to each export array and the file header
- Keep all static arrays intact (they serve as fallback when feature flags are off)
- Update `getCompanyDisplayName()` to also query registry (with static fallback)

### Feature Flag Integration

Each provider's factory function must check the relevant feature flag:

```typescript
// In provider-loader.ts
const useDynamic = env.GREENHOUSE_DYNAMIC_COMPANIES
let companies: GreenhouseCompany[]

if (useDynamic) {
  const registryConfigs = await this.registry.getEnabled('greenhouse')
  companies = registryConfigs.map(c => ({
    name: c.name,
    boardToken: (c.config as GreenhouseConfig).boardToken
  }))
}

// If registry returns empty or feature flag is off, fall back to static
if (!companies || companies.length === 0) {
  companies = [...GREENHOUSE_COMPANIES]
}
```

## Acceptance Criteria

- [ ] All 5 providers accept company configs via constructor/factory params instead of direct imports
- [ ] `provider-loader.ts` fetches company lists from `CompanyRegistry` before creating providers
- [ ] Feature flags per provider control whether registry or static fallback is used
- [ ] `companies.ts` is fully deprecated (marked `@deprecated`) but kept as fallback
- [ ] Gupy provider filters jobs by `careerPageId` when dynamic mode is enabled
- [ ] Existing provider tests updated to pass with new constructor signatures
- [ ] All existing tests pass after migration
- [ ] No regression in search results (pre/post migration comparison works)

## Implementation Approach

1. **Define provider company type adapters** — Registry stores `CompanyConfig` but each provider expects its own type (e.g., `GreenhouseCompany` with `name` + `boardToken`). Create adapter/mapping functions.
2. **Update provider constructors** — One provider at a time, update the class to accept company array as constructor parameter
3. **Update factory functions** — Accept optional companies array; fall back to static import if not provided
4. **Update provider-loader** — Create `CompanyRegistry` instance, initialize it (loads fallback), pass to loader, fetch companies per provider, pass to factory
5. **Update Gupy filtering** — Add `careerPageId` filter: skip jobs whose `careerPageId` is not in the registry's enabled list
6. **Mark companies.ts as deprecated** — Add JSDoc deprecation tag, update comments
7. **Run all tests** — Ensure no regressions
8. **Run manual verification** — Start server, hit `/jobs/search`, verify same results as before

## Testing

- **Unit tests** (update existing provider tests):
  - Update `greenhouse-provider.test.ts`: Pass mock company list to constructor, verify it's used
  - Update `ashby-provider.test.ts`: Same pattern
  - Update `lever-provider.test.ts`: Same pattern
  - Update `workday-provider.test.ts`: Same pattern
  - Update `gupy-provider.test.ts`: Verify careerPageId filtering works
  - Test each provider with empty company list → returns empty result (valid state)

- **Integration tests**:
  - Test `provider-loader.ts` with mock registry
  - Test feature flag: flag off → uses static fallback, flag on → uses registry
  - Test Gupy filtering: jobs from unknown careerPageId excluded

## References

- [Strategic Plan - Phase 3](../index.md) (lines 35-38)
- [Recommendations - Migration Path](../recommendations.md) (lines 52-53)
- [Impact Analysis - Data Flow Changes](../impact-analysis.md) (lines 40-53)
- [Impact Analysis - Migration Strategy](../impact-analysis.md) (lines 66-85)
- [Impact Analysis - Rollback Plan](../impact-analysis.md) (lines 88-93)
- Code: `apps/backend/src/modules/providers/greenhouse/greenhouse-provider.ts` — Line 14 imports `GREENHOUSE_COMPANIES`, line 188 uses it
- Code: `apps/backend/src/modules/providers/services/provider-loader.ts` — Full file, factory pattern
- Code: `apps/backend/src/modules/providers/config/companies.ts` — Full file, all static arrays
- Code: `apps/backend/src/modules/providers/config/company-registry.ts` — Created in TASK-01
