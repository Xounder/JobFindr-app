/**
 * Timeout wrapper for provider requests.
 * TASK-029: Create Timeout Wrapper
 */
import { timeoutMonitor } from '../../../shared/metrics/timeout-monitoring.ts'

/**
 * Wrap a promise with a timeout.
 * If the promise doesn't resolve within the given time, it rejects with a TimeoutError.
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  context: { providerName: string; endpoint?: string }
): Promise<T> {
  const endpoint = context.endpoint ?? 'unknown'

  const timeoutPromise = new Promise<never>((_, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id)
      timeoutMonitor.recordTimeout(context.providerName, timeoutMs, endpoint)
      reject(new Error(`Timeout: ${context.providerName} exceeded ${timeoutMs}ms`))
    }, timeoutMs)
    if (typeof id === 'object' && typeof id.unref === 'function') {
      id.unref()
    }
  })

  return Promise.race([promise, timeoutPromise])
}
