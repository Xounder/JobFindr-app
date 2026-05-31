# EPIC-PA-05 — Lever Integration

**Corresponds to:** PROVIDER_ACQUISITION_PLAN Phase 5
**Layer:** Backend
**MVP:** ✅ Yes
**Provider type:** `api` (public API, no auth required)
**API Docs:** https://github.com/lever/postings-api

## Objective

Add support for Lever-hosted companies. Lever has large adoption in the
technology ecosystem and provides a public API.

## Deliverables

- `LeverProvider` implementing `JobProvider`
- Company identification
- Job retrieval with pagination
- Result normalization

## Tasks

### Provider implementation
- [ ] Create `LeverProvider` class extending `ApiProvider`
- [ ] Implement `search(params)` method
- [ ] Map Lever job fields to `NormalizedJob`
- [ ] Handle Lever-specific response format

### API integration
- [ ] Build endpoint: `GET https://api.lever.co/v0/postings/{company}`
- [ ] Support `mode=json` or default JSON response
- [ ] Parse job listings
- [ ] Parse job details: description, categories, metadata

### Company discovery
- [ ] Create company mapping
- [ ] Add known Lever customers (Netflix, etc.)

### Normalization
- [ ] Map Lever `title` → `NormalizedJob.title`
- [ ] Map `categories.location` → location
- [ ] Map `categories.team` → department
- [ ] Parse `description` (HTML) → clean text
- [ ] Map `applyUrl` → apply URL
- [ ] Set `source: "lever"`
- [ ] Extract `publishedAt` → date

## Acceptance Criteria

- [ ] Provider returns normalized jobs for known companies
- [ ] Categories (location, team, commitment) are extracted
- [ ] Tests cover: success, empty, error
- [ ] Provider registered in `ProviderRegistry`
