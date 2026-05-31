/**
 * Retry System with Exponential Backoff.
 * TASK-117: Create Retry System with Exponential Backoff
 *
 * Wraps any provider call with configurable retries.
 * Only retries on transient errors (timeout, 5xx, network).
 */
import { sleep } from '@jobfindr/utils'
import { logger } from '../../../shared/logger/logger.ts'

export type RetryConfig = {
  /** Maximum number of retry attempts (default: 2) */
  maxRetries: number
  /** Base delay in ms for exponential backoff (default: 1000) */
  baseDelayMs: number
  /** Maximum delay in ms (default: 30000) */
  maxDelayMs: number
  /** HTTP status codes that are retryable */
  retryableStatusCodes: number[]
}

const defaultConfig: RetryConfig = {
  maxRetries: 2,
  baseDelayMs: 1000,
  maxDelayMs: 30_000,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
}

/**
 * Calculate exponential backoff delay.
 * baseDelay * 2^attempt, capped at maxDelayMs.
 */
export function calculateBackoff(attempt: number, config: RetryConfig): number {
  const delay = config.baseDelayMs * Math.pow(2, attempt)
  return Math.min(delay, config.maxDelayMs)
}

/**
 * Determine if an error is transient (retryable).
 */
export function isTransientError(error: unknown): boolean {
  if (!(error instanceof Error)) return false

  const message = error.message.toLowerCase()
  const transientPatterns = [
    'timeout',
    'econnrefused',
    'econnreset',
    'etimedout',
    'enotfound',
    'eaddrinfo',
    'socket',
    'network',
    'rate limit',
    'too many',
    'internal server error',
    'bad gateway',
    'service unavailable',
    'gateway timeout',
  ]

  return transientPatterns.some((pattern) => message.includes(pattern))
}

/**
 * Execute a function with retry logic using exponential backoff.
 * Only retries on transient errors.
 */
export async function withRetry<T>(
  providerName: string,
  operationName: string,
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const cfg = { ...defaultConfig, ...config }
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= cfg.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Check HTTP status code for retryability
      const statusCode =
        (error as { status?: number })?.status ??
        (error as { response?: { status?: number } })?.response?.status

      if (statusCode && !cfg.retryableStatusCodes.includes(statusCode)) {
        logger.warn(`[${providerName}] Non-retryable HTTP ${statusCode} on ${operationName}`, {
          module: 'retry-system',
          error: lastError.message,
          data: { attempt, statusCode },
        })
        throw error
      }

      // Check if error is transient
      if (!isTransientError(error)) {
        logger.warn(`[${providerName}] Non-transient error on ${operationName}`, {
          module: 'retry-system',
          error: lastError.message,
          data: { attempt },
        })
        throw error
      }

      if (attempt < cfg.maxRetries) {
        const delay = calculateBackoff(attempt, cfg)
        logger.info(`[${providerName}] Retrying ${operationName} after ${delay}ms (attempt ${attempt + 1}/${cfg.maxRetries})`, {
          module: 'retry-system',
          data: { attempt: attempt + 1, maxRetries: cfg.maxRetries, delayMs: delay },
        })
        await sleep(delay)
      }
    }
  }

  logger.error(`[${providerName}] All retries exhausted for ${operationName}`, {
    module: 'retry-system',
    error: lastError?.message ?? 'Unknown',
    data: { maxRetries: cfg.maxRetries },
  })

  throw lastError ?? new Error(`${operationName} failed after ${cfg.maxRetries} retries`)
}
