import { describe, it, expect, beforeEach, vi } from 'vitest'
import { WorkdayProvider } from './workday-provider.ts'
import type { ValidatedSearchInput } from '@jobfindr/types'

const mockPost = vi.fn()

vi.mock('../../scraping/http/axios-client.ts', () => ({
  createHttpClient: vi.fn(() => ({
    get: vi.fn(),
    post: mockPost,
  })),
}))

describe('WorkdayProvider', () => {
  let provider: WorkdayProvider

  beforeEach(() => {
    provider = new WorkdayProvider()
    vi.clearAllMocks()
  })

  const mockInput: ValidatedSearchInput = {
    q: '',
    skills: [],
    page: 1,
    pageSize: 20,
    seniority: [],
    remoteMode: [],
    companies: [],
    excludedCompanies: [],
    sources: [],
    minTrustScore: 0,
    includeHidden: false,
    sort: 'relevance',
    postedAfter: undefined,
  }

  it('should have correct provider metadata', () => {
    expect(provider.name).toBe('workday')
    expect(provider.providerType).toBe('json')
    expect(provider.version).toBe('1.0.0')
  })

  it('should return empty array on API failure', async () => {
    mockPost.mockRejectedValue(new Error('Workday API unavailable'))

    const result = await provider.search(mockInput)
    expect(result).toEqual([])
  })

  it('should return empty array on empty response', async () => {
    mockPost.mockResolvedValue({
      data: { total: 0, jobPostings: [] },
      headers: {},
    })

    const result = await provider.search(mockInput)
    expect(result).toEqual([])
  })

  it('should handle timeout gracefully', async () => {
    mockPost.mockRejectedValue(new Error('Request timed out'))

    const result = await provider.search(mockInput)
    expect(result).toEqual([])
  })
})
