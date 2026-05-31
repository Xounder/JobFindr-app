import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { AggregatedCache } from './aggregated-cache.ts'
import type { NormalizedJob } from '@jobfindr/types'

function makeJob(id: string): NormalizedJob {
  return {
    id,
    title: 'Job ' + id,
    company: 'Company',
    description: 'desc',
    skills: [],
    url: 'https://example.com',
    source: 'test',
  }
}

describe('AggregatedCache', () => {
  let cache: AggregatedCache

  beforeEach(() => {
    cache = new AggregatedCache(120_000, 50)
  })

  describe('buildKey', () => {
    it('excludes page and pageSize from the cache key', () => {
      const key1 = cache.buildKey({ q: 'engineer', page: 1, pageSize: 20, skills: [] })
      const key2 = cache.buildKey({ q: 'engineer', page: 2, pageSize: 10, skills: [] })

      expect(key1).toBe(key2)
    })

    it('includes filter parameters in the cache key', () => {
      const key1 = cache.buildKey({ q: 'engineer', remoteMode: ['remote'], seniority: ['senior'] })
      const key2 = cache.buildKey({ q: 'engineer', remoteMode: ['hybrid'], seniority: ['senior'] })

      expect(key1).not.toBe(key2)
    })

    it('produces the same key for the same params regardless of property order', () => {
      const key1 = cache.buildKey({ q: 'engineer', skills: ['TypeScript'], countries: ['US'] })
      const key2 = cache.buildKey({ countries: ['US'], q: 'engineer', skills: ['TypeScript'] })

      expect(key1).toBe(key2)
    })

    it('produces different keys for different q values', () => {
      const key1 = cache.buildKey({ q: 'engineer' })
      const key2 = cache.buildKey({ q: 'designer' })

      expect(key1).not.toBe(key2)
    })
  })

  describe('get and set', () => {
    it('returns undefined for a missing key', () => {
      const result = cache.get('nonexistent')
      expect(result).toBeUndefined()
    })

    it('returns cached jobs for a valid key', () => {
      const jobs: NormalizedJob[] = [makeJob('1'), makeJob('2')]
      const key = cache.buildKey({ q: 'test' })

      cache.set(key, jobs)
      const result = cache.get(key)

      expect(result).toBeDefined()
      expect(result).toHaveLength(2)
      expect(result![0]!.id).toBe('1')
      expect(result![1]!.id).toBe('2')
    })

    it('returns a reference to the same array (same object identity)', () => {
      const jobs: NormalizedJob[] = [makeJob('1')]
      const key = cache.buildKey({ q: 'test' })

      cache.set(key, jobs)
      const result = cache.get(key)

      expect(result).toBe(jobs)
    })
  })

  describe('invalidate', () => {
    it('removes a specific cache entry', () => {
      const jobs: NormalizedJob[] = [makeJob('1')]
      const key = cache.buildKey({ q: 'test' })

      cache.set(key, jobs)
      expect(cache.get(key)).toBeDefined()

      cache.invalidate(key)
      expect(cache.get(key)).toBeUndefined()
    })

    it('does not affect other cache entries', () => {
      const key1 = cache.buildKey({ q: 'engineer' })
      const key2 = cache.buildKey({ q: 'designer' })

      cache.set(key1, [makeJob('1')])
      cache.set(key2, [makeJob('2')])

      cache.invalidate(key1)

      expect(cache.get(key1)).toBeUndefined()
      expect(cache.get(key2)).toBeDefined()
    })
  })

  describe('clear', () => {
    it('removes all cache entries', () => {
      cache.set(cache.buildKey({ q: 'engineer' }), [makeJob('1')])
      cache.set(cache.buildKey({ q: 'designer' }), [makeJob('2')])

      cache.clear()

      expect(cache.getStats().size).toBe(0)
    })
  })

  describe('TTL expiry', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('returns jobs before TTL expires', () => {
      const jobs: NormalizedJob[] = [makeJob('1')]
      const key = cache.buildKey({ q: 'test' })

      cache.set(key, jobs)

      // Advance by less than TTL (120s)
      vi.advanceTimersByTime(60_000)
      expect(cache.get(key)).toBeDefined()
    })

    it('returns undefined after TTL expires', () => {
      const jobs: NormalizedJob[] = [makeJob('1')]
      const key = cache.buildKey({ q: 'test' })

      cache.set(key, jobs)

      // Advance past TTL (120s)
      vi.advanceTimersByTime(121_000)
      expect(cache.get(key)).toBeUndefined()
    })
  })

  describe('max entries limit', () => {
    it('enforces maxEntries by evicting oldest entry', () => {
      const smallCache = new AggregatedCache(120_000, 3)

      smallCache.set(smallCache.buildKey({ q: 'job1' }), [makeJob('1')])
      smallCache.set(smallCache.buildKey({ q: 'job2' }), [makeJob('2')])
      smallCache.set(smallCache.buildKey({ q: 'job3' }), [makeJob('3')])

      expect(smallCache.getStats().size).toBe(3)

      // Adding a 4th entry should evict the oldest (job1)
      smallCache.set(smallCache.buildKey({ q: 'job4' }), [makeJob('4')])

      expect(smallCache.getStats().size).toBe(3)
      // The first entry should be evicted
      const key1 = smallCache.buildKey({ q: 'job1' })
      expect(smallCache.get(key1)).toBeUndefined()
      // Newer entries should still exist
      expect(smallCache.get(smallCache.buildKey({ q: 'job4' }))).toBeDefined()
    })
  })

  describe('getAllJobs', () => {
    it('returns all non-expired cached job arrays', () => {
      cache.set(cache.buildKey({ q: 'engineer' }), [makeJob('1'), makeJob('2')])
      cache.set(cache.buildKey({ q: 'designer' }), [makeJob('3')])

      const all = cache.getAllJobs()

      expect(all).toHaveLength(2)
      expect(all[0]!.map((j) => j.id)).toEqual(['1', '2'])
      expect(all[1]!.map((j) => j.id)).toEqual(['3'])
    })

    it('returns empty array when cache is empty', () => {
      const all = cache.getAllJobs()
      expect(all).toHaveLength(0)
    })
  })

  describe('getStats', () => {
    it('returns correct size and keys', () => {
      cache.set(cache.buildKey({ q: 'engineer' }), [makeJob('1')])
      cache.set(cache.buildKey({ q: 'designer' }), [makeJob('2')])

      const stats = cache.getStats()

      expect(stats.size).toBe(2)
      expect(stats.keys).toHaveLength(2)
    })

    it('returns zero size for empty cache', () => {
      const stats = cache.getStats()
      expect(stats.size).toBe(0)
      expect(stats.keys).toHaveLength(0)
    })
  })
})
