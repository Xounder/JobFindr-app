# EPIC-PA-06 — Workday Integration

**Corresponds to:** PROVIDER_ACQUISITION_PLAN Phase 6
**Layer:** Backend
**MVP:** ✅ Yes
**Provider type:** `json` (public JSON endpoint)

## Objective

Support Workday-powered career portals. Workday has massive enterprise
adoption and high vacancy volume, but requires endpoint discovery per
tenant.

## Deliverables

- `WorkdayProvider` implementing `JobProvider`
- Endpoint discovery per company
- Job retrieval via POST to CXS API
- Result normalization

## Tasks

### Provider implementation
- [ ] Create `WorkdayProvider` class extending `JsonProvider`
- [ ] Implement `search(params)` method
- [ ] Map Workday response to `NormalizedJob`
- [ ] Handle Workday-specific pagination

### API integration
- [ ] Build POST request to `/{tenant}/{career_site}/jobs`
- [ ] Set proper headers (Content-Type, Accept)
- [ ] Parse response with nested job data
- [ ] Support pagination via request body params
- [ ] Handle tenant-specific response variations
- [ ] Implement job detail expansion where available

### Endpoint discovery
- [ ] Create URL pattern: `https://{company_subdomain}.wd1.myworkdayjobs.com/wday/cxs/{tenant}/{career_site}/jobs`
- [ ] Support company→tenant mapping configuration

### Normalization
- [ ] Map Workday title field → `NormalizedJob.title`
- [ ] Map location fields → structured location
- [ ] Parse job description (often contains HTML)
- [ ] Extract posting date if available
- [ ] Map job ID
- [ ] Set `source: "workday"`

## Acceptance Criteria

- [ ] Provider returns normalized jobs for known companies
- [ ] At least 3 major companies tested
- [ ] Pagination works across multiple pages
- [ ] Tests cover: success, empty, error, pagination
- [ ] Provider registered in `ProviderRegistry`
