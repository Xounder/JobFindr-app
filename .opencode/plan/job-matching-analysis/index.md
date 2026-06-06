# Job Matching Algorithm Analysis

**Date:** Thu Jun 04 2026  
**Requested by:** User  
**Status:** Draft

## Objective
Analyze two specific issues in the job matching algorithm:
1. Seniority mismatch not being sufficiently penalized in match percentage
2. Days since posted not properly affecting trust score

## Scope
- Backend aggregation service (apps/backend/src/modules/search/services/aggregation-service.ts)
- Matchmaking module (apps/backend/src/modules/matchmaking/services/weighted-match-scoring.ts)
- Trust engine (apps/backend/src/modules/trust/services/trust-engine.ts and trust-score-formula.ts)

## Summary of Findings
Both issues are feasible to fix with moderate effort. The seniority mismatch issue stems from low weighting in the match scoring algorithm, while the trust score issue occurs because job freshness is only tracked in breakdown data but not factored into the actual trust score calculation.

## Documents
| File | Description |
|------|-------------|
| `feasibility.md` | Technical feasibility and approaches |
| `impact-analysis.md` | Impact per layer |
| `risks.md` | Risk assessment |
| `recommendations.md` | Recommendations for Product Manager |