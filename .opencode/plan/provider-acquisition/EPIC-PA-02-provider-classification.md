# EPIC-PA-02 — Provider Classification Layer

**Corresponds to:** PROVIDER_ACQUISITION_PLAN Phase 2
**Layer:** Backend
**MVP:** ✅ Yes

## Objective

Create a provider strategy system that categorizes providers by how they
acquire data: API, JSON endpoint, HTML scraping, or browser automation.
Each category shares infrastructure patterns.

## Deliverables

- Provider type enum/union: `api | json | html | browser`
- Base classes or factories per type
- API provider base (HTTP client, auth, pagination)
- JSON provider base (endpoint discovery, response parsing)
- HTML provider base (scraper, parser, DOM extraction)
- Browser provider base (headless browser, wait strategies)

## Tasks

### Type system
- [ ] Define `ProviderType` discriminated union
- [ ] Create `BaseProvider` abstract class with shared logic
- [ ] Create `ApiProvider` abstract class extending `BaseProvider`
- [ ] Create `JsonProvider` abstract class extending `BaseProvider`
- [ ] Create `HtmlProvider` abstract class extending `BaseProvider`
- [ ] Create `BrowserProvider` abstract class extending `BaseProvider`

### API provider base
- [ ] Standard HTTP client with configurable headers
- [ ] Pagination helper (cursor, page-number, offset)
- [ ] Rate limit awareness (respect Retry-After headers)
- [ ] Response validation

### JSON provider base
- [ ] Endpoint discovery patterns
- [ ] JSON path extraction helpers
- [ ] Response normalization from varied formats

### HTML provider base
- [ ] HTML fetching with user-agent rotation
- [ ] DOM parsing helpers (cheerio or equivalent)
- [ ] Common selectors library
- [ ] Text cleaning utilities

## Acceptance Criteria

- [ ] Each provider type has a clear abstract base
- [ ] Adding a provider of an existing type requires minimal code
- [ ] Type-specific infrastructure (pagination, parsing) is reusable
- [ ] Tests cover base classes
