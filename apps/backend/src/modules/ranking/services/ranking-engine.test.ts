import { describe, it, expect } from 'vitest'
import { rankJobs } from './ranking-engine.ts'
import type { NormalizedJob } from '@jobfindr/types'

describe('rankJobs', () => {
  const jobs: NormalizedJob[] = [
    {
      id: '1', title: 'Senior React Dev', company: 'Google',
      description: 'desc', skills: ['react', 'typescript'],
      url: 'https://x.com', source: 'linkedin',
      postedAt: new Date().toISOString(),
      matchScore: 90, trustScore: 8,
    },
    {
      id: '2', title: 'Junior Dev', company: 'Unknown Co',
      description: 'desc', skills: ['html'],
      url: 'https://x.com', source: 'gupy',
      postedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      matchScore: 30, trustScore: 3,
    },
  ]

  it('sorts jobs by composite score descending', () => {
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
})
