/**
 * Provider Execution Engine.
 * TASK-113: Create Provider Execution Engine
 *
 * Runs all providers in parallel with individual timeouts.
 * Collects ProviderResult for each (success + jobs or error).
 * Aggregates results, never letting one failure block others.
 * Records per-provider duration metrics.
 */
import type { JobProvider, ValidatedSearchInput, ProviderResult, AggregatedProviderResult } from '@jobfindr/types'
import { logger } from '../../../shared/logger/logger.ts'
import { executeIsolatedProvider } from '../../../shared/services/provider-isolation.ts'
import { getProviderTimeout } from '../../search/services/timeout-manager.ts'
import { recordProviderSuccess, recordProviderFailure } from '../../../shared/metrics/provider-metrics.ts'
import type { QuotaManager } from './resilience/quota-manager.ts'

export type EngineOptions = {
  defaultTimeoutMs?: number
  quotaManager?: QuotaManager
}

export async function runAllProviders(
  providers: JobProvider[],
  input: ValidatedSearchInput,
  _options: EngineOptions = {}
): Promise<AggregatedProviderResult> {
  const startTime = Date.now()

  if (providers.length === 0) {
    return {
      jobs: [],
      results: [],
      totalDurationMs: 0,
      succeededCount: 0,
      failedCount: 0,
    }
  }

  const results: ProviderResult[] = await Promise.all(
    providers.map(async (provider) => {
      const timeoutMs = getProviderTimeout(provider.name)

      if (_options.quotaManager) {
        const hasQuota = await _options.quotaManager.tryAcquire(provider.name)
        if (!hasQuota) {
          logger.warn(`Provider ${provider.name} skipped due to quota limit`, {
            module: 'provider-engine',
            data: { provider: provider.name },
          })
          return {
            providerName: provider.name,
            error: 'QUOTA_EXCEEDED',
            jobs: [],
            success: false,
            latencyMs: 0,
          }
        }
      }

      const result = await executeIsolatedProvider(
        provider.name,
        (searchInput) => provider.search(searchInput),
        input,
        timeoutMs
      )

      _options.quotaManager?.release(provider.name)

      if (result.success) {
        recordProviderSuccess(provider.name, result.latencyMs, result.jobs.length)
      } else {
        recordProviderFailure(provider.name, 'PROVIDER_ERROR', result.latencyMs)
      }

      return result
    })
  )

  const totalDurationMs = Date.now() - startTime

  const successfulResults = results.filter((r) => r.success)
  const failedResults = results.filter((r) => !r.success)
  const allJobs = successfulResults.flatMap((r) => r.jobs)

  logger.info(`Provider engine executed ${providers.length} providers`, {
    module: 'provider-engine',
    data: {
      totalProviders: providers.length,
      succeeded: successfulResults.length,
      failed: failedResults.length,
      totalJobs: allJobs.length,
      durationMs: totalDurationMs,
    },
  })

  // Log individual provider durations
  for (const result of results) {
    logger.info(`Provider ${result.providerName} completed`, {
      module: 'provider-engine',
      data: {
        success: result.success,
        jobCount: result.jobs.length,
        latencyMs: result.latencyMs,
        error: result.error,
      },
    })
  }

  return {
    jobs: allJobs,
    results,
    totalDurationMs,
    succeededCount: successfulResults.length,
    failedCount: failedResults.length,
  }
}

/**
 * Execute a single provider with timeout and fallback.
 */
export async function runSingleProvider(
  provider: JobProvider,
  input: ValidatedSearchInput,
  timeoutMs?: number
): Promise<ProviderResult> {
  const ttlMs = timeoutMs ?? getProviderTimeout(provider.name)

  return executeIsolatedProvider(
    provider.name,
    (searchInput) => provider.search(searchInput),
    input,
    ttlMs
  )
}
