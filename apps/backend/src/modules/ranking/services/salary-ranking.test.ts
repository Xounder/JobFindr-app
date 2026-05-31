import { describe, it, expect } from 'vitest'
import { computeSalaryScore } from './salary-ranking.ts'
import type { NormalizedJob, RankingWeights } from '@jobfindr/types'

const weights: RankingWeights = {
  matchScore: 0.35, trustScore: 0.25, companyPriority: 0.15,
  salary: 0.15, recency: 0.10,
}

function makeJob(overrides: Partial<NormalizedJob> = {}): NormalizedJob {
  return {
    id: '1', title: 'Job', company: 'Co', description: 'desc',
    skills: [], url: 'https://x.com', source: 'test',
    ...overrides,
  }
}

describe('computeSalaryScore', () => {
  it('returns neutral score for no salary', () => {
    const job = makeJob()
    expect(computeSalaryScore(job, weights)).toBe(7.5)
  })

  it('returns positive score for high salary', () => {
    const job = makeJob({ salary: { min: 150000, max: 200000, currency: 'USD', period: 'yearly' } })
    const score = computeSalaryScore(job, weights)
    expect(score).toBeGreaterThan(7.5)
  })

  it('returns 0 for very low salary', () => {
    const job = makeJob({ salary: { min: 10000, max: 15000, currency: 'USD', period: 'yearly' } })
    expect(computeSalaryScore(job, weights)).toBe(0)
  })

  it('handles monthly salary conversion', () => {
    const job = makeJob({ salary: { min: 10000, max: 15000, currency: 'USD', period: 'monthly' } })
    const score = computeSalaryScore(job, weights)
    expect(score).toBeGreaterThan(0)
  })
})
