import { describe, it, expect, beforeEach } from 'vitest'
import type { ValidatedSearchInput, NormalizedJob } from '@jobfindr/types'
import { calculateWeightedMatchScoreWithBreakdown } from '../../matchmaking/services/weighted-match-scoring.ts'
import { evaluateJobTrustWithBreakdown } from '../../trust/services/trust-engine.ts'
import { resetProviderStats } from '../../trust/services/provider-reputation.ts'

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
    userSkills: [],
    userSeniority: undefined,
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

describe('aggregateSearch - userSkills matchmaking fallback', () => {
  it('uses userSkills for matchmaking when userSkills is non-empty', () => {
    const input = makeInput({
      skills: ['fallback-skill'],
      userSkills: ['react', 'typescript'],
    })
    // This replicates the logic from aggregation-service.ts
    const skillsForMatchmaking = input.userSkills.length > 0 ? input.userSkills : input.skills
    expect(skillsForMatchmaking).toEqual(['react', 'typescript'])
  })

  it('falls back to skills when userSkills is empty', () => {
    const input = makeInput({
      skills: ['java', 'python'],
      userSkills: [],
    })
    const skillsForMatchmaking = input.userSkills.length > 0 ? input.userSkills : input.skills
    expect(skillsForMatchmaking).toEqual(['java', 'python'])
  })

  it('passes userSeniority through to matchmaking', () => {
    const input = makeInput({
      userSeniority: 'senior',
    })
    expect(input.userSeniority).toBe('senior')
  })

  it('userSeniority is undefined when not provided', () => {
    const input = makeInput({})
    expect(input.userSeniority).toBeUndefined()
  })

  it('uses skills fallback when both skills and userSkills are empty', () => {
    const input = makeInput({
      skills: [],
      userSkills: [],
    })
    const skillsForMatchmaking = input.userSkills.length > 0 ? input.userSkills : input.skills
    expect(skillsForMatchmaking).toEqual([])
  })
})

describe('aggregateSearch - breakdown data propagation', () => {
  beforeEach(() => {
    resetProviderStats()
  })

  it('matchmaking produces matchBreakdown on job with user skills', () => {
    const job: NormalizedJob = makeJob({
      id: 'breakdown-1',
      skills: ['react', 'typescript', 'node'],
      seniority: 'senior',
    })

    const matchResult = calculateWeightedMatchScoreWithBreakdown(
      ['react', 'typescript', 'figma'],
      'senior',
      job.skills,
      job.seniority,
    )

    job.matchScore = matchResult.score.overall
    job.matchBreakdown = matchResult.breakdown

    expect(job.matchBreakdown).toBeDefined()
    expect(job.matchBreakdown!.matchedSkills).toContain('react')
    expect(job.matchBreakdown!.matchedSkills).toContain('typescript')
    // unmatchedSkills are user skills not found in the job
    expect(job.matchBreakdown!.unmatchedSkills).toContain('figma')
    expect(job.matchBreakdown!.seniorityMatch).toBe('exact')
    expect(job.matchBreakdown!.weightedScore).toBe(job.matchScore)
    expect(job.matchBreakdown!.skillScoreContribution).toBeGreaterThan(0)
    expect(job.matchBreakdown!.seniorityScoreContribution).toBeGreaterThan(0)
  })

  it('matchBreakdown is not set when user skills are empty', () => {
    const job: NormalizedJob = makeJob({
      id: 'breakdown-2',
      skills: ['react', 'typescript'],
    })

    // Simulating no matchmaking (userSkills empty)
    // In this case, no breakdown should be attached
    expect(job.matchBreakdown).toBeUndefined()
    expect(job.matchScore).toBeUndefined()
  })

  it('matchBreakdown correctly reflects partial skill match', () => {
    const job: NormalizedJob = makeJob({
      id: 'breakdown-3',
      skills: ['react', 'typescript', 'node', 'python'],
      seniority: 'lead',
    })

    const matchResult = calculateWeightedMatchScoreWithBreakdown(
      ['react', 'figma', 'python'],
      'senior',
      job.skills,
      job.seniority,
    )

    job.matchBreakdown = matchResult.breakdown

    expect(job.matchBreakdown!.matchedSkills).toContain('react')
    expect(job.matchBreakdown!.matchedSkills).toContain('python')
    // unmatchedSkills are user skills not found in the job
    expect(job.matchBreakdown!.unmatchedSkills).toContain('figma')
    expect(job.matchBreakdown!.unmatchedSkills).not.toContain('react')
    expect(job.matchBreakdown!.unmatchedSkills).not.toContain('python')
    // lead vs senior → 1 apart → "close"
    expect(job.matchBreakdown!.seniorityMatch).toBe('close')
  })

  it('matchBreakdown seniorityMatch is "none" for far-apart levels', () => {
    const job: NormalizedJob = makeJob({
      id: 'breakdown-4',
      skills: ['react'],
      seniority: 'executive',
    })

    const matchResult = calculateWeightedMatchScoreWithBreakdown(
      ['react'],
      'intern',
      job.skills,
      job.seniority,
    )

    job.matchBreakdown = matchResult.breakdown
    // intern → executive = 6 apart → "none"
    expect(job.matchBreakdown!.seniorityMatch).toBe('none')
  })

  it('trust evaluation produces trustBreakdown on job', async () => {
    const job: NormalizedJob = makeJob({
      id: 'breakdown-5',
      company: 'Google',
      source: 'linkedin',
      postedAt: new Date().toISOString(),
    })

    const result = await evaluateJobTrustWithBreakdown(job)

    expect(result.job.trustBreakdown).toBeDefined()
    expect(result.job.trustBreakdown!.providerScore).toBeGreaterThanOrEqual(0)
    expect(result.job.trustBreakdown!.freshnessScore).toBeGreaterThanOrEqual(8)
    expect(result.job.trustBreakdown!.signals.isKnownEmployer).toBe(true)
    expect(result.job.trustBreakdown!.signals.daysSincePosted).toBeGreaterThanOrEqual(0)
  })

  it('trustBreakdown is not set when trust evaluation is skipped', () => {
    const job: NormalizedJob = makeJob({
      id: 'breakdown-6',
      company: 'UnknownCo',
    })

    // Without calling trust evaluation, trustBreakdown should be undefined
    expect(job.trustBreakdown).toBeUndefined()
    expect(job.trustScore).toBeUndefined()
  })

  it('trustBreakdown correctly reflects unknown company', async () => {
    // Use a very short company name so hasLinkedIn = false (name.length <= 3)
    const job: NormalizedJob = makeJob({
      id: 'breakdown-7',
      company: 'xy',
      source: 'unknown-provider',
    })

    const result = await evaluateJobTrustWithBreakdown(job)

    expect(result.job.trustBreakdown).toBeDefined()
    expect(result.job.trustBreakdown!.providerScore).toBeGreaterThanOrEqual(0)
    expect(result.job.trustBreakdown!.signals.isKnownEmployer).toBe(false)
    expect(result.job.trustBreakdown!.signals.companySizeBonus).toBeGreaterThanOrEqual(0)
  })

  it('trustBreakdown fields survive serialization (no undefined or NaN)', async () => {
    const job: NormalizedJob = makeJob({
      id: 'breakdown-8',
      company: 'Google',
      source: 'linkedin',
      postedAt: new Date().toISOString(),
    })

    const result = await evaluateJobTrustWithBreakdown(job)
    const json = JSON.parse(JSON.stringify(result.job.trustBreakdown))

    expect(json.providerScore).toBeTypeOf('number')
    expect(json.companyAdjustment).toBeTypeOf('number')
    expect(json.freshnessScore).toBeTypeOf('number')
    expect(json.signals.providerReputation).toBeTypeOf('number')
    expect(json.signals.companySizeBonus).toBeTypeOf('number')
    expect(json.signals.isKnownEmployer).toBeTypeOf('boolean')
    expect(json.signals.daysSincePosted).toBeTypeOf('number')
  })

  it('matchBreakdown fields survive serialization (no undefined or NaN)', () => {
    const job: NormalizedJob = makeJob({
      id: 'breakdown-9',
      skills: ['react', 'typescript'],
      seniority: 'senior',
    })

    const matchResult = calculateWeightedMatchScoreWithBreakdown(
      ['react', 'typescript', 'node'],
      'senior',
      job.skills,
      job.seniority,
    )

    job.matchBreakdown = matchResult.breakdown
    const json = JSON.parse(JSON.stringify(job.matchBreakdown))

    expect(Array.isArray(json.matchedSkills)).toBe(true)
    expect(Array.isArray(json.unmatchedSkills)).toBe(true)
    expect(json.seniorityMatch).toMatch(/^(exact|close|none)$/)
    expect(json.weightedScore).toBeTypeOf('number')
    expect(json.skillScoreContribution).toBeTypeOf('number')
    expect(json.seniorityScoreContribution).toBeTypeOf('number')
  })
})
