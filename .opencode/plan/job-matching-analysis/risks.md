# Risks — Job Matching Algorithm Fixes

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Over-penalizing seniority mismatches leading to fewer job matches | Medium | Medium | Start with modest weight increase (0.35) and monitor match rates; adjust via A/B testing |
| Under-penalizing seniority mismatches if weight increase is too small | Medium | Medium | Set up automated tests to verify penalty behavior for known seniority gaps |
| Trust score changes causing unexpected filtering of jobs | Low | Medium | Ensure freshness score is normalized and weighted appropriately; maintain backward compatibility in trust score range |
| Inconsistency between trust score and trust breakdown | Low | Low | Update trust breakdown generation to reflect any changes in trust score calculation |
| Performance degradation due to additional computations | Low | Low | Computations are minimal; profile if necessary |
| Failure to update unit tests leading to false positives | Medium | Low | Enforce test updates as part of implementation; use test coverage checks |

## Regression Points
- Seniority match scoring for internal/executive level transitions
- Trust score calculation for very old jobs (should decrease significantly)
- Match score calculation when user has not specified seniority
- Trust score calculation for jobs with missing postedAt dates