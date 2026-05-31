# EPIC-PA-07 — Gupy Integration

**Corresponds to:** PROVIDER_ACQUISITION_PLAN Phase 7
**Layer:** Backend
**MVP:** ✅ Yes
**Provider type:** `json` (public JSON endpoint)

## Objective

Support Brazilian companies using Gupy. Gupy is extremely common in
Brazil and relevant for the local job market.

## Deliverables

- `GupyProvider` implementing `JobProvider`
- Job retrieval from Gupy public endpoints
- Trust metadata integration
- Company extraction
- Result normalization

## Tasks

### Provider implementation
- [ ] Create `GupyProvider` class extending `JsonProvider`
- [ ] Implement `search(params)` method
- [ ] Map Gupy response to `NormalizedJob`
- [ ] Handle Gupy-specific API structure

### API integration
- [ ] Research Gupy public job endpoint pattern
- [ ] Parse job listings response
- [ ] Handle Gupy pagination
- [ ] Extract company data

### Trust integration
- [ ] Add company trust evaluation for Gupy listings
- [ ] Flag low-quality listings based on description patterns
- [ ] Integrate with trust engine for scoring

### Normalization
- [ ] Map Gupy title → `NormalizedJob.title`
- [ ] Map location → structured location (cidade/estado)
- [ ] Parse description (HTML removal)
- [ ] Extract salary if available
- [ ] Map company name
- [ ] Set `source: "gupy"`

## Acceptance Criteria

- [ ] Provider returns normalized jobs for known companies
- [ ] Trust filtering is applied
- [ ] Tests cover: success, empty, error, trust integration
- [ ] Provider registered in `ProviderRegistry`
