import { describe, it, expect } from 'vitest'
import { computeTrustScoreWeight } from './trust-score-weight.ts'
import type { NormalizedJob, RankingWeights } from '@jobfindr/types'

const weights: RankingWeights = {
  matchScore: 0.35, trustScore: 0.25, companyPriority: 0.15,
  salary: 0.15, recency: 0.10,
}

describe('computeTrustScoreWeight', () => {
  it('returns weighted score based on trustScore', () => {
    const job = { id: '1', trustScore: 8 } as NormalizedJob
    expect(computeTrustScoreWeight(job, weights)).toBe(20)
  })

  it('returns neutral default when no trustScore', () => {
    const job = { id: '1' } as NormalizedJob
    expect(computeTrustScoreWeight(job, weights)).toBe(12.5)
  })

  it('handles zero trust score', () => {
    const job = { id: '1', trustScore: 0 } as NormalizedJob
    expect(computeTrustScoreWeight(job, weights)).toBe(0)
  })
})
