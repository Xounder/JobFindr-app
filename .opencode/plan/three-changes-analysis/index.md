# Three Changes Analysis — Comprehensive Planning

**Date:** 2026-05-30
**Requested by:** User
**Status:** Draft

## Objective

Analyze feasibility, risk, impact, and effort for 3 proposed changes to the JobFindr job search aggregator:

1. **User Skills Tab in Filters Panel** — Add a separate user skills input that auto-suggests, auto-populates Required Skills, and feeds into matchmaking with seniority
2. **Fix Trust Score Display Issue** — "Low Trust" shown for scores like 7.8 and 8.4; investigate and fix the scale mismatch
3. **Trust Score Level Redefinition + Separation from Ranking Score** — New 6-level trust classification, 6.0 minimum threshold, trust-driven ranking boosts, clear separation of trust from ranking

## Scope

All layers analyzed: frontend (`apps/frontend/`), backend (`apps/backend/`), shared types (`packages/types/`), shared utils (`packages/utils/`), and architecture docs (`.opencode/architecture/`).

## Summary of Findings

| Change | Feasibility | Effort | Risk Level | Critical Issues |
|--------|-------------|--------|------------|-----------------|
| 1 — User Skills Tab | ✅ Feasible | Medium | Medium | Must NOT violate "frontend has zero business logic" statelessness constraint |
| 2 — Trust Score Display | ✅ Feasible (it's a scale bug) | Small | Low | Clean mismatch: backend scores 0-10, frontend treats them as 0-100 |
| 3 — Trust Redefinition | ✅ Feasible | Medium | Medium | Requires new trust visibility model, ranking boost logic, and deprecation of old constants |

**No change breaks statelessness.** The "user skills" in Change 1 remain ephemeral (not persisted server-side). Changes 2 and 3 are entirely backend logic adjustments.

## Documents

| File | Description |
|------|-------------|
| `index.md` | This document — overview of all 3 changes |
| `change-1-user-skills.md` | Detailed analysis of Change 1: scope, dependencies, approaches, trade-offs |
| `change-2-trust-display.md` | Detailed analysis of Change 2: root cause, fix options, scale mismatch |
| `change-3-trust-redefinition.md` | Detailed analysis of Change 3: new thresholds, ranking boost, type changes |
| `recommendations.md` | Cross-cutting recommendations, prioritization, phasing |
