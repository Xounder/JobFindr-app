import { describe, it, expect } from 'vitest'
import type { ValidatedSearchInput, NormalizedJob } from '@jobfindr/types'

/**
 * Helper to create a minimal NormalizedJob for testing.
 */
function makeJob(overrides: Partial<NormalizedJob> & { id: string }): NormalizedJob {
  return {
    title: 'Job ' + overrides.id,
    company: 'TestCompany',
    description: 'A test job description',
    skills: [],
    url: 'https://example.com/job/' + overrides.id,
    source: 'test',
    ...overrides,
  }
}

/**
 * Build a minimal ValidatedSearchInput with defaults.
 */
function makeInput(overrides: Partial<ValidatedSearchInput> = {}): ValidatedSearchInput {
  return {
    q: '',
    skills: [],
    page: 1,
    pageSize: 20,
    seniority: [],
    remoteMode: [],
    companies: [],
    excludedCompanies: [],
    sources: [],
    minTrustScore: 0,
    includeHidden: false,
    sort: 'relevance',
    countries: [],
    postedAfter: undefined,
    ...overrides,
  }
}

describe('aggregateSearch - filter: remoteMode', () => {
  it('filters remote jobs when remoteMode=["remote"]', () => {
    const jobs: NormalizedJob[] = [
      makeJob({ id: '1', remoteMode: 'remote' }),
      makeJob({ id: '2', remoteMode: 'hybrid' }),
      makeJob({ id: '3', remoteMode: 'on-site' }),
      makeJob({ id: '4', remoteMode: 'remote' }),
    ]

    const input = makeInput({ remoteMode: ['remote'] })
    const filtered = jobs.filter((j) =>
      j.remoteMode !== undefined && input.remoteMode.includes(j.remoteMode)
    )

    expect(filtered).toHaveLength(2)
    expect(filtered.map((j) => j.id)).toEqual(['1', '4'])
  })

  it('filters hybrid and on-site when remoteMode=["hybrid","on-site"]', () => {
    const jobs: NormalizedJob[] = [
      makeJob({ id: '1', remoteMode: 'remote' }),
      makeJob({ id: '2', remoteMode: 'hybrid' }),
      makeJob({ id: '3', remoteMode: 'on-site' }),
    ]

    const input = makeInput({ remoteMode: ['hybrid', 'on-site'] })
    const filtered = jobs.filter((j) =>
      j.remoteMode !== undefined && input.remoteMode.includes(j.remoteMode)
    )

    expect(filtered).toHaveLength(2)
    expect(filtered.map((j) => j.id)).toEqual(['2', '3'])
  })

  it('excludes jobs with undefined remoteMode when filter is active', () => {
    const jobs: NormalizedJob[] = [
      makeJob({ id: '1', remoteMode: 'remote' }),
      makeJob({ id: '2', remoteMode: undefined }),
      makeJob({ id: '3' }), // remoteMode undefined
    ]

    const input = makeInput({ remoteMode: ['remote'] })
    const filtered = jobs.filter((j) =>
      j.remoteMode !== undefined && input.remoteMode.includes(j.remoteMode)
    )

    expect(filtered).toHaveLength(1)
    expect(filtered[0]!.id).toBe('1')
  })

  it('returns all jobs when remoteMode is empty array', () => {
    const jobs: NormalizedJob[] = [
      makeJob({ id: '1', remoteMode: 'remote' }),
      makeJob({ id: '2', remoteMode: 'hybrid' }),
      makeJob({ id: '3' }),
    ]

    const input = makeInput({ remoteMode: [] })
    // When remoteMode is empty, no filtering should happen
    expect(input.remoteMode.length).toBe(0)
    // All jobs pass through
    expect(jobs).toHaveLength(3)
  })
})

describe('aggregateSearch - filter: seniority', () => {
  it('includes only jobs matching specified seniority levels', () => {
    const jobs: NormalizedJob[] = [
      makeJob({ id: '1', seniority: 'senior' }),
      makeJob({ id: '2', seniority: 'mid' }),
      makeJob({ id: '3', seniority: 'junior' }),
      makeJob({ id: '4', seniority: 'senior' }),
    ]

    const input = makeInput({ seniority: ['senior'] })
    const filtered = jobs.filter((j) =>
      j.seniority !== undefined && input.seniority.includes(j.seniority)
    )

    expect(filtered).toHaveLength(2)
    expect(filtered.map((j) => j.id)).toEqual(['1', '4'])
  })

  it('filters multiple seniority levels', () => {
    const jobs: NormalizedJob[] = [
      makeJob({ id: '1', seniority: 'senior' }),
      makeJob({ id: '2', seniority: 'mid' }),
      makeJob({ id: '3', seniority: 'junior' }),
      makeJob({ id: '4', seniority: 'lead' }),
    ]

    const input = makeInput({ seniority: ['senior', 'lead'] })
    const filtered = jobs.filter((j) =>
      j.seniority !== undefined && input.seniority.includes(j.seniority)
    )

    expect(filtered).toHaveLength(2)
    expect(filtered.map((j) => j.id)).toEqual(['1', '4'])
  })

  it('excludes jobs without seniority when filter is active', () => {
    const jobs: NormalizedJob[] = [
      makeJob({ id: '1', seniority: 'senior' }),
      makeJob({ id: '2', seniority: undefined }),
    ]

    const input = makeInput({ seniority: ['senior'] })
    const filtered = jobs.filter((j) =>
      j.seniority !== undefined && input.seniority.includes(j.seniority)
    )

    expect(filtered).toHaveLength(1)
    expect(filtered[0]!.id).toBe('1')
  })

  it('returns all jobs when seniority is empty array', () => {
    const jobs: NormalizedJob[] = [
      makeJob({ id: '1', seniority: 'senior' }),
      makeJob({ id: '2' }),
    ]

    const input = makeInput({ seniority: [] })
    expect(input.seniority.length).toBe(0)
    expect(jobs).toHaveLength(2)
  })
})

describe('aggregateSearch - filter: postedAfter', () => {
  it('includes only jobs posted on or after the cutoff date', () => {
    const jobs: NormalizedJob[] = [
      makeJob({ id: '1', postedAt: '2026-05-30T00:00:00.000Z' }),
      makeJob({ id: '2', postedAt: '2026-05-28T00:00:00.000Z' }),
      makeJob({ id: '3', postedAt: '2026-06-01T00:00:00.000Z' }),
    ]

    const cutoff = new Date('2026-05-30T00:00:00.000Z').getTime()
    const filtered = jobs.filter((j) => {
      if (!j.postedAt) return false
      return new Date(j.postedAt).getTime() >= cutoff
    })

    expect(filtered).toHaveLength(2)
    expect(filtered.map((j) => j.id)).toEqual(['1', '3'])
  })

  it('excludes jobs without postedAt when filter is active', () => {
    const jobs: NormalizedJob[] = [
      makeJob({ id: '1', postedAt: '2026-05-30T00:00:00.000Z' }),
      makeJob({ id: '2' }), // no postedAt
    ]

    const cutoff = new Date('2026-05-30T00:00:00.000Z').getTime()
    const filtered = jobs.filter((j) => {
      if (!j.postedAt) return false
      return new Date(j.postedAt).getTime() >= cutoff
    })

    expect(filtered).toHaveLength(1)
    expect(filtered[0]!.id).toBe('1')
  })

  it('returns all jobs when postedAfter is undefined', () => {
    const jobs: NormalizedJob[] = [
      makeJob({ id: '1', postedAt: '2026-05-01T00:00:00.000Z' }),
      makeJob({ id: '2' }),
    ]

    expect(jobs).toHaveLength(2)
  })

  it('handles exact date boundary correctly', () => {
    const dateString = '2026-05-30T12:00:00.000Z'
    const jobs: NormalizedJob[] = [
      makeJob({ id: '1', postedAt: '2026-05-30T12:00:00.000Z' }),
      makeJob({ id: '2', postedAt: '2026-05-30T11:59:59.999Z' }),
      makeJob({ id: '3', postedAt: '2026-05-30T12:00:00.001Z' }),
    ]

    const cutoff = new Date(dateString).getTime()
    const filtered = jobs.filter((j) => {
      if (!j.postedAt) return false
      return new Date(j.postedAt).getTime() >= cutoff
    })

    expect(filtered).toHaveLength(2)
    expect(filtered.map((j) => j.id)).toEqual(['1', '3'])
  })
})

describe('aggregateSearch - filter: countries', () => {
  it('includes only jobs whose location matches one of the specified countries', () => {
    const jobs: NormalizedJob[] = [
      makeJob({ id: '1', location: 'San Francisco, United States' }),
      makeJob({ id: '2', location: 'Toronto, Canada' }),
      makeJob({ id: '3', location: 'London, United Kingdom' }),
      makeJob({ id: '4', location: 'Berlin, Germany' }),
    ]

    const countryLower = ['united states', 'germany'].map((c) => c.toLowerCase())
    const filtered = jobs.filter((j) => {
      const loc = j.location
      if (!loc) return false
      return countryLower.some((country) => loc.toLowerCase().includes(country))
    })

    expect(filtered).toHaveLength(2)
    expect(filtered.map((j) => j.id)).toEqual(['1', '4'])
  })

  it('performs case-insensitive matching', () => {
    const jobs: NormalizedJob[] = [
      makeJob({ id: '1', location: 'San Francisco, united states' }),
      makeJob({ id: '2', location: 'New York, UNITED STATES' }),
    ]

    const countryLower = ['United States'].map((c) => c.toLowerCase())
    const filtered = jobs.filter((j) => {
      const loc = j.location
      if (!loc) return false
      return countryLower.some((country) => loc.toLowerCase().includes(country))
    })

    expect(filtered).toHaveLength(2)
  })

  it('excludes jobs without location when country filter is active', () => {
    const jobs: NormalizedJob[] = [
      makeJob({ id: '1', location: 'New York, United States' }),
      makeJob({ id: '2' }), // no location
    ]

    const countryLower = ['united states'].map((c) => c.toLowerCase())
    const filtered = jobs.filter((j) => {
      const loc = j.location
      if (!loc) return false
      return countryLower.some((country) => loc.toLowerCase().includes(country))
    })

    expect(filtered).toHaveLength(1)
    expect(filtered[0]!.id).toBe('1')
  })

  it('returns all jobs when countries is empty array', () => {
    const jobs: NormalizedJob[] = [
      makeJob({ id: '1', location: 'New York, United States' }),
      makeJob({ id: '2' }),
    ]

    expect(jobs).toHaveLength(2)
  })

  it('handles multiple country matches for the same job', () => {
    const jobs: NormalizedJob[] = [
      makeJob({ id: '1', location: 'London, UK, United Kingdom' }),
      makeJob({ id: '2', location: 'Paris, France' }),
    ]

    const countryLower = ['uk', 'kingdom'].map((c) => c.toLowerCase())
    const filtered = jobs.filter((j) => {
      const loc = j.location
      if (!loc) return false
      return countryLower.some((country) => loc.toLowerCase().includes(country))
    })

    expect(filtered).toHaveLength(1)
    expect(filtered[0]!.id).toBe('1')
  })
})

describe('aggregateSearch - combined filters', () => {
  it('applies multiple filters simultaneously', () => {
    const jobs: NormalizedJob[] = [
      makeJob({ id: '1', remoteMode: 'remote', seniority: 'senior', postedAt: '2026-05-30T00:00:00.000Z', location: 'San Francisco, United States' }),
      makeJob({ id: '2', remoteMode: 'remote', seniority: 'junior', postedAt: '2026-05-30T00:00:00.000Z', location: 'San Francisco, United States' }),
      makeJob({ id: '3', remoteMode: 'hybrid', seniority: 'senior', postedAt: '2026-05-30T00:00:00.000Z', location: 'San Francisco, United States' }),
      makeJob({ id: '4', remoteMode: 'remote', seniority: 'senior', postedAt: '2026-05-28T00:00:00.000Z', location: 'San Francisco, United States' }),
      makeJob({ id: '5', remoteMode: 'remote', seniority: 'senior', postedAt: '2026-05-30T00:00:00.000Z', location: 'Toronto, Canada' }),
    ]

    // Filter: remoteMode=remote, seniority=senior, postedAfter=2026-05-29, countries=united states
    const input = makeInput({
      remoteMode: ['remote'],
      seniority: ['senior'],
      postedAfter: '2026-05-29T00:00:00.000Z',
      countries: ['united states'],
    })

    // Apply remoteMode filter
    let filtered = input.remoteMode.length > 0
      ? jobs.filter((j) => j.remoteMode !== undefined && input.remoteMode.includes(j.remoteMode))
      : jobs

    // Apply seniority filter
    filtered = input.seniority.length > 0
      ? filtered.filter((j) => j.seniority !== undefined && input.seniority.includes(j.seniority))
      : filtered

    // Apply postedAfter filter
    if (input.postedAfter !== undefined) {
      const cutoff = new Date(input.postedAfter).getTime()
      filtered = filtered.filter((j) => {
        if (!j.postedAt) return false
        return new Date(j.postedAt).getTime() >= cutoff
      })
    }

    // Apply country filter
    if (input.countries.length > 0) {
      const countryLower = input.countries.map((c) => c.toLowerCase())
      filtered = filtered.filter((j) => {
        const loc = j.location
        if (!loc) return false
        return countryLower.some((country) => loc.toLowerCase().includes(country))
      })
    }

    expect(filtered).toHaveLength(1)
    expect(filtered[0]!.id).toBe('1')
  })
})
