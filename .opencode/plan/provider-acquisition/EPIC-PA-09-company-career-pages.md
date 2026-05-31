# EPIC-PA-09 — Company Career Pages

**Corresponds to:** PROVIDER_ACQUISITION_PLAN Phase 9
**Layer:** Backend
**MVP:** ❌ No (pós-MVP)

## Objective

Support direct company career portals via HTML scraping for companies
outside major ATS ecosystems.

## Deliverables

- `CareerPageProvider` using HTML scraping
- Common career page selectors library
- Result normalization

## Tasks

- [ ] Create HTML scraping base infrastructure
- [ ] Implement common selectors for popular CMS patterns
- [ ] Create configurable scraping rules per company
- [ ] Map extracted data to `NormalizedJob`
- [ ] Implement error handling for page structure changes

## Acceptance Criteria

- [ ] At least 3 company career pages supported
- [ ] Graceful handling of structural changes
