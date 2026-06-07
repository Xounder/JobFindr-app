/**
 * Aggregation service - orchestrates provider execution.
 * TASK-012: Create Aggregation Service
 *
 * Coordinates parallel provider execution, collects results,
 * applies matchmaking, trust, and ranking.
 */
import type { NormalizedJob, ValidatedSearchInput, ProviderResult, PaginationMeta, PartialResponseMeta, TrustBreakdown } from '@jobfindr/types'
import { logger } from '../../../shared/logger/logger.ts'
import { providerRegistry } from '../../providers/domain/provider-registry.ts'
import { executeIsolatedProvider } from '../../../shared/services/provider-isolation.ts'
import { getProviderTimeout } from './timeout-manager.ts'
import { paginateJobs } from './pagination.ts'
import { recordProviderSuccess, recordProviderFailure } from '../../../shared/metrics/provider-metrics.ts'
import { ProviderCacheLayer } from '../../../cache/provider-cache-layer.ts'
import { aggregatedCache } from '../../../cache/aggregated-cache.ts'
import { evaluateJobsTrustWithBreakdown, filterByTrust } from '../../trust/services/trust-engine.ts'
import { rankJobs } from '../../ranking/services/ranking-engine.ts'
import { calculateWeightedMatchScoreWithBreakdown } from '../../matchmaking/services/weighted-match-scoring.ts'
import { parseUserSkills } from '../../matchmaking/services/user-skill-parser.ts'
import { aggregatePartialResults } from '../../../shared/streaming/partial-streaming.ts'
import { RequestBatcher } from '../../../shared/services/request-batching.ts'

export type AggregatedSearchResult = {
  jobs: NormalizedJob[]
  meta: PaginationMeta
  partial?: PartialResponseMeta
}

const providerCache = new ProviderCacheLayer()
const requestBatcher = new RequestBatcher<ProviderResult>(200)

/**
 * Execute all enabled providers in parallel and aggregate results.
 */
export async function aggregateSearch(
  input: ValidatedSearchInput
): Promise<AggregatedSearchResult> {
  // Check aggregated cache first (before pagination)
  const aggCacheKey = aggregatedCache.buildKey({ ...input })
  const cachedResult = aggregatedCache.get(aggCacheKey)
  if (cachedResult) {
    const { jobs: paginatedJobs, meta } = paginateJobs(cachedResult, input.page, input.pageSize)
    return { jobs: paginatedJobs, meta }
  }

  const providers = providerRegistry.getAll()
  let selectedProviders = providers

  // Filter by source if specified
  if (input.sources.length > 0) {
    selectedProviders = providers.filter((p) =>
      input.sources.includes(p.name)
    )
  }

  if (selectedProviders.length === 0) {
    logger.warn('No providers available for search', { module: 'aggregation-service' })
    return {
      jobs: [],
      meta: {
        page: input.page,
        pageSize: input.pageSize,
        totalResults: 0,
        totalPages: 0,
      },
    }
  }

  // Execute all providers in parallel with isolation
  const searchCacheKey = {
    q: input.q,
    skills: input.skills,
    seniority: input.seniority,
    remoteMode: input.remoteMode,
    page: input.page,
    pageSize: input.pageSize,
  }

  const providerResults: ProviderResult[] = await Promise.all(
    selectedProviders.map(async (provider) => {
      // Check cache first (fast path — bypasses batcher)
      const cached = providerCache.get(provider.name, searchCacheKey)
      if (cached) {
        return {
          providerName: provider.name,
          success: true,
          jobs: cached,
          error: null,
          latencyMs: 0,
        }
      }

      // Use batcher to deduplicate concurrent requests for the same
      // provider+query within a 200ms window
      const batchKey = `${provider.name}:${JSON.stringify(searchCacheKey)}`
      return requestBatcher.enqueue(batchKey, async () => {
        // Double-check cache (a previous batch may have populated it)
        const cachedRetry = providerCache.get(provider.name, searchCacheKey)
        if (cachedRetry) {
          return {
            providerName: provider.name,
            success: true,
            jobs: cachedRetry,
            error: null,
            latencyMs: 0,
          }
        }

        const timeoutMs = getProviderTimeout(provider.name)
        const result = await executeIsolatedProvider(
          provider.name,
          (searchInput) => provider.search(searchInput),
          input,
          timeoutMs
        )

        // Cache successful results
        if (result.success && result.jobs.length > 0) {
          providerCache.set(provider.name, searchCacheKey, result.jobs)
        }

        // Record metrics
        if (result.success) {
          recordProviderSuccess(provider.name, result.latencyMs, result.jobs.length)
        } else {
          recordProviderFailure(provider.name, 'PROVIDER_ERROR', result.latencyMs)
        }

        return result
      })
    })
  )

  // Aggregate results via partial-streaming (succeeded + failed metadata)
  const aggregated = aggregatePartialResults(providerResults)
  let allJobs = aggregated.jobs
  const partialMeta = aggregated.meta

  // Apply company filters
  if (input.companies.length > 0) {
    const includeLower = input.companies.map((c) => c.toLowerCase())
    allJobs = allJobs.filter((j) =>
      includeLower.includes(j.company.toLowerCase())
    )
  }

  if (input.excludedCompanies.length > 0) {
    const excludeLower = input.excludedCompanies.map((c) => c.toLowerCase())
    allJobs = allJobs.filter(
      (j) => !excludeLower.includes(j.company.toLowerCase())
    )
  }

  // Apply remoteMode filter
  if (input.remoteMode.length > 0) {
    allJobs = allJobs.filter((j) =>
      j.remoteMode !== undefined && input.remoteMode.includes(j.remoteMode)
    )
  }

  // Apply seniority filter
  if (input.seniority.length > 0) {
    allJobs = allJobs.filter((j) =>
      j.seniority !== undefined && input.seniority.includes(j.seniority)
    )
  }

  // Apply postedAfter filter
  if (input.postedAfter !== undefined) {
    const cutoff = new Date(input.postedAfter).getTime()
    allJobs = allJobs.filter((j) => {
      if (!j.postedAt) return false
      return new Date(j.postedAt).getTime() >= cutoff
    })
  }

  // Apply country filter
  if (input.countries.length > 0) {
    const countryLower = input.countries.map((c) => c.toLowerCase())
    allJobs = allJobs.filter((j) => {
      const loc = j.location
      if (!loc) return false
      return countryLower.some((country) => loc.toLowerCase().includes(country))
    })
  }

  // Parse user skills for matchmaking (userSkills fallback to skills)
  const skillsForMatchmaking = input.userSkills.length > 0 ? input.userSkills : input.skills
  const userSkills = skillsForMatchmaking.length > 0
    ? parseUserSkills(skillsForMatchmaking)
    : null

  // Determine seniority for matchmaking: use filter panel seniority (input.seniority)
  // instead of userSeniority from modal. Normalize array: single value -> use it;
  // empty -> undefined; multiple -> use first value.
  const matchmakingSeniority: string | undefined =
    input.seniority.length === 1
      ? input.seniority[0]
      : input.seniority.length > 1
        ? input.seniority[0] // use first when multiple selected
        : undefined

  // Apply matchmaking (if user skills provided)
  if (userSkills && userSkills.normalized.length > 0) {
    for (const job of allJobs) {
      const matchResult = calculateWeightedMatchScoreWithBreakdown(
        userSkills.normalized,
        matchmakingSeniority,
        job.skills,
        job.seniority,
      )
      job.matchScore = matchResult.score.overall
      job.matchBreakdown = matchResult.breakdown
    }
  }

  // Apply trust evaluation (with breakdown data)
  const trustEvaluations = await evaluateJobsTrustWithBreakdown(allJobs)
  const filteredEvaluations = filterByTrust(
    trustEvaluations,
    input.minTrustScore,
    input.includeHidden
  )
  // Preserve trustBreakdown from evaluation results on the job objects
  allJobs = filteredEvaluations.map((e) => {
    const evaluatedJob = e.job
    if ('trustBreakdown' in e) {
      evaluatedJob.trustBreakdown = (e as { trustBreakdown: TrustBreakdown }).trustBreakdown
    }
    return evaluatedJob
  })

  // Apply ranking
  const { jobs: rankedJobs } = rankJobs(allJobs, {
    userSkills: userSkills?.normalized,
    sortBy: input.sort === 'trust' || input.sort === 'match' ? input.sort : 'trust',
  })

  // Store full ranked result in aggregated cache (before pagination)
  aggregatedCache.set(aggCacheKey, rankedJobs)

  // Apply pagination
  const { jobs: paginatedJobs, meta } = paginateJobs(
    rankedJobs,
    input.page,
    input.pageSize
  )

  logger.info(`Search aggregate complete`, {
    module: 'aggregation-service',
    data: {
      totalJobs: allJobs.length,
      returnedJobs: paginatedJobs.length,
      succeededProviders: partialMeta.succeededProviders,
      failedProviders: partialMeta.failedProviders,
    },
  })

  return {
    jobs: paginatedJobs,
    meta,
    partial: partialMeta,
  }
}
