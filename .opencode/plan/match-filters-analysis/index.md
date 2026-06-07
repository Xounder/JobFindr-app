# Match & Filters Analysis — 5 Changes

**Date:** 2026-06-06
**Requested by:** User
**Status:** Draft

## Objective

Analyze planning, feasibility, risks, and technical approach for 5 changes to the JobFindr application:

1. **Match Score Calculation Refinement** — Add work type factor (remote/hybrid/on-site) to match scoring with 100% clamp when all conditions are perfect
2. **"Your Skills" Filter Clickable** — Make the "Your Skills" section in the homepage filter panel clickable, opening the same modal as the header button
3. **Seniority Label with Sync** — Make the seniority difference label clickable, syncing the filter seniority to the user's seniority
4. **Required Skills Filter Exclusivity** — When skills are selected in Required Skills, only return jobs containing ALL those skills
5. **Companies Filters Reflecting Actual Results** — Show actual companies from search results in the Include/Exclude Companies suggestions

## Scope

| Layer | Impact |
|-------|--------|
| Backend | Changes 1, 4 — matchmaking scoring + filtering logic |
| Frontend | Changes 2, 3, 5 — modal state management, UI interactivity, data flow |
| Types (shared) | Change 1 — potential new match breakdown field |
| API | Change 5 — potential new field in search response |

## Summary of Findings

| Change | Effort | Feasibility | Risk Level |
|--------|--------|-------------|------------|
| 1. Match score refinement | Medium | High — clear algorithm, well-understood domain | Medium |
| 2. "Your Skills" clickable | Small | High — standard React pattern | Low |
| 3. Seniority label sync | Trivial | High — minor UI change | Low |
| 4. Required Skills exclusivity | Small | High — simple filter addition | Medium |
| 5. Companies from results | Small | High — data already available | Low |

**Overall assessment**: Feasible. All changes are well-understood with established patterns in the codebase. The 5 changes are largely independent, allowing parallel implementation.

## Recommended Approaches

| Change | Approach |
|--------|----------|
| 1 | Option A — Add `workTypeWeight` to match weights with 100% clamp condition |
| 2 | Option A — React Context for modal state (`SkillsModalContext`) |
| 3 | Single approach — Make label a `<button>` syncing filter seniority |
| 4 | Option A — Add required skills filter step in `aggregation-service.ts` |
| 5 | Option A — Extract companies from `data.jobs` in HomePage, pass as suggestions |

## Documents

| File | Description |
|------|-------------|
| `feasibility.md` | Technical feasibility and approaches for each change |
| `impact-analysis.md` | Impact per layer, files changed, breaking changes |
| `risks.md` | Risk assessment, regression points, mitigations |
