import { describe, it, expect } from 'vitest'
import { computeFinalScore, explainScore } from './composite-score.ts'
import type { RankingBreakdown } from '@jobfindr/types'

describe('computeFinalScore', () => {
  it('returns 0 for all zero contributions', () => {
    const breakdown: RankingBreakdown = {
      matchScoreContribution: 0,
      trustScoreContribution: 0,
      companyPriorityContribution: 0,
      salaryContribution: 0,
      recencyContribution: 0,
    }
    expect(computeFinalScore(breakdown)).toBe(0)
  })

  it('sums contributions correctly', () => {
    const breakdown: RankingBreakdown = {
      matchScoreContribution: 35,
      trustScoreContribution: 25,
      companyPriorityContribution: 15,
      salaryContribution: 10,
      recencyContribution: 5,
    }
    expect(computeFinalScore(breakdown)).toBe(90)
  })

  it('caps at 100', () => {
    const breakdown: RankingBreakdown = {
      matchScoreContribution: 80,
      trustScoreContribution: 30,
      companyPriorityContribution: 20,
      salaryContribution: 20,
      recencyContribution: 20,
    }
    expect(computeFinalScore(breakdown)).toBeLessThanOrEqual(100)
  })
})

describe('explainScore', () => {
  it('generates explanation with non-zero contributions', () => {
    const breakdown: RankingBreakdown = {
      matchScoreContribution: 35,
      trustScoreContribution: 25,
      companyPriorityContribution: 0,
      salaryContribution: 0,
      recencyContribution: 5,
    }
    const explanation = explainScore(breakdown)
    expect(explanation).toContain('Match: 35.0')
    expect(explanation).toContain('Trust: 25.0')
    expect(explanation).toContain('Recency: 5.0')
    expect(explanation).not.toContain('Company')
  })
})
