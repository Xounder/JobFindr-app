import { describe, it, expect } from 'vitest'
import { computeTrustScoreWeight } from './trust-score-weight.ts'
import { getTrustVisibility, getTrustClassification } from '@jobfindr/types'
import type { NormalizedJob, RankingWeights } from '@jobfindr/types'

const weights: RankingWeights = {
  matchScore: 0.35, trustScore: 0.25, companyPriority: 0.15,
  salary: 0.15, recency: 0.10,
}

describe('computeTrustScoreWeight', () => {
  it('returns weighted score based on trustScore with boost', () => {
    const job = { id: '1', trustScore: 8 } as NormalizedJob
    // (8/10) * 0.25 * 100 = 20, 1.25x boost = 25
    expect(computeTrustScoreWeight(job, weights)).toBe(25)
  })

  it('returns neutral default when no trustScore', () => {
    const job = { id: '1' } as NormalizedJob
    expect(computeTrustScoreWeight(job, weights)).toBe(12.5)
  })

  it('handles zero trust score', () => {
    const job = { id: '1', trustScore: 0 } as NormalizedJob
    expect(computeTrustScoreWeight(job, weights)).toBe(0)
  })

  it('applies 1.25x boost for trustScore >= 8.0', () => {
    const job = { id: '1', trustScore: 8 } as NormalizedJob
    // Base: (8/10) * 0.25 * 100 = 20, 1.25x boost = 25
    expect(computeTrustScoreWeight(job, weights)).toBe(25)
  })

  it('applies stacked 1.5x + 1.25x boost for trustScore >= 9.0', () => {
    const job = { id: '1', trustScore: 9 } as NormalizedJob
    // Base: (9/10) * 0.25 * 100 = 22.5, 1.5x boost = 33.75, 1.25x boost = 42.1875
    expect(computeTrustScoreWeight(job, weights)).toBe(42.1875)
  })

  it('caps result at 100', () => {
    const job = { id: '1', trustScore: 10 } as NormalizedJob
    // Base: (10/10) * 0.25 * 100 = 25, 1.5x boost = 37.5, 1.25x boost = 46.875, still under 100
    expect(computeTrustScoreWeight(job, weights)).toBe(46.875)
  })

  it('does not apply boost for trustScore < 8.0', () => {
    const job = { id: '1', trustScore: 7.9 } as NormalizedJob
    // Base: (7.9/10) * 0.25 * 100 = 19.75, no boost
    expect(computeTrustScoreWeight(job, weights)).toBe(19.75)
  })

  it('applies 1.25x boost at exactly 8.0 boundary', () => {
    const job = { id: '1', trustScore: 8 } as NormalizedJob
    // Base: (8/10) * 0.25 * 100 = 20, 1.25x = 25
    expect(computeTrustScoreWeight(job, weights)).toBe(25)
  })

  it('applies 1.5x + 1.25x stacked boost at exactly 9.0 boundary', () => {
    const job = { id: '1', trustScore: 9 } as NormalizedJob
    // Base: (9/10) * 0.25 * 100 = 22.5, 1.5x * 1.25x = 42.1875
    expect(computeTrustScoreWeight(job, weights)).toBe(42.1875)
  })
})

describe('getTrustVisibility', () => {
  it('returns blocked for score < 5', () => {
    expect(getTrustVisibility(4.9)).toBe('blocked')
    expect(getTrustVisibility(0)).toBe('blocked')
    expect(getTrustVisibility(4)).toBe('blocked')
  })

  it('returns hidden for score 5.0 – 5.9', () => {
    expect(getTrustVisibility(5)).toBe('hidden')
    expect(getTrustVisibility(5.5)).toBe('hidden')
    expect(getTrustVisibility(5.9)).toBe('hidden')
  })

  it('returns visible for score 6.0 – 7.9', () => {
    expect(getTrustVisibility(6)).toBe('visible')
    expect(getTrustVisibility(7)).toBe('visible')
    expect(getTrustVisibility(7.5)).toBe('visible')
    expect(getTrustVisibility(7.9)).toBe('visible')
  })

  it('returns highlighted for score >= 8.0', () => {
    expect(getTrustVisibility(8)).toBe('highlighted')
    expect(getTrustVisibility(9)).toBe('highlighted')
    expect(getTrustVisibility(10)).toBe('highlighted')
  })

  it('handles edge case: negative score → blocked', () => {
    expect(getTrustVisibility(-1)).toBe('blocked')
  })

  it('handles edge case: score > 10 → highlighted', () => {
    expect(getTrustVisibility(100)).toBe('highlighted')
  })
})

describe('getTrustClassification', () => {
  it('returns extreme-low for score < 5', () => {
    expect(getTrustClassification(0)).toBe('extreme-low')
    expect(getTrustClassification(4.9)).toBe('extreme-low')
    expect(getTrustClassification(4)).toBe('extreme-low')
  })

  it('returns low for score 5 – 5.9', () => {
    expect(getTrustClassification(5)).toBe('low')
    expect(getTrustClassification(5.5)).toBe('low')
    expect(getTrustClassification(5.9)).toBe('low')
  })

  it('returns medium for score 6 – 6.9', () => {
    expect(getTrustClassification(6)).toBe('medium')
    expect(getTrustClassification(6.5)).toBe('medium')
    expect(getTrustClassification(6.9)).toBe('medium')
  })

  it('returns trust for score 7 – 7.9', () => {
    expect(getTrustClassification(7)).toBe('trust')
    expect(getTrustClassification(7.5)).toBe('trust')
    expect(getTrustClassification(7.9)).toBe('trust')
  })

  it('returns good for score 8 – 8.9', () => {
    expect(getTrustClassification(8)).toBe('good')
    expect(getTrustClassification(8.5)).toBe('good')
    expect(getTrustClassification(8.9)).toBe('good')
  })

  it('returns high for score >= 9', () => {
    expect(getTrustClassification(9)).toBe('high')
    expect(getTrustClassification(9.5)).toBe('high')
    expect(getTrustClassification(10)).toBe('high')
  })

  it('handles edge case: negative score → extreme-low', () => {
    expect(getTrustClassification(-1)).toBe('extreme-low')
  })

  it('handles edge case: score > 10 → high', () => {
    expect(getTrustClassification(100)).toBe('high')
  })
})
