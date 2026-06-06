/**
 * Trust Engine - evaluates provider and company trustworthiness.
 * TASK-049: Create Trust Engine
 */
import type { TrustScore, NormalizedJob, TrustBreakdown, CompanySizeCategory } from '@jobfindr/types'
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

/**
 * Extended result type that includes trust breakdown data.
 */
export type TrustEvaluationWithBreakdown = TrustEvaluationResult & {
  trustBreakdown: TrustBreakdown
}

const trustCache = new TrustCacheLayer()

/**
 * Map company size to a numeric bonus (0-10).
 */
function companySizeToBonus(size: CompanySizeCategory): number {
  const bonuses: Record<CompanySizeCategory, number> = {
    unknown: 0,
    startup: 3,
    small: 4,
    medium: 6,
    large: 8,
    enterprise: 10,
  }
  return bonuses[size] ?? 0
}

/**
 * Compute days since the job was posted.
 */
function daysSincePosted(postedAt?: string): number {
  if (!postedAt) return 999
  const posted = new Date(postedAt).getTime()
  const now = Date.now()
  const diffMs = now - posted
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
}

/**
 * Compute freshness score (0-10) based on days since posted.
 */
function computeFreshnessScore(days: number): number {
  if (days <= 1) return 10
  if (days <= 7) return 8
  if (days <= 14) return 6
  if (days <= 30) return 4
  if (days <= 60) return 2
  return 0
}

/**
 * Build TrustBreakdown from a job and its TrustScore.
 */
function buildTrustBreakdown(job: NormalizedJob, trustScore: TrustScore): TrustBreakdown {
  const providerScore = trustScore.providerReputation
  const companyAdjustment = Math.round((trustScore.companyReputation - 5) * 10) / 10
  const days = daysSincePosted(job.postedAt)
  const freshnessScore = computeFreshnessScore(days)
  const companySizeBonus = companySizeToBonus(trustScore.signals.companySize)
  const isKnownEmployer = trustScore.signals.isPublicCompany || trustScore.signals.hasLinkedIn

  return {
    providerScore,
    companyAdjustment,
    freshnessScore,
    signals: {
      providerReputation: providerScore,
      companySizeBonus,
      isKnownEmployer,
      daysSincePosted: days,
    },
  }
}

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

  // Compute freshness score
  const days = daysSincePosted(job.postedAt)
  const freshnessScore = computeFreshnessScore(days)

  // Calculate trust score with freshness
  const trustScore = calculateTrustScore(providerRep, companyRep, freshnessScore)

  // Cache result
  trustCache.set(cacheKey, trustScore)

  return {
    job: { ...job, trustScore: trustScore.overall },
    trustScore,
    visibility: getTrustVisibility(trustScore.overall),
  }
}

/**
 * Evaluate trust for a single job, returning breakdown data as well.
 */
export async function evaluateJobTrustWithBreakdown(
  job: NormalizedJob
): Promise<TrustEvaluationWithBreakdown> {
  // Check cache first
  const cacheKey = `${job.source}:${job.company}`
  const cached = trustCache.get(cacheKey)
  if (cached) {
    const breakdown = buildTrustBreakdown(job, cached)
    return {
      job: { ...job, trustScore: cached.overall, trustBreakdown: breakdown },
      trustScore: cached,
      visibility: getTrustVisibility(cached.overall),
      trustBreakdown: breakdown,
    }
  }

  // Get provider reputation
  const providerRep = getProviderReputation(job.source)

  // Get company reputation
  const companyRep = evaluateCompanyReputation(job.company, job.industry)

  // Compute freshness score
  const days = daysSincePosted(job.postedAt)
  const freshnessScore = computeFreshnessScore(days)

  // Calculate trust score with freshness
  const trustScore = calculateTrustScore(providerRep, companyRep, freshnessScore)

  // Build breakdown
  const breakdown = buildTrustBreakdown(job, trustScore)

  // Cache result
  trustCache.set(cacheKey, trustScore)

  return {
    job: { ...job, trustScore: trustScore.overall, trustBreakdown: breakdown },
    trustScore,
    visibility: getTrustVisibility(trustScore.overall),
    trustBreakdown: breakdown,
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
 * Evaluate trust for multiple jobs, returning breakdown data as well.
 */
export async function evaluateJobsTrustWithBreakdown(
  jobs: NormalizedJob[]
): Promise<TrustEvaluationWithBreakdown[]> {
  const results: TrustEvaluationWithBreakdown[] = []
  for (const job of jobs) {
    const result = await evaluateJobTrustWithBreakdown(job)
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
