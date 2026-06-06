# Impact Analysis — Job Matching Algorithm Fixes

## Layer Impact Matrix

| Layer | Impact | Changes |
|-------|--------|---------|
| Frontend | Low | None required for core fixes; UI may need updates to reflect new scoring |
| Backend | Medium | Changes to matchmaking scoring and trust calculation logic |
| Types (shared) | None | No type definitions need modification |
| Utils (shared) | None | No utility functions affected |
| Configs | None | No configuration changes needed |

## Detailed Impact

### Issue 1: Seniority Mismatch Fix
- **Matchmaking Service**: Direct impact on `calculateSeniorityScore` function and weighting constants
- **Aggregation Service**: Indirect impact as it uses matchmaking results; no direct changes needed
- **Tests**: Unit tests in matchmaking services will need updating to reflect new scoring behavior

### Issue 2: Trust Score Freshness Fix
- **Trust Score Formula**: Direct impact on `calculateTrustScore` function to incorporate freshness
- **Trust Engine**: Indirect impact as it uses trust score formula; may need adjustments to breakdown generation
- **Aggregation Service**: Indirect impact as it uses trust evaluations; no direct changes needed
- **Tests**: Unit tests in trust services will need updating

## Breaking Changes
- None expected if implemented as additive changes to existing algorithms
- Existing trust scores and match scores will change numerically, but relative ordering should remain similar
- No API contract changes required

## Performance Impact
- Negligible performance impact
- Minor additional computations in scoring functions
- No additional database queries or external calls