/**
 * Partial streaming for search results.
 * TASK-090: Create Partial Streaming
 *
 * Allows successful providers to return results immediately,
 * even while other providers are still processing.
 * For MVP, this returns partial response metadata alongside results.
 */
import type { ProviderResult, NormalizedJob, PartialResponseMeta } from '@jobfindr/types'

/**
 * Aggregate provider results into a combined response.
 * Failed providers are included in metadata but their results are excluded.
 */
export function aggregatePartialResults(
  results: ProviderResult[]
): {
  jobs: NormalizedJob[]
  meta: PartialResponseMeta
} {
  const succeeded = results.filter((r) => r.success)
  const failed = results.filter((r) => !r.success)

  const jobs = succeeded.flatMap((r) => r.jobs)

  const meta: PartialResponseMeta = {
    totalProviders: results.length,
    succeededProviders: succeeded.length,
    failedProviders: failed.length,
    providerResults: results.map((r) => ({
      name: r.providerName,
      success: r.success,
      jobCount: r.jobs.length,
      error: r.error,
      latencyMs: r.latencyMs,
    })),
  }

  return { jobs, meta }
}
