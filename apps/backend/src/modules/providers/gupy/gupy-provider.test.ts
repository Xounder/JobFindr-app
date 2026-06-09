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
    countries: [],
  postedAfter: undefined,
  userSkills: [],
  userSeniority: undefined,
}

  it('should have correct provider metadata', () => {
    expect(provider.name).toBe('gupy')
    expect(provider.providerType).toBe('json')
    expect(provider.version).toBe('1.0.0')
  })

  it('returns empty when constructed with empty company list', async () => {
    const emptyProvider = new GupyProvider([])
    const result = await emptyProvider.search(mockInput)
    expect(result).toEqual([])
  })

  it('filters jobs by careerPageId from injected companies', async () => {
    const companies = [{ careerPageId: 1, careerPageName: 'CompanyA' }]
    const filteredProvider = new GupyProvider(companies)
    mockGet.mockResolvedValue({
      data: {
        data: [
          { id: 1, name: 'Job1', careerPageId: 1, publishedDate: '2024-01-01', url: '/job1' },
          { id: 2, name: 'Job2', careerPageId: 2, publishedDate: '2024-01-01', url: '/job2' },
        ],
        total: 2,
        limit: 50,
        offset: 0,
      },
      headers: {},
    })
    const result = await filteredProvider.search(mockInput)
    expect(result).toHaveLength(1)
    expect(result[0]!.title).toBe('Job1')
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
