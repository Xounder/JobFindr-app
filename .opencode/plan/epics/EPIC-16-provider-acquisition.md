# EPIC 16 — Provider Acquisition (Foundation)

**Layer:** Backend
**Priority:** MVP (phases 1-7), Pós-MVP (phases 8-13)
**Reference:** `.opencode/plan/provider-acquisition/index.md`

## Objective

Replace mocked providers with real implementations based on the
Provider Acquisition Plan. Integrate real job sources: Greenhouse,
Ashby, Lever, Workday, Gupy, and more.

## Deliverables

- Provider interface & engine (EPIC-PA-01)
- Provider classification layer (EPIC-PA-02)
- Greenhouse provider (EPIC-PA-03)
- Ashby provider (EPIC-PA-04)
- Lever provider (EPIC-PA-05)
- Workday provider (EPIC-PA-06)
- Gupy provider (EPIC-PA-07)
- (Pós-MVP) SmartRecruiters, career pages, discovery engine, reliability, optimization, browser automation

## Tasks (MVP)

See individual EPIC-PA files in `.opencode/plan/provider-acquisition/` for
detailed task breakdown.

## Acceptance Criteria

- Real providers return normalized jobs from live APIs
- Mocked providers are replaced with real implementations
- Each provider is independent and non-blocking
- All providers pass trust and ranking pipeline
- Tests cover real provider results (integration) and error handling

---
