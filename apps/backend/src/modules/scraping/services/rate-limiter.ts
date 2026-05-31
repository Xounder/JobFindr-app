/**
 * Request rate limiter for scraping.
 * TASK-030: Create Request Rate Limiter
 *
 * Ensures we don't overwhelm provider servers with too many requests.
 */

type RateLimitEntry = {
  count: number
  resetAt: number
}

export class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map()
  private readonly maxRequests: number
  private readonly windowMs: number

  constructor(maxRequests: number = 10, windowMs: number = 1000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  /**
   * Check if a request is allowed for the given key.
   * If allowed, increments the counter.
   */
  tryAcquire(key: string): boolean {
    this.evictExpired()
    const now = Date.now()
    const entry = this.store.get(key)

    if (!entry || now > entry.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + this.windowMs })
      return true
    }

    if (entry.count < this.maxRequests) {
      entry.count++
      return true
    }

    return false
  }

  /**
   * Wait until a request is allowed.
   */
  async acquire(key: string): Promise<void> {
    while (!this.tryAcquire(key)) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  /**
   * Get remaining quota for a key.
   */
  getRemaining(key: string): number {
    this.evictExpired()
    const entry = this.store.get(key)
    if (!entry) return this.maxRequests
    const now = Date.now()
    if (now > entry.resetAt) return this.maxRequests
    return Math.max(0, this.maxRequests - entry.count)
  }

  private evictExpired(): void {
    const now = Date.now()
    for (const [key, entry] of this.store) {
      if (now > entry.resetAt) {
        this.store.delete(key)
      }
    }
  }

  clear(): void {
    this.store.clear()
  }
}

/**
 * Per-provider rate limiters.
 */
export const providerRateLimiters: Record<string, RateLimiter> = {
  gupy: new RateLimiter(10, 1000),
  greenhouse: new RateLimiter(10, 1000),
  ashby: new RateLimiter(10, 1000),
  lever: new RateLimiter(10, 1000),
  workday: new RateLimiter(5, 1000),
}
