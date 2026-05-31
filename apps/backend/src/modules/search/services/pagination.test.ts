import { describe, it, expect, beforeAll } from 'vitest'
import { paginateJobs } from './pagination.ts'
import type { NormalizedJob } from '@jobfindr/types'

function makeJob(id: string): NormalizedJob {
  return {
    id,
    title: 'Job ' + id,
    company: 'Company',
    description: 'desc',
    skills: [],
    url: 'https://example.com',
    source: 'test',
  }
}

beforeAll(() => {
  process.env.MAX_PAGE_SIZE = '20'
})

describe('paginateJobs', () => {
  const jobs = Array.from({ length: 25 }, (_, i) => makeJob(String(i + 1)))

  it('returns first page with correct pageSize', () => {
    const result = paginateJobs(jobs, 1, 10)
    expect(result.jobs).toHaveLength(10)
    expect(result.meta.page).toBe(1)
    expect(result.meta.totalResults).toBe(25)
    expect(result.meta.totalPages).toBe(3)
  })

  it('returns second page correctly', () => {
    const result = paginateJobs(jobs, 2, 10)
    expect(result.jobs).toHaveLength(10)
    expect(result.jobs[0]!.id).toBe('11')
  })

  it('returns last partial page', () => {
    const result = paginateJobs(jobs, 3, 10)
    expect(result.jobs).toHaveLength(5)
  })

  it('caps pageSize at MAX_PAGE_SIZE', () => {
    const result = paginateJobs(jobs, 1, 100)
    expect(result.jobs.length).toBeLessThanOrEqual(20)
    expect(result.meta.pageSize).toBe(20)
  })

  it('handles empty list', () => {
    const result = paginateJobs([], 1, 10)
    expect(result.jobs).toHaveLength(0)
    expect(result.meta.totalPages).toBe(1)
  })

  it('ensures page is at least 1', () => {
    const result = paginateJobs(jobs, 0, 10)
    expect(result.meta.page).toBe(1)
  })
})
