# EPIC-PA-04 — Ashby Integration

**Corresponds to:** PROVIDER_ACQUISITION_PLAN Phase 4
**Layer:** Backend
**MVP:** ✅ Yes
**Provider type:** `api` (public API, no auth required)
**API Docs:** https://developers.ashbyhq.com/reference/public-job-posting-api

## Objective

Add support for Ashby-hosted companies. Ashby has growing adoption among
tech companies and offers a modern API with compensation data.

## Deliverables

- `AshbyProvider` implementing `JobProvider`
- Company identification (job board name)
- Job retrieval with pagination
- Compensation extraction
- Result normalization

## Tasks

### Provider implementation
- [ ] Create `AshbyProvider` class extending `ApiProvider`
- [ ] Implement `search(params)` method
- [ ] Map Ashby job fields to `NormalizedJob`
- [ ] Handle Ashby-specific response format

### API integration
- [ ] Build endpoint: `GET https://api.ashbyhq.com/posting-api/job-board/{board}`
- [ ] Support `includeCompensation=true` param
- [ ] Parse job list response
- [ ] Parse individual job details
- [ ] Extract compensation range (min/max/currency/period)

### Company discovery
- [ ] Create company→board_name mapping
- [ ] Add known Ashby customers (Notion, etc.)

### Normalization
- [ ] Map Ashby fields to `NormalizedJob`
- [ ] Handle compensation object → salary fields
- [ ] Parse HTML descriptions
- [ ] Set `source: "ashby"`
- [ ] Extract location info

## Acceptance Criteria

- [ ] Provider returns normalized jobs for known companies
- [ ] Compensation data is preserved when available
- [ ] Pagination works correctly
- [ ] Tests cover: success, empty, error, compensation parsing
- [ ] Provider registered in `ProviderRegistry`
