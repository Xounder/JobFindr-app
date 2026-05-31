/**
 * Provider timeout manager.
 * TASK-014/118: Create Provider Timeout Manager
 *
 * Prevents slow providers from blocking the entire request.
 */
import { env } from '../../../config/env.ts'
import { timeoutMonitor } from '../../../shared/metrics/timeout-monitoring.ts'

const PROVIDER_TIMEOUTS: Record<string, number> = {
  gupy: env.GUPY_TIMEOUT_MS,
  greenhouse: env.GREENHOUSE_TIMEOUT_MS,
  ashby: env.ASHBY_TIMEOUT_MS,
  lever: env.LEVER_TIMEOUT_MS,
  workday: env.WORKDAY_TIMEOUT_MS,
}

const DEFAULT_TIMEOUT = env.PROVIDER_TIMEOUT_MS

/**
 * Get timeout for a specific provider.
 */
export function getProviderTimeout(providerName: string): number {
  return PROVIDER_TIMEOUTS[providerName.toLowerCase()] ?? DEFAULT_TIMEOUT
}

/**
 * Execute a provider call with a timeout.
 * Returns null if the provider times out.
 */
export async function executeWithTimeout<T>(
  providerName: string,
  fn: () => Promise<T>
): Promise<T | null> {
  const timeoutMs = getProviderTimeout(providerName)

  try {
    const result = await Promise.race([
      fn(),
      new Promise<never>((_, reject) =>
        setTimeout(() => {
          timeoutMonitor.recordTimeout(providerName, timeoutMs, 'search')
          reject(new Error(`Provider ${providerName} timed out after ${timeoutMs}ms`))
        }, timeoutMs)
      ),
    ])
    return result
  } catch {
    return null
  }
}
