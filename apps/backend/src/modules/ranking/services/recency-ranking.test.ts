import { describe, it, expect } from 'vitest'
import { computeRecencyScore } from './recency-ranking.ts'
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

describe('computeRecencyScore', () => {
  it('returns max score for today', () => {
    const job = makeJob({ postedAt: new Date().toISOString() })
    const score = computeRecencyScore(job, weights)
    expect(score).toBeGreaterThan(9)
    expect(score).toBeLessThanOrEqual(10)
  })

  it('returns 0 for very old jobs', () => {
    const oldDate = new Date()
    oldDate.setDate(oldDate.getDate() - 100)
    const job = makeJob({ postedAt: oldDate.toISOString() })
    expect(computeRecencyScore(job, weights)).toBe(0)
  })

  it('returns neutral score for missing date', () => {
    const job = makeJob()
    expect(computeRecencyScore(job, weights)).toBe(5)
  })

  it('returns max score for future dates', () => {
    const future = new Date()
    future.setDate(future.getDate() + 10)
    const job = makeJob({ postedAt: future.toISOString() })
    expect(computeRecencyScore(job, weights)).toBeGreaterThan(9)
  })
})
