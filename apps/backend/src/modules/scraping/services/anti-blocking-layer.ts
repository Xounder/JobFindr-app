/**
 * Anti-blocking layer for scraping.
 * TASK-033: Create Anti-Blocking Layer
 *
 * Combines multiple techniques to reduce blocking risk:
 * - User-Agent rotation
 * - Request rate limiting
 * - Random delays
 * - Request queuing
 */
import { userAgentRotation } from './user-agent-rotation.ts'
import { providerRateLimiters } from './rate-limiter.ts'
import { providerQueues } from './request-queue.ts'
import { sleep } from '@jobfindr/utils'

export type AntiBlockingConfig = {
  minDelayMs: number
  maxDelayMs: number
  useQueue: boolean
  useRateLimit: boolean
  useRandomDelay: boolean
}

const defaultConfig: AntiBlockingConfig = {
  minDelayMs: 200,
  maxDelayMs: 800,
  useQueue: true,
  useRateLimit: true,
  useRandomDelay: true,
}

/**
 * Generate a random delay between min and max.
 */
function randomDelay(minMs: number, maxMs: number): number {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs
}

/**
 * Execute a provider request with anti-blocking protections.
 */
export async function withAntiBlocking<T>(
  providerName: string,
  fn: () => Promise<T>,
  config: Partial<AntiBlockingConfig> = {}
): Promise<T> {
  const cfg = { ...defaultConfig, ...config }
  let result: T

  const execute = async (): Promise<T> => {
    // Apply random delay before request
    if (cfg.useRandomDelay) {
      const delay = randomDelay(cfg.minDelayMs, cfg.maxDelayMs)
      await sleep(delay)
    }

    // Apply rate limiting
    if (cfg.useRateLimit) {
      const limiter = providerRateLimiters[providerName]
      if (limiter) {
        await limiter.acquire(providerName)
      }
    }

    // Get a fresh user agent
    userAgentRotation.getNext()

    return await fn()
  }

  // Apply queue
  if (cfg.useQueue) {
    const queue = providerQueues[providerName]
    if (queue) {
      result = await queue.enqueue(execute)
    } else {
      result = await execute()
    }
  } else {
    result = await execute()
  }

  return result
}
