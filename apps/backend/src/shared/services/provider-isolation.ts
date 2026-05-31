/**
 * Provider isolation mechanism.
 * TASK-097: Create Provider Isolation
 *
 * Ensures that a single provider failure never crashes the entire pipeline.
 * Wraps each provider execution in try/catch with timeout protection.
 */
import type { ValidatedSearchInput, NormalizedJob, ProviderResult } from '@jobfindr/types'
import { logger } from '../logger/logger.ts'

export type IsolatedProviderCall = (
  input: ValidatedSearchInput
) => Promise<NormalizedJob[]>

/**
 * Execute a provider call in isolation.
 * Returns a ProviderResult that always resolves (never throws).
 */
export async function executeIsolatedProvider(
  providerName: string,
  fn: IsolatedProviderCall,
  input: ValidatedSearchInput,
  timeoutMs: number
): Promise<ProviderResult> {
  const startTime = Date.now()

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Provider ${providerName} timed out after ${timeoutMs}ms`)), timeoutMs)
    )

    const jobs = await Promise.race([fn(input), timeoutPromise])

    const latencyMs = Date.now() - startTime

    logger.info(`Provider ${providerName} succeeded`, {
      module: 'provider-isolation',
      data: { jobCount: jobs.length, latencyMs },
    })

    return {
      providerName,
      success: true,
      jobs,
      error: null,
      latencyMs,
    }
  } catch (error) {
    const latencyMs = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    logger.warn(`Provider ${providerName} failed`, {
      module: 'provider-isolation',
      error: errorMessage,
      data: { latencyMs },
    })

    return {
      providerName,
      success: false,
      jobs: [],
      error: errorMessage,
      latencyMs,
    }
  }
}
