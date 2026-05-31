import { describe, it, expect } from 'vitest'
import { computeCompanyPriorityScore } from './large-company-priority.ts'
import type { NormalizedJob, RankingWeights } from '@jobfindr/types'

const weights: RankingWeights = {
  matchScore: 0.35, trustScore: 0.25, companyPriority: 0.15,
  salary: 0.15, recency: 0.10,
}

describe('computeCompanyPriorityScore', () => {
  it('returns high score for major companies', () => {
    const job = { id: '1', company: 'Google' } as NormalizedJob
    expect(computeCompanyPriorityScore(job, weights)).toBeGreaterThan(12)
  })

  it('returns neutral score for unknown companies', () => {
    const job = { id: '1', company: 'Some Random Startup' } as NormalizedJob
    expect(computeCompanyPriorityScore(job, weights)).toBe(7.5)
  })

  it('detects enterprise indicators in company name', () => {
    const job = { id: '1', company: 'Acme Corp' } as NormalizedJob
    expect(computeCompanyPriorityScore(job, weights)).toBeGreaterThan(7.5)
  })

  it('is case insensitive', () => {
    const job = { id: '1', company: 'google' } as NormalizedJob
    expect(computeCompanyPriorityScore(job, weights)).toBeGreaterThan(12)
  })
})
