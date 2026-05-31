/**
 * Recency-based ranking factor.
 * TASK-061: Create Recency Ranking
 *
 * Boosts recently posted jobs in ranking.
 */
import type { NormalizedJob, RankingWeights } from '@jobfindr/types'

// Jobs older than this (days) get no recency boost
const MAX_RECENCY_DAYS = 60

/**
 * Compute recency score contribution (0-100).
 * Jobs without postedAt data get a neutral score.
 */
export function computeRecencyScore(
  job: NormalizedJob,
  weights: RankingWeights
): number {
  if (!job.postedAt) return weights.recency * 50 // Neutral for no date

  const postedDate = new Date(job.postedAt)
  const now = new Date()
  const daysDiff = (now.getTime() - postedDate.getTime()) / (1000 * 60 * 60 * 24)

  if (daysDiff < 0) return weights.recency * 100 // Future dates = max
  if (daysDiff >= MAX_RECENCY_DAYS) return 0

  // Linear decay from 100 to 0 over MAX_RECENCY_DAYS
  const recencyScore = (1 - daysDiff / MAX_RECENCY_DAYS) * 100

  return recencyScore * weights.recency
}
