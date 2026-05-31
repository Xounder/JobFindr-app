/**
 * Retry manager for provider requests.
 * TASK-028: Create Retry Manager
 */
import { sleep } from '@jobfindr/utils'

export type RetryConfig = {
  maxRetries: number
  baseDelayMs: number
  maxDelayMs: number
  backoffFactor: number
  retryableStatusCodes: number[]
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10_000,
  backoffFactor: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
}

/**
 * Determine if an error is retryable based on its type or message.
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return (
      message.includes('timeout') ||
      message.includes('econnrefused') ||
      message.includes('econnreset') ||
      message.includes('etimedout') ||
      message.includes('enotfound') ||
      message.includes('socket') ||
      message.includes('network') ||
      message.includes('rate limit') ||
      message.includes('too many')
    )
  }
  return false
}

/**
 * Calculate delay for a specific retry attempt with exponential backoff.
 */
function calculateDelay(
  attempt: number,
  config: RetryConfig
): number {
  const delay = config.baseDelayMs * Math.pow(config.backoffFactor, attempt)
  return Math.min(delay, config.maxDelayMs)
}

/**
 * Execute a function with retry logic.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const cfg = { ...defaultRetryConfig, ...config }
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= cfg.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Check if error is retryable
      const statusCode =
        (error as { status?: number })?.status ??
        (error as { response?: { status?: number } })?.response?.status

      if (statusCode && !cfg.retryableStatusCodes.includes(statusCode)) {
        throw error // Non-retryable status code
      }

      if (!isRetryableError(error)) {
        throw error // Non-retryable error type
      }

      if (attempt < cfg.maxRetries) {
        const delay = calculateDelay(attempt, cfg)
        await sleep(delay)
      }
    }
  }

  throw lastError ?? new Error('Retry failed')
}
