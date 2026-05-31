/**
 * Aggregated cache for full search results.
 * TASK-19.1-01: Create AggregatedCache
 *
 * Wraps InMemoryCache<NormalizedJob[]> to cache aggregated search results
 * before pagination. Cache key excludes page/pageSize so pagination
 * is applied after a cache hit.
 */
import { InMemoryCache } from './in-memory-cache.ts'
import type { NormalizedJob } from '@jobfindr/types'

export type CacheableAggregatedParams = Record<string, unknown>

export class AggregatedCache {
  private cache: InMemoryCache<NormalizedJob[]>
  private readonly ttlMs: number
  private readonly maxEntries: number

  constructor(ttlMs = 120_000, maxEntries = 50) {
    this.ttlMs = ttlMs
    this.maxEntries = maxEntries
    this.cache = new InMemoryCache<NormalizedJob[]>(ttlMs)
  }

  /**
   * Build a deterministic cache key from search params,
   * excluding page and pageSize so pagination is applied after retrieval.
   */
  buildKey(params: CacheableAggregatedParams): string {
    const { page, pageSize, ...rest } = params
    const keys = Object.keys(rest).sort()
    const sorted: Record<string, unknown> = {}
    for (const k of keys) {
      sorted[k] = rest[k]
    }
    return JSON.stringify(sorted)
  }

  /**
   * Get cached aggregated jobs by key.
   */
  get(key: string): NormalizedJob[] | undefined {
    return this.cache.get(key)
  }

  /**
   * Store aggregated jobs in cache with the configured TTL.
   * Evicts the oldest entry if max entries would be exceeded.
   */
  set(key: string, jobs: NormalizedJob[]): void {
    if (this.cache.size >= this.maxEntries) {
      const stats = this.cache.getStats()
      if (stats.keys.length > 0) {
        this.cache.delete(stats.keys[0]!)
      }
    }
    this.cache.set(key, jobs, this.ttlMs)
  }

  /**
   * Invalidate a specific cache entry.
   */
  invalidate(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Clear all cached entries.
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get all non-expired cached job arrays for scanning purposes.
   */
  getAllJobs(): NormalizedJob[][] {
    return this.cache.values()
  }

  /**
   * Get cache stats for monitoring.
   */
  getStats(): { size: number; totalHits: number; keys: string[] } {
    return this.cache.getStats()
  }
}

/**
 * Singleton instance used across the application.
 */
export const aggregatedCache = new AggregatedCache()
