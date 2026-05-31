/**
 * Ranking Engine - orchestrates multi-factor job ranking.
 * TASK-056: Create Ranking Engine
 */
import type { NormalizedJob, RankingWeights, RankingResult, RankingBreakdown } from '@jobfindr/types'
import { DEFAULT_RANKING_WEIGHTS } from '@jobfindr/types'
import { computeMatchScoreWeight } from './match-score-weight.ts'
import { computeTrustScoreWeight } from './trust-score-weight.ts'
import { computeCompanyPriorityScore } from './large-company-priority.ts'
import { computeSalaryScore } from './salary-ranking.ts'
import { computeRecencyScore } from './recency-ranking.ts'
import { computeFinalScore } from './composite-score.ts'

export type RankingOptions = {
  weights?: Partial<RankingWeights>
  userSkills?: string[]
}

/**
 * Rank jobs based on multiple factors.
 * Returns jobs sorted by composite score (descending).
 */
export function rankJobs(
  jobs: NormalizedJob[],
  options: RankingOptions = {}
): { jobs: NormalizedJob[]; rankings: Map<string, RankingResult> } {
  const weights: RankingWeights = { ...DEFAULT_RANKING_WEIGHTS, ...options.weights }
  const rankings = new Map<string, RankingResult>()

  for (const job of jobs) {
    const breakdown: RankingBreakdown = {
      matchScoreContribution: computeMatchScoreWeight(job, weights, options.userSkills),
      trustScoreContribution: computeTrustScoreWeight(job, weights),
      companyPriorityContribution: computeCompanyPriorityScore(job, weights),
      salaryContribution: computeSalaryScore(job, weights),
      recencyContribution: computeRecencyScore(job, weights),
    }

    const compositeScore = computeFinalScore(breakdown)
    const rankingResult: RankingResult = {
      jobId: job.id,
      compositeScore,
      breakdown,
    }

    rankings.set(job.id, rankingResult)
  }

  // Sort jobs by composite score descending
  const sortedJobs = [...jobs].sort((a, b) => {
    const scoreA = rankings.get(a.id)?.compositeScore ?? 0
    const scoreB = rankings.get(b.id)?.compositeScore ?? 0
    return scoreB - scoreA
  })

  // Attach ranking scores to jobs
  for (const job of sortedJobs) {
    const rank = rankings.get(job.id)
    if (rank) {
      job.rankingScore = rank.compositeScore
    }
  }

  return { jobs: sortedJobs, rankings }
}
