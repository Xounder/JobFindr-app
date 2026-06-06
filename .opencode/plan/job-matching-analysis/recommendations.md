# Recommendations — Job Matching Algorithm Fixes

## For Product Manager

**Clear recommendations for epic creation:**

1. **What to build:**
   - Increase seniority weight in match scoring from 0.25 to 0.35
   - Decrease skill weight from 0.6 to 0.5 to maintain balance
   - Incorporate job freshness score into trust score calculation as a new component with 15% weight
   - Adjust existing trust score weights accordingly (provider: 25%, company: 35%, transparency: 25%)

2. **What NOT to build (out of scope for MVP):**
   - Non-linear seniority penalty curves (can be considered in future iterations)
   - Separate seniority mismatch threshold filters
   - Alternative freshness implementations in trust engine

3. **Dependencies between parts:**
   - Both fixes are independent and can be implemented in either order
   - Neither depends on frontend changes
   - Both require backend deployment together for consistent behavior

4. **Suggested phasing/ordering:**
   - Phase 1: Implement seniority weight adjustment
   - Phase 2: Implement freshness incorporation into trust score
   - Each phase should include: implementation, unit test updates, manual verification

5. **Technical constraints the PM should know:**
   - Changes will affect numerical scores but preserve relative job rankings
   - Existing cached trust scores may need invalidation
   - Unit test updates are required for both matchmaking and trust services
   - No breaking API changes expected

## Suggested Epic Breakdown

**Epic 1: Improve Seniority Matching Penalties**
- Increase seniority weight in match scoring algorithm
- Adjust skill weight to maintain overall balance
- Update all related unit tests
- Verify behavior with test cases covering various seniority gaps

**Epic 2: Incorporate Job Freshness into Trust Score**
- Add freshness score as component in trust score formula
- Adjust existing weights to accommodate new component
- Update trust score unit tests
- Verify that old jobs receive appropriately lower trust scores

**Note:** These epics can be worked on in parallel by different developers as they touch different files.