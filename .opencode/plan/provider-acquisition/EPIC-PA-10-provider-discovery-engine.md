# EPIC-PA-10 — Provider Discovery Engine

**Corresponds to:** PROVIDER_ACQUISITION_PLAN Phase 10
**Layer:** Backend
**MVP:** ❌ No (pós-MVP)

## Objective

Automatically identify which ATS powers a company's careers page and
select the appropriate provider.

## Deliverables

- ATS detector (URL patterns, HTML signatures, meta tags)
- Automatic provider selection
- Company→ATS mapping maintenance

## Tasks

- [ ] Create ATS signature database (URL patterns, DOM markers)
- [ ] Implement detection pipeline
- [ ] Create automatic provider router
- [ ] Handle unknown ATS gracefully (fallback)
- [ ] Expose detection confidence score

## Acceptance Criteria

- [ ] Detects Greenhouse, Ashby, Lever, Workday, Gupy automatically
- [ ] Unknown ATS triggers graceful fallback
- [ ] Detection is fast (< 2s per company)
