import { describe, it, expect } from 'vitest'
import { rankJobs } from './ranking-engine.ts'
import type { NormalizedJob } from '@jobfindr/types'

function makeJob(overrides: Partial<NormalizedJob> & { id: string }): NormalizedJob {
  return {
    title: 'Job Title',
    company: 'Company',
    description: 'desc',
    skills: [],
    url: 'https://x.com',
    source: 'test',
    ...overrides,
  }
}

describe('rankJobs', () => {
  const jobs: NormalizedJob[] = [
    makeJob({
      id: '1', matchScore: 90, trustScore: 8,
      postedAt: new Date().toISOString(),
    }),
    makeJob({
      id: '2', matchScore: 30, trustScore: 3,
      postedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    }),
  ]

  it('sorts jobs by trust score first, then match score, then composite score', () => {
    const { jobs: sorted, rankings } = rankJobs(jobs)
    expect(sorted[0]!.id).toBe('1')
    expect(sorted[1]!.id).toBe('2')
    const score1 = rankings.get('1')!.compositeScore
    const score2 = rankings.get('2')!.compositeScore
    expect(score1).toBeGreaterThan(score2)
  })

  it('returns ranking map with all jobs', () => {
    const { rankings } = rankJobs(jobs)
    expect(rankings.size).toBe(2)
    expect(rankings.has('1')).toBe(true)
    expect(rankings.has('2')).toBe(true)
  })

  it('attaches rankingScore to each job', () => {
    const { jobs: sorted } = rankJobs(jobs)
    expect(sorted[0]!.rankingScore).toBeDefined()
    expect(sorted[0]!.rankingScore).toBeGreaterThan(0)
  })

  it('handles empty job list', () => {
    const { jobs: sorted, rankings } = rankJobs([])
    expect(sorted).toHaveLength(0)
    expect(rankings.size).toBe(0)
  })

  // ── Trust-first multi-key sort tests ──────────────────────────────

  it('trustScore=9/matchScore=30 ranks above trustScore=7/matchScore=85', () => {
    const testJobs = [
      makeJob({ id: 'high-trust', trustScore: 9, matchScore: 30 }),
      makeJob({ id: 'high-match', trustScore: 7, matchScore: 85 }),
    ]
    const { jobs: sorted } = rankJobs(testJobs)
    expect(sorted[0]!.id).toBe('high-trust')
    expect(sorted[1]!.id).toBe('high-match')
  })

  it('trustScore=9/matchScore=85 ranks above trustScore=9/matchScore=30', () => {
    const testJobs = [
      makeJob({ id: 'high-both', trustScore: 9, matchScore: 85 }),
      makeJob({ id: 'same-trust', trustScore: 9, matchScore: 30 }),
    ]
    const { jobs: sorted } = rankJobs(testJobs)
    expect(sorted[0]!.id).toBe('high-both')
    expect(sorted[1]!.id).toBe('same-trust')
  })

  it('trustScore undefined defaults to 5 for sorting', () => {
    const testJobs = [
      makeJob({ id: 'no-trust', matchScore: 50 }), // trustScore defaults to 5
      makeJob({ id: 'low-trust', trustScore: 3, matchScore: 50 }),
      makeJob({ id: 'high-trust', trustScore: 7, matchScore: 50 }),
    ]
    const { jobs: sorted } = rankJobs(testJobs)
    expect(sorted[0]!.id).toBe('high-trust')   // 7 > 5 > 3
    expect(sorted[1]!.id).toBe('no-trust')     // defaults to 5
    expect(sorted[2]!.id).toBe('low-trust')    // 3
  })

  it('matchScore undefined defaults to 50 for sorting', () => {
    const testJobs = [
      makeJob({ id: 'no-match', trustScore: 5 }), // matchScore defaults to 50
      makeJob({ id: 'low-match', trustScore: 5, matchScore: 30 }),
    ]
    const { jobs: sorted } = rankJobs(testJobs)
    expect(sorted[0]!.id).toBe('no-match')  // defaults to 50 > 30
    expect(sorted[1]!.id).toBe('low-match') // 30
  })

  // ── sortBy option tests ───────────────────────────────────────────

  it('sortBy: "trust" sorts by trust first, then match, then composite', () => {
    const testJobs = [
      makeJob({ id: 'high-trust', trustScore: 9, matchScore: 30 }),
      makeJob({ id: 'high-match', trustScore: 7, matchScore: 85 }),
    ]
    const { jobs: sorted } = rankJobs(testJobs, { sortBy: 'trust' })
    expect(sorted[0]!.id).toBe('high-trust')
    expect(sorted[1]!.id).toBe('high-match')
  })

  it('sortBy: "match" sorts by match first, then trust, then composite', () => {
    const testJobs = [
      makeJob({ id: 'low-match-high-trust', trustScore: 9, matchScore: 30 }),
      makeJob({ id: 'high-match-low-trust', trustScore: 7, matchScore: 85 }),
    ]
    const { jobs: sorted } = rankJobs(testJobs, { sortBy: 'match' })
    expect(sorted[0]!.id).toBe('high-match-low-trust')
    expect(sorted[1]!.id).toBe('low-match-high-trust')
  })

  it('default (no sortBy) behaves as trust-first', () => {
    const testJobs = [
      makeJob({ id: 'high-trust', trustScore: 9, matchScore: 30 }),
      makeJob({ id: 'high-match', trustScore: 7, matchScore: 85 }),
    ]
    const { jobs: sorted } = rankJobs(testJobs)
    expect(sorted[0]!.id).toBe('high-trust')
    expect(sorted[1]!.id).toBe('high-match')
  })

  it('sortBy: "relevance" (legacy) falls back to trust-first', () => {
    const testJobs = [
      makeJob({ id: 'high-trust', trustScore: 9, matchScore: 30 }),
      makeJob({ id: 'high-match', trustScore: 7, matchScore: 85 }),
    ]
    const { jobs: sorted } = rankJobs(testJobs, { sortBy: 'relevance' as 'trust' })
    expect(sorted[0]!.id).toBe('high-trust')
    expect(sorted[1]!.id).toBe('high-match')
  })
})
