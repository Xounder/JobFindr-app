/**
 * Trust score weighting for ranking.
 * TASK-058: Create Trust Score Weighting
 *
 * Applies trust influence to the ranking score.
 */
import type { NormalizedJob, RankingWeights } from '@jobfindr/types'

/**
 * Compute the trust score contribution (0-100).
 * Uses the job's trustScore if available, otherwise defaults to a neutral score.
 *
 * Ranking boost multipliers:
 * - trustScore >= 8.0 → 1.25x
 * - trustScore >= 9.0 → 1.5x
 * Result is capped at 100.
 */
export function computeTrustScoreWeight(
  job: NormalizedJob,
  weights: RankingWeights
): number {
  const trustScore = job.trustScore ?? 5 // Default to neutral if no trust score
  let score = (trustScore / 10) * weights.trustScore * 100

  // Apply ranking boost for high-trust jobs
  if (trustScore >= 9) {
    score *= 1.5
  }
  if (trustScore >= 8) {
    score *= 1.25
  }

  // Cap at 100
  return Math.min(score, 100)
}
