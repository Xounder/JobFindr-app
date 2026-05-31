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
 */
export function computeTrustScoreWeight(
  job: NormalizedJob,
  weights: RankingWeights
): number {
  const trustScore = job.trustScore ?? 5 // Default to neutral if no trust score
  return (trustScore / 10) * weights.trustScore * 100
}
