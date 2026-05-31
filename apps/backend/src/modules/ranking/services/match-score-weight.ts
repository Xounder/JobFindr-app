/**
 * Match score weighting for ranking.
 * TASK-057: Create Match Score Weighting
 *
 * Applies matchmaking influence to the ranking score.
 */
import type { NormalizedJob, RankingWeights } from '@jobfindr/types'

/**
 * Compute the match score contribution (0-100).
 * Uses the job's matchScore if available, otherwise defaults to a neutral score.
 */
export function computeMatchScoreWeight(
  job: NormalizedJob,
  weights: RankingWeights,
  _userSkills?: string[]
): number {
  const matchScore = job.matchScore ?? 50 // Default to neutral if no match score
  return (matchScore / 100) * weights.matchScore * 100
}
