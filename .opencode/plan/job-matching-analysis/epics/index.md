# Job Matching Algorithm Fixes — Epics Overview

**Context:** `job-matching-analysis`  
**Date:** Thu Jun 04 2026  
**Status:** Draft

## Overview

This folder contains epics derived from the job matching algorithm analysis addressing two issues:
1. Seniority mismatch not being sufficiently penalized in match percentage
2. Days since posted not properly affecting trust score

Both issues were analyzed and found feasible with moderate effort. The recommended approaches are implemented as two independent epics that can be worked on in parallel.

## Epic Mapping

| Epic ID | Title | Scope | Priority | Dependencies |
|---------|-------|-------|----------|--------------|
| **EPIC-01** | Improve Seniority Matching Penalties | Matchmaking service — weighted match scoring weights adjustment | High | None |
| **EPIC-02** | Incorporate Job Freshness into Trust Score | Trust engine — trust score formula with freshness component | High | None |

## Epic Summary

### EPIC-01: Improve Seniority Matching Penalties
- **Objective:** Increase seniority weight in match scoring from 0.25 → 0.35 and decrease skill weight from 0.6 → 0.5
- **Files:** `apps/backend/src/modules/matchmaking/services/weighted-match-scoring.ts`
- **Tests:** Update unit tests in matchmaking services
- **Deliverable:** Seniority mismatches are appropriately penalized in match percentage

### EPIC-02: Incorporate Job Freshness into Trust Score
- **Objective:** Add freshness score as 4th component (15% weight) in trust score formula; adjust existing weights (provider: 25%, company: 35%, transparency: 25%)
- **Files:** `apps/backend/src/modules/trust/services/trust-score-formula.ts`, `trust-engine.ts`
- **Tests:** Update unit tests in trust services
- **Deliverable:** Older jobs receive appropriately lower trust scores

## Prioritization Rationale

Both epics are **High priority** and **independent** — they can be developed in parallel by different developers since they touch different modules (matchmaking vs trust). No dependencies exist between them.

## Acceptance Criteria (Cross-Epic)

- [ ] All unit tests pass after changes
- [ ] No breaking API changes
- [ ] Match scores and trust scores change numerically but preserve relative job rankings
- [ ] Existing cached trust scores invalidated or recalculated
- [ ] No performance regression

---

*Generated from analysis in `.opencode/plan/job-matching-analysis/`*