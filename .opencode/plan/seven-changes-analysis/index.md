# Seven Changes Analysis — Comprehensive Planning

**Date:** 2026-06-05
**Requested by:** User
**Status:** Draft

## Objective

Analyze feasibility, risk, impact, and effort for 7 proposed changes to the JobFindr job search aggregator:

1. **Match score job-centric** — Match score should show what fraction of job's required skills the user possesses
2. **Seniority tooltip** — "No Match" badge should have tooltip showing user seniority vs job seniority
3. **Filter seniority for matchmaking** — Use initial-screen Seniority (not modal Seniority) for match scoring
4. **Conditional seniority label** — Label below Seniority selector shows modal Seniority only when different
5. **Skill limit 30 → 100** — Increase user skills and required skills limit from 30 to 100
6. **Job title suggestions** — Search bar suggestions should include job titles
7. **Capitalize seniority in Your Skills** — Capitalize first letter, give more visual prominence

## Scope

All layers analyzed: frontend (`apps/frontend/`), backend (`apps/backend/`), shared types (`packages/types/`), and architecture docs (`.opencode/architecture/`).

## Summary of Findings

| # | Change | Layer(s) | Feasibility | Effort | Risk Level |
|---|--------|----------|-------------|--------|------------|
| 1 | Match score job-centric | Backend, types | ✅ Feasible | Medium | Medium |
| 2 | Seniority tooltip | Frontend, (types) | ✅ Feasible | Small | Low |
| 3 | Filter seniority for matchmaking | Backend | ✅ Feasible | Small | Medium |
| 4 | Conditional seniority label | Frontend | ✅ Feasible | Small | Low |
| 5 | Skill limit 30 → 100 | Backend, frontend | ✅ Feasible | Tiny | Low |
| 6 | Job title suggestions | Backend, frontend, types | ✅ Feasible | Medium | Low |
| 7 | Capitalize seniority prominence | Frontend | ✅ Feasible | Tiny | Low |

**Cross-cutting concern:** Changes 1 and 3 touch the matchmaking pipeline in `aggregation-service.ts`. They should be coordinated to avoid merge conflicts on the same code region.

## Documents

| File | Description |
|------|-------------|
| `feasibility.md` | Technical feasibility and approaches for all 7 changes |
| `impact-analysis.md` | Impact per layer and files affected |
| `risks.md` | Risk assessment and mitigations |
| `recommendations.md` | Implementation recommendations and ordering |
