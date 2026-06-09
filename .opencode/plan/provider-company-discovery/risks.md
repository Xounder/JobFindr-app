# Risks — Provider Company Discovery

## Risk Matrix

| ID | Risk | Provider(s) | Likelihood | Impact | Mitigation |
|----|------|-------------|------------|--------|------------|
| R01 | Greenhouse `/v1/boards` requires authentication or is deprecated | Greenhouse | Low | High | Test early with current implementation; maintain curated fallback list |
| R02 | Lever API blocks unauthenticated `/v0/postings` listing | Lever | Medium | High | Test immediately; have curated+admin fallback ready |
| R03 | Gupy search discovery too slow (too many API calls) | Gupy | Medium | Medium | Implement incremental discovery with caching; parallel searches with rate limiting |
| R04 | Rate limits during initial bulk discovery | All | High | Medium | Exponential backoff; respect `Retry-After`; stagger discovery over hours |
| R05 | Discovered company data becomes stale (companies remove boards) | Greenhouse, Ashby, Lever | Medium | Low | Daily/weekly refresh jobs; mark stale entries; admin override |
| R06 | Workday company config errors (wrong subdomain/tenant/careerSite) | Workday | Medium | High | Validation endpoint in admin API; test connection before save |
| R07 | Duplicate companies across providers (same company on Greenhouse + Lever) | All | Medium | Low | Deduplication by normalized company name; cross-provider registry |
| R08 | API schema changes break discovery parsing | All | Low | Medium | Version-tolerant parsing; integration tests against real APIs |
| R09 | Memory/performance issues caching 500+ companies | All | Low | Low | Pagination in admin UI; lazy loading; efficient data structures |
| R10 | Migration from hardcoded breaks existing functionality | All | Low | High | Feature flag per provider; gradual rollout; comprehensive tests |
| R11 | Admin API security - unauthorized company modifications | All | Low | High | Auth/authorization on admin endpoints; audit logging |
| R12 | Gupy careerPageId collisions or changes | Gupy | Low | Medium | Use careerPageId as primary key; handle changes gracefully |

## High-Priority Risks (Likelihood × Impact ≥ Medium)

### R01: Greenhouse boards endpoint authentication
- **Test**: Call `GET https://boards-api.greenhouse.io/v1/boards` immediately
- **Fallback**: Curated list with admin management (same as Ashby)

### R02: Lever unauthenticated listing
- **Test**: Call `GET https://api.lever.co/v0/postings` without company param
- **Decision gate**: If fails → curated+admin; if succeeds → dynamic discovery

### R04: Rate limits during discovery
- **Greenhouse**: 50+ boards × 3 pages = 150+ calls
- **Gupy**: 50+ search iterations = 50+ calls
- **Mitigation**: Implement in `company-sync.ts` with configurable concurrency and delays

### R10: Migration risk
- **Strategy**: Feature flag `USE_DYNAMIC_COMPANIES` per provider
- **Rollout**: Greenhouse first (lowest risk), then Gupy, then others
- **Validation**: Parallel run - compare results from hardcoded vs dynamic

## Risk Acceptance

| Risk | Acceptance Criteria |
|------|---------------------|
| R03 | Gupy discovery completes in <5 min with <100 API calls |
| R05 | Stale detection accuracy >90% (manual verification) |
| R07 | Cross-provider deduplication reduces duplicates by >80% |
| R11 | Admin API requires valid JWT with `admin:companies` scope |