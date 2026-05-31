import { describe, it, expect } from 'vitest'
import { computeMatchScoreWeight } from './match-score-weight.ts'
import type { NormalizedJob, RankingWeights } from '@jobfindr/types'

const weights: RankingWeights = {
  matchScore: 0.35, trustScore: 0.25, companyPriority: 0.15,
  salary: 0.15, recency: 0.10,
}

describe('computeMatchScoreWeight', () => {
  it('returns weighted score based on matchScore', () => {
    const job = { id: '1', matchScore: 80 } as NormalizedJob
    expect(computeMatchScoreWeight(job, weights)).toBeCloseTo(28, 1)
  })

  it('returns neutral default when no matchScore', () => {
    const job = { id: '1' } as NormalizedJob
    expect(computeMatchScoreWeight(job, weights)).toBe(17.5)
  })

  it('handles zero match score', () => {
    const job = { id: '1', matchScore: 0 } as NormalizedJob
    expect(computeMatchScoreWeight(job, weights)).toBe(0)
  })
})
