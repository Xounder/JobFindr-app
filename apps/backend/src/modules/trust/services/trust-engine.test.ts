/**
 * Tests for Trust Engine — TrustBreakdown generation.
 * TASK-005: Backend Trust & Match Breakdown Data
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  evaluateJobTrustWithBreakdown,
  evaluateJobsTrustWithBreakdown,
  evaluateJobTrust,
  evaluateJobsTrust,
} from './trust-engine.ts'
import { resetProviderStats } from './provider-reputation.ts'
import type { NormalizedJob } from '@jobfindr/types'

/**
 * Helper to create a minimal NormalizedJob for testing.
 */
function makeJob(overrides: Partial<NormalizedJob> & { id: string }): NormalizedJob {
  return {
    title: 'Job ' + overrides.id,
    company: 'TestCompany',
    description: 'A test job description',
    skills: ['react', 'typescript'],
    url: 'https://example.com/job/' + overrides.id,
    source: 'linkedin',
    ...overrides,
  }
}

describe('evaluateJobTrustWithBreakdown', () => {
  beforeEach(() => {
    resetProviderStats()
  })

  it('returns TrustEvaluationWithBreakdown with trustBreakdown field', async () => {
    const job = makeJob({ id: '1', company: 'Google', source: 'linkedin' })
    const result = await evaluateJobTrustWithBreakdown(job)

    expect(result).toHaveProperty('trustBreakdown')
    expect(result.trustBreakdown).toHaveProperty('providerScore')
    expect(result.trustBreakdown).toHaveProperty('companyAdjustment')
    expect(result.trustBreakdown).toHaveProperty('freshnessScore')
    expect(result.trustBreakdown).toHaveProperty('signals')
  })

  it('populates providerScore from trust score providerReputation', async () => {
    const job = makeJob({ id: '2', company: 'Google', source: 'linkedin' })
    const result = await evaluateJobTrustWithBreakdown(job)

    expect(result.trustBreakdown.providerScore).toBeGreaterThanOrEqual(0)
    expect(result.trustBreakdown.providerScore).toBeLessThanOrEqual(10)
  })

  it('populates signals.providerReputation as a number', async () => {
    const job = makeJob({ id: '3', company: 'Google', source: 'linkedin' })
    const result = await evaluateJobTrustWithBreakdown(job)

    expect(typeof result.trustBreakdown.signals.providerReputation).toBe('number')
    expect(result.trustBreakdown.signals.providerReputation).toBeGreaterThanOrEqual(0)
  })

  it('populates signals.companySizeBonus as a number', async () => {
    const job = makeJob({ id: '4', company: 'Google', source: 'linkedin' })
    const result = await evaluateJobTrustWithBreakdown(job)

    expect(typeof result.trustBreakdown.signals.companySizeBonus).toBe('number')
    expect(result.trustBreakdown.signals.companySizeBonus).toBeGreaterThanOrEqual(0)
  })

  it('populates signals.isKnownEmployer as a boolean', async () => {
    const job = makeJob({ id: '5', company: 'Google', source: 'linkedin' })
    const result = await evaluateJobTrustWithBreakdown(job)

    expect(typeof result.trustBreakdown.signals.isKnownEmployer).toBe('boolean')
  })

  it('populates signals.daysSincePosted as a number', async () => {
    const job = makeJob({ id: '6', company: 'Google', source: 'linkedin', postedAt: new Date().toISOString() })
    const result = await evaluateJobTrustWithBreakdown(job)

    expect(typeof result.trustBreakdown.signals.daysSincePosted).toBe('number')
    expect(result.trustBreakdown.signals.daysSincePosted).toBeGreaterThanOrEqual(0)
  })

  it('returns high freshnessScore for recently posted jobs', async () => {
    const recentJob = makeJob({ id: '7', company: 'Google', source: 'linkedin', postedAt: new Date().toISOString() })
    const result = await evaluateJobTrustWithBreakdown(recentJob)

    expect(result.trustBreakdown.freshnessScore).toBeGreaterThanOrEqual(8)
  })

  it('returns low freshnessScore for old jobs', async () => {
    const oldDate = new Date()
    oldDate.setDate(oldDate.getDate() - 90)
    const oldJob = makeJob({ id: '8', company: 'Google', source: 'linkedin', postedAt: oldDate.toISOString() })
    const result = await evaluateJobTrustWithBreakdown(oldJob)

    expect(result.trustBreakdown.freshnessScore).toBeLessThanOrEqual(2)
  })

  it('trustScore.overall is higher for recently posted jobs (freshness effect)', async () => {
    // Use different companies to avoid cache collision (cache key is source:company)
    const recentJob = makeJob({ id: '9a', company: 'GoogleRecent', source: 'linkedin', postedAt: new Date().toISOString() })
    const recentResult = await evaluateJobTrustWithBreakdown(recentJob)

    const oldDate = new Date()
    oldDate.setDate(oldDate.getDate() - 90)
    const oldJob = makeJob({ id: '9b', company: 'GoogleOld', source: 'linkedin', postedAt: oldDate.toISOString() })
    const oldResult = await evaluateJobTrustWithBreakdown(oldJob)

    // Recent job should have higher overall trust due to freshness (weight 15%)
    expect(recentResult.trustScore.overall).toBeGreaterThan(oldResult.trustScore.overall)
    // Difference should be measurable: freshness diff ~8 (recent) vs ~0 (old) * 0.15 weight = ~1.2 points
    expect(recentResult.trustScore.overall - oldResult.trustScore.overall).toBeGreaterThanOrEqual(1.0)
  })

  it('evaluateJobTrust also respects freshness (non-breakdown path)', async () => {
    // Use different companies to avoid cache collision
    const recentJob = makeJob({ id: '10a', company: 'MicrosoftRecent', source: 'greenhouse', postedAt: new Date().toISOString() })
    const recentResult = await evaluateJobTrust(recentJob)

    const oldDate = new Date()
    oldDate.setDate(oldDate.getDate() - 90)
    const oldJob = makeJob({ id: '10b', company: 'MicrosoftOld', source: 'greenhouse', postedAt: oldDate.toISOString() })
    const oldResult = await evaluateJobTrust(oldJob)

    expect(recentResult.trustScore.overall).toBeGreaterThan(oldResult.trustScore.overall)
  })

  it('returns job with trustBreakdown attached', async () => {
    const job = makeJob({ id: '9', company: 'Google', source: 'linkedin' })
    const result = await evaluateJobTrustWithBreakdown(job)

    expect(result.job.trustBreakdown).toBeDefined()
    expect(result.job.trustBreakdown).toEqual(result.trustBreakdown)
  })

  it('returns job with trustScore attached', async () => {
    const job = makeJob({ id: '10', company: 'Google', source: 'linkedin' })
    const result = await evaluateJobTrustWithBreakdown(job)

    expect(result.job.trustScore).toBeDefined()
    expect(typeof result.job.trustScore).toBe('number')
  })

  it('handles unknown company gracefully', async () => {
    const job = makeJob({ id: '11', company: 'xy', source: 'unknown-provider' })
    const result = await evaluateJobTrustWithBreakdown(job)

    expect(result.trustBreakdown.providerScore).toBeGreaterThanOrEqual(0)
    expect(result.trustBreakdown.companyAdjustment).toBeDefined()
    expect(typeof result.trustBreakdown.companyAdjustment).toBe('number')
  })

  it('includes visibility in the result', async () => {
    const job = makeJob({ id: '12', company: 'Google', source: 'linkedin' })
    const result = await evaluateJobTrustWithBreakdown(job)

    expect(result.visibility).toMatch(/^(blocked|hidden|visible|highlighted)$/)
  })

  it('returns consistent breakdown for same provider+company (cached path)', async () => {
    const job1 = makeJob({ id: '13', company: 'Microsoft', source: 'greenhouse' })
    const result1 = await evaluateJobTrustWithBreakdown(job1)

    // Second call with same company+source should hit cache
    const job2 = makeJob({ id: '14', company: 'Microsoft', source: 'greenhouse' })
    const result2 = await evaluateJobTrustWithBreakdown(job2)

    expect(result2.trustBreakdown.providerScore).toBe(result1.trustBreakdown.providerScore)
    expect(result2.trustScore.overall).toBe(result1.trustScore.overall)
  })
})

describe('evaluateJobsTrustWithBreakdown', () => {
  beforeEach(() => {
    resetProviderStats()
  })

  it('returns TrustEvaluationWithBreakdown for each job', async () => {
    const jobs = [
      makeJob({ id: '1', company: 'Google', source: 'linkedin' }),
      makeJob({ id: '2', company: 'Microsoft', source: 'greenhouse' }),
    ]

    const results = await evaluateJobsTrustWithBreakdown(jobs)

    expect(results).toHaveLength(2)
    for (const result of results) {
      expect(result).toHaveProperty('trustBreakdown')
      expect(result.trustBreakdown.providerScore).toBeGreaterThanOrEqual(0)
      expect(result.trustBreakdown.signals.isKnownEmployer).toBe(true)
    }
  })

  it('preserves TrustBreakdown on each job object', async () => {
    const jobs = [
      makeJob({ id: '3', company: 'Google', source: 'linkedin' }),
      makeJob({ id: '4', company: 'Microsoft', source: 'greenhouse' }),
    ]

    const results = await evaluateJobsTrustWithBreakdown(jobs)

    for (const result of results) {
      expect(result.job.trustBreakdown).toBeDefined()
      expect(result.job.trustBreakdown).toEqual(result.trustBreakdown)
    }
  })

  it('handles empty jobs array', async () => {
    const results = await evaluateJobsTrustWithBreakdown([])
    expect(results).toEqual([])
  })

  it('each job gets its own trust evaluation', async () => {
    const jobs = [
      makeJob({ id: '5', company: 'Google', source: 'linkedin' }),
      makeJob({ id: '6', company: 'SomeUnknownStartup', source: 'unknown-provider' }),
    ]

    const results = await evaluateJobsTrustWithBreakdown(jobs)

    // Google should have higher trust than unknown startup
    expect(results[0]!.trustScore.overall).toBeGreaterThan(results[1]!.trustScore.overall)
  })
})

describe('compatibility: evaluateJobTrust vs evaluateJobTrustWithBreakdown', () => {
  beforeEach(() => {
    resetProviderStats()
  })

  it('evaluateJobTrust still works (no trustBreakdown)', async () => {
    const job = makeJob({ id: '1', company: 'Google', source: 'linkedin' })
    const result = await evaluateJobTrust(job)

    expect(result).toHaveProperty('trustScore')
    expect(result).toHaveProperty('visibility')
    expect(result).not.toHaveProperty('trustBreakdown')
  })

  it('evaluateJobsTrust still works (no trustBreakdown)', async () => {
    const jobs = [
      makeJob({ id: '2', company: 'Google', source: 'linkedin' }),
      makeJob({ id: '3', company: 'Microsoft', source: 'greenhouse' }),
    ]

    const results = await evaluateJobsTrust(jobs)

    expect(results).toHaveLength(2)
    for (const result of results) {
      expect(result).not.toHaveProperty('trustBreakdown')
    }
  })
})
