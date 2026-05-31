/**
 * Provider-specific cache layer.
 * TASK-085: Create Provider Cache Layer
 */
import { InMemoryCache } from './in-memory-cache.ts'
import { env } from '../config/env.ts'
import type { NormalizedJob } from '@jobfindr/types'
import { recordProviderCacheHit, recordProviderCacheMiss } from '../shared/metrics/provider-metrics.ts'

type CacheKey = string

function buildCacheKey(providerName: string, queryKey: string): CacheKey {
  return `${providerName}:${queryKey}`
}

/**
 * Build a normalized query key from search parameters.
 */
function buildQueryKey(params: {
  q: string
  skills: string[]
  seniority: string[]
  remoteMode: string[]
  page: number
  pageSize: number
}): string {
  const parts = [
    params.q,
    params.skills.sort().join(','),
    params.seniority.sort().join(','),
    params.remoteMode.sort().join(','),
    `p${params.page}`,
    `s${params.pageSize}`,
  ]
  return parts.filter(Boolean).join('|')
}

export class ProviderCacheLayer {
  private cache: InMemoryCache<NormalizedJob[]>

  constructor(ttlMs?: number) {
    this.cache = new InMemoryCache<NormalizedJob[]>(
      ttlMs ?? env.CACHE_JOBS_TTL * 1000
    )
  }

  get(
    providerName: string,
    params: {
      q: string
      skills: string[]
      seniority: string[]
      remoteMode: string[]
      page: number
      pageSize: number
    }
  ): NormalizedJob[] | undefined {
    const key = buildCacheKey(providerName, buildQueryKey(params))
    const result = this.cache.get(key)
    if (result) {
      recordProviderCacheHit(providerName)
      return result
    }
    recordProviderCacheMiss(providerName)
    return undefined
  }

  set(
    providerName: string,
    params: {
      q: string
      skills: string[]
      seniority: string[]
      remoteMode: string[]
      page: number
      pageSize: number
    },
    jobs: NormalizedJob[]
  ): void {
    const key = buildCacheKey(providerName, buildQueryKey(params))
    this.cache.set(key, jobs)
  }

  invalidate(_providerName: string): void {
    // Simple approach: clear everything (acceptable for MVP)
    this.cache.clear()
  }

  clear(): void {
    this.cache.clear()
  }

  getStats() {
    return this.cache.getStats()
  }
}
