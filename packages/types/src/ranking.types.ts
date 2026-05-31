/**
 * Ranking-related types.
 * TASK-056: Create Ranking Engine (types)
 */

export type RankingWeights = {
  matchScore: number
  trustScore: number
  companyPriority: number
  salary: number
  recency: number
}

/**
 * Default ranking weights (configurable).
 */
export const DEFAULT_RANKING_WEIGHTS: RankingWeights = {
  matchScore: 0.35,
  trustScore: 0.25,
  companyPriority: 0.15,
  salary: 0.15,
  recency: 0.10,
}

export type RankingResult = {
  jobId: string
  compositeScore: number
  breakdown: RankingBreakdown
}

export type RankingBreakdown = {
  matchScoreContribution: number
  trustScoreContribution: number
  companyPriorityContribution: number
  salaryContribution: number
  recencyContribution: number
}
