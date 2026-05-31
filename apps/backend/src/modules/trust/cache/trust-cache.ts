/**
 * Trust score cache.
 * TASK-055: Create Trust Cache
 *
 * Caches trust evaluation results with a TTL of 24h.
 */
import { InMemoryCache } from '../../../cache/in-memory-cache.ts'
import type { TrustScore } from '@jobfindr/types'
import { env } from '../../../config/env.ts'

export class TrustCacheLayer {
  private cache: InMemoryCache<TrustScore>

  constructor(ttlMs?: number) {
    this.cache = new InMemoryCache<TrustScore>(
      ttlMs ?? env.CACHE_TRUST_TTL * 1000
    )
  }

  /**
   * Get cached trust score for a entity (company/provider combo).
   */
  get(key: string): TrustScore | undefined {
    return this.cache.get(key)
  }

  /**
   * Cache a trust score.
   */
  set(key: string, score: TrustScore): void {
    this.cache.set(key, score)
  }

  /**
   * Invalidate a specific cache entry.
   */
  invalidate(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Clear all cached trust scores.
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics.
   */
  getStats() {
    return this.cache.getStats()
  }
}
