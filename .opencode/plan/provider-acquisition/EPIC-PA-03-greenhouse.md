# EPIC-PA-03 — Greenhouse Integration

**Corresponds to:** PROVIDER_ACQUISITION_PLAN Phase 3
**Layer:** Backend
**MVP:** ✅ Yes
**Provider type:** `api` (public API, no auth required)
**API Docs:** https://developers.greenhouse.io/job-board

## Objective

Create the first real provider using Greenhouse's public Job Board API.
Greenhouse is used by thousands of technology companies and has a stable,
well-documented public API with no authentication required.

## Deliverables

- `GreenhouseProvider` implementing `JobProvider` interface
- Company identification (board token discovery)
- Job search with keyword filtering
- Pagination support (Greenhouse uses page-based pagination)
- Job details retrieval
- Result normalization to `NormalizedJob`
- Company list for board discovery

## Tasks

### Provider implementation
- [ ] Create `GreenhouseProvider` class extending `ApiProvider`
- [ ] Implement `search(params)` method
- [ ] Map Greenhouse job fields to `NormalizedJob`
- [ ] Handle Greenhouse-specific error responses
- [ ] Add rate limiting awareness

### API integration
- [ ] Build endpoint: `GET /v1/boards/{board_token}/jobs`
- [ ] Support query params: `content=true`, `page`, `per_page`
- [ ] Parse job listings response
- [ ] Parse job details: description, metadata, department, office
- [ ] Extract skills from job description (use shared skill parser)

### Company board discovery
- [ ] Create maintainable company→board_token mapping
- [ ] Support configuration via file or env
- [ ] Add common tech companies (Stripe, Airbnb, Coinbase, etc.)

### Normalization
- [ ] Map Greenhouse `title` → `NormalizedJob.title`
- [ ] Map `offices` → location
- [ ] Map `departments` → category/area
- [ ] Parse `content` (HTML) → clean description
- [ ] Extract `absolute_url` → apply URL
- [ ] Set `source: "greenhouse"`

## Acceptance Criteria

- [ ] Provider returns normalized jobs for known companies
- [ ] Pagination returns all available jobs (not just page 1)
- [ ] Single company failure does not break the provider
- [ ] Keyword search filters results server-side where possible
- [ ] All returned jobs are valid `NormalizedJob` objects
- [ ] Tests cover: success response, empty response, error response, pagination
- [ ] Provider is registered in `ProviderRegistry` on startup
