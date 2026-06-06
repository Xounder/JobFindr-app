# Feasibility — Job Matching Algorithm Fixes

## Issue 1: Seniority Mismatch Not Sufficiently Penalized

### Approach A: Increase Seniority Weight in Match Scoring
**Description:** Increase the seniorityWeight from 0.25 to a higher value (e.g., 0.4) in the DEFAULT_WEIGHTS constant in weighted-match-scoring.ts
**Pros:** 
- Simple change requiring only constant modification
- Directly addresses the core issue of insufficient penalization
- Maintains backward compatibility
**Cons:**
- May over-penalize seniority mismatches if not calibrated properly
- Reduces weight available for skill and keyword matching
**Effort:** Small
**Files touched:** 
- apps/backend/src/modules/matchmaking/services/weighted-match-scoring.ts

### Approach B: Implement Non-Linear Seniority Penalty Curve
**Description:** Modify calculateSeniorityScore function to apply exponential or stepped penalties for larger seniority gaps
**Pros:**
- More nuanced approach that better reflects real-world seniority compatibility
- Allows for gentle penalties for small gaps and severe penalties for large gaps
**Cons:**
- More complex implementation requiring careful tuning
- Changes the fundamental scoring logic
**Effort:** Medium
**Files touched:** 
- apps/backend/src/modules/matchmaking/services/weighted-match-scoring.ts

### Approach C: Add Seniority Mismatch Threshold Filter
**Description:** Add a post-processing filter that reduces match score significantly when seniority mismatch exceeds certain thresholds
**Pros:**
- Separates concern from core scoring algorithm
- Easy to tune and adjust independently
**Cons:**
- Adds additional processing step
- May create discontinuities in scoring
**Effort:** Small
**Files touched:** 
- apps/backend/src/modules/matchmaking/services/weighted-match-scoring.ts
- apps/backend/src/modules/search/services/aggregation-service.ts (potentially)

## Issue 2: Days Since Posted Not Properly Affecting Trust Score

### Approach A: Incorporate Freshness Score into Trust Score Calculation
**Description:** Modify calculateTrustScore in trust-score-formula.ts to include freshness as a component of the transparency signals or as a separate weighted factor
**Pros:**
- Directly fixes the root cause
- Ensures trust score reflects job recency
- Maintains single source of truth for trust scoring
**Cons:**
- Requires modifying the established trust formula weights
- May need recalibration of existing trust score expectations
**Effort:** Medium
**Files touched:** 
- apps/backend/src/modules/trust/services/trust-score-formula.ts

### Approach B: Apply Freshness Penalty in Trust Engine
**Description:** Modify evaluateJobTrust in trust-engine.ts to apply a freshness-based penalty to the final trust score
**Pros:**
- Less invasive change to core trust formula
- Isolates freshness logic to trust engine layer
**Cons:**
- Creates duplication between trust-score-formula and trust-engine
- Trust breakdown may become inconsistent with actual trust score used
**Effort:** Small
**Files touched:** 
- apps/backend/src/modules/trust/services/trust-engine.ts

### Approach C: Enhance Trust Breakdown to Influence Final Score
**Description:** Modify the trust evaluation pipeline to use freshnessScore from breakdown in final score calculation
**Pros:**
- Utilizes existing freshness calculation logic
- Makes use of already-computed breakdown data
**Cons:**
- Requires changes to how trust scores are composed
- May affect other parts of system that rely on trust scores
**Effort:** Medium
**Files touched:** 
- apps/backend/src/modules/trust/services/trust-engine.ts
- apps/backend/src/modules/trust/services/trust-score-formula.ts

## Recommendation
For Issue 1: Implement Approach A (Increase Seniority Weight) as it's the simplest and most direct fix. Start with increasing seniorityWeight from 0.25 to 0.35 and skillWeight from 0.6 to 0.5 to maintain balance.

For Issue 2: Implement Approach A (Incorporate Freshness Score into Trust Score Calculation) as it addresses the root cause most cleanly. Add freshness as a fourth component with appropriate weight (e.g., 15%) and adjust other weights accordingly.

Both approaches are feasible with minimal risk and can be implemented independently.