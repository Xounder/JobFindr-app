import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GreenhouseProvider } from './greenhouse-provider.ts'
import type { ValidatedSearchInput } from '@jobfindr/types'

const mockGet = vi.fn()

vi.mock('../../scraping/http/axios-client.ts', () => ({
  createHttpClient: vi.fn(() => ({
    get: mockGet,
    post: vi.fn(),
  })),
}))

describe('GreenhouseProvider', () => {
  let provider: GreenhouseProvider

  beforeEach(() => {
    provider = new GreenhouseProvider()
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
    expect(provider.name).toBe('greenhouse')
    expect(provider.providerType).toBe('api')
    expect(provider.version).toBe('1.0.0')
  })

  it('should return empty array on API failure', async () => {
    mockGet.mockRejectedValue(new Error('API unavailable'))

    const result = await provider.search(mockInput)
    expect(result).toEqual([])
  })

  it('should return empty array on malformed response', async () => {
    mockGet.mockResolvedValue({ data: null, headers: {} })

    const result = await provider.search(mockInput)
    expect(result).toEqual([])
  })

  it('should be instantiable multiple times', () => {
    const p1 = new GreenhouseProvider()
    const p2 = new GreenhouseProvider()
    expect(p1.name).toBe(p2.name)
    expect(p1.providerType).toBe(p2.providerType)
  })
})
