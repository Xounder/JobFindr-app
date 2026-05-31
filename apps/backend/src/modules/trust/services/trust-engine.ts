/**
 * Trust Engine - evaluates provider and company trustworthiness.
 * TASK-049: Create Trust Engine
 */
import type { TrustScore, NormalizedJob } from '@jobfindr/types'
import { getTrustVisibility } from '@jobfindr/types'
import type { TrustVisibility } from '@jobfindr/types'
import { calculateTrustScore } from './trust-score-formula.ts'
import { evaluateCompanyReputation } from './company-reputation.ts'
import { getProviderReputation } from './provider-reputation.ts'
import { TrustCacheLayer } from '../cache/trust-cache.ts'

export type TrustEvaluationResult = {
  job: NormalizedJob
  trustScore: TrustScore
  visibility: TrustVisibility
}

const trustCache = new TrustCacheLayer()

/**
 * Evaluate trust for a single job.
 */
export async function evaluateJobTrust(
  job: NormalizedJob
): Promise<TrustEvaluationResult> {
  // Check cache first
  const cacheKey = `${job.source}:${job.company}`
  const cached = trustCache.get(cacheKey)
  if (cached) {
    return {
      job: { ...job, trustScore: cached.overall },
      trustScore: cached,
      visibility: getTrustVisibility(cached.overall),
    }
  }

  // Get provider reputation
  const providerRep = getProviderReputation(job.source)

  // Get company reputation
  const companyRep = evaluateCompanyReputation(job.company, job.industry)

  // Calculate trust score
  const trustScore = calculateTrustScore(providerRep, companyRep)

  // Cache result
  trustCache.set(cacheKey, trustScore)

  return {
    job: { ...job, trustScore: trustScore.overall },
    trustScore,
    visibility: getTrustVisibility(trustScore.overall),
  }
}

/**
 * Evaluate trust for multiple jobs.
 */
export async function evaluateJobsTrust(
  jobs: NormalizedJob[]
): Promise<TrustEvaluationResult[]> {
  const results: TrustEvaluationResult[] = []
  for (const job of jobs) {
    const result = await evaluateJobTrust(job)
    results.push(result)
  }
  return results
}

/**
 * Filter jobs based on trust thresholds and user preferences.
 */
export function filterByTrust(
  evaluations: TrustEvaluationResult[],
  minTrustScore: number = 0,
  includeHidden: boolean = false
): TrustEvaluationResult[] {
  return evaluations.filter((e) => {
    if (e.trustScore.overall < minTrustScore) return false
    if (e.visibility === 'blocked') return false
    if (e.visibility === 'hidden' && !includeHidden) return false
    return true
  })
}

export { getTrustVisibility }
