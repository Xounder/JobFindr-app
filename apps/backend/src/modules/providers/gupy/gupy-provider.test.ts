import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GupyProvider } from './gupy-provider.ts'
import type { ValidatedSearchInput } from '@jobfindr/types'

const mockGet = vi.fn()

vi.mock('../../scraping/http/axios-client.ts', () => ({
  createHttpClient: vi.fn(() => ({
    get: mockGet,
    post: vi.fn(),
  })),
}))

describe('GupyProvider', () => {
  let provider: GupyProvider

  beforeEach(() => {
    provider = new GupyProvider()
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
    expect(provider.name).toBe('gupy')
    expect(provider.providerType).toBe('json')
    expect(provider.version).toBe('1.0.0')
  })

  it('should return empty array on API failure', async () => {
    mockGet.mockRejectedValue(new Error('Gupy API unavailable'))

    const result = await provider.search(mockInput)
    expect(result).toEqual([])
  })

  it('should return empty array on empty response', async () => {
    mockGet.mockResolvedValue({
      data: { data: [], total: 0, limit: 50, offset: 0 },
      headers: {},
    })

    const result = await provider.search(mockInput)
    expect(result).toEqual([])
  })

  it('should handle rate limiting gracefully', async () => {
    mockGet.mockRejectedValue(new Error('Rate limit exceeded'))

    const result = await provider.search(mockInput)
    expect(result).toEqual([])
  })
})
