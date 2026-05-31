# EPIC-PA-08 — SmartRecruiters Integration

**Corresponds to:** PROVIDER_ACQUISITION_PLAN Phase 8
**Layer:** Backend
**MVP:** ❌ No (pós-MVP)

## Objective

Expand international coverage with SmartRecruiters integration.

## Deliverables

- `SmartRecruitersProvider` implementing `JobProvider`
- Job retrieval
- Result normalization

## Tasks

- [ ] Research SmartRecruiters API access requirements
- [ ] Implement provider if public endpoint available
- [ ] Map response to `NormalizedJob`
- [ ] Register in `ProviderRegistry`

## Acceptance Criteria

- [ ] Provider returns jobs if API permits
- [ ] Non-blocking if auth required
