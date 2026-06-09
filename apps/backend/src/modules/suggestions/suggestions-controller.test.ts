import { describe, it, expect, beforeEach } from 'vitest'
import { getUniqueCompaniesFromCache } from './suggestions-controller.ts'
import { aggregatedCache } from '../../cache/aggregated-cache.ts'
import type { NormalizedJob } from '@jobfindr/types'

function makeJob(id: string, company: string): NormalizedJob {
  return {
    id,
    title: 'Job ' + id,
    company,
    description: 'desc',
    skills: [],
    url: 'https://example.com',
    source: 'test',
  }
}

describe('getUniqueCompaniesFromCache', () => {
  beforeEach(() => {
    aggregatedCache.clear()
  })

  it('returns companies from cache when cache has data', () => {
    aggregatedCache.set(aggregatedCache.buildKey({ q: 'engineer' }), [
      makeJob('1', 'Google'),
      makeJob('2', 'Meta'),
    ])
    aggregatedCache.set(aggregatedCache.buildKey({ q: 'designer' }), [
      makeJob('3', 'Apple'),
    ])

    const companies = getUniqueCompaniesFromCache()

    expect(companies).toEqual(['Apple', 'Google', 'Meta'])
  })

  it('returns fallback list when cache is empty', () => {
    const companies = getUniqueCompaniesFromCache()

    expect(companies).toEqual([
      'Stripe', 'Airbnb', 'Coinbase', 'Dropbox',
      'Netflix', 'Notion', 'Linear',
    ])
  })

  it('returns no duplicates', () => {
    aggregatedCache.set(aggregatedCache.buildKey({ q: 'engineer' }), [
      makeJob('1', 'Google'),
      makeJob('2', 'Google'),
    ])
    aggregatedCache.set(aggregatedCache.buildKey({ q: 'backend' }), [
      makeJob('3', 'Google'),
    ])

    const companies = getUniqueCompaniesFromCache()

    const googleCount = companies.filter((c) => c === 'Google').length
    expect(googleCount).toBe(1)
    expect(companies).toEqual(['Google'])
  })

  it('returns companies in alphabetical order', () => {
    aggregatedCache.set(aggregatedCache.buildKey({ q: 'test' }), [
      makeJob('1', 'Zeta'),
      makeJob('2', 'Alpha'),
      makeJob('3', 'Beta'),
    ])

    const companies = getUniqueCompaniesFromCache()

    expect(companies).toEqual(['Alpha', 'Beta', 'Zeta'])
  })

  it('returns fallback when cache has only empty job arrays', () => {
    aggregatedCache.set(aggregatedCache.buildKey({ q: 'empty' }), [])

    const companies = getUniqueCompaniesFromCache()

    expect(companies).toEqual([
      'Stripe', 'Airbnb', 'Coinbase', 'Dropbox',
      'Netflix', 'Notion', 'Linear',
    ])
  })

  it('handles multiple cached entries with overlapping companies', () => {
    aggregatedCache.set(aggregatedCache.buildKey({ q: 'frontend' }), [
      makeJob('1', 'Google'),
      makeJob('2', 'Meta'),
    ])
    aggregatedCache.set(aggregatedCache.buildKey({ q: 'backend' }), [
      makeJob('3', 'Google'),
      makeJob('4', 'Amazon'),
    ])

    const companies = getUniqueCompaniesFromCache()

    expect(companies).toEqual(['Amazon', 'Google', 'Meta'])
  })
})
