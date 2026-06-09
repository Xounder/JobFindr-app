import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LeverProvider } from './lever-provider.ts'
import type { ValidatedSearchInput } from '@jobfindr/types'

const mockGet = vi.fn()

vi.mock('../../scraping/http/axios-client.ts', () => ({
  createHttpClient: vi.fn(() => ({
    get: mockGet,
    post: vi.fn(),
  })),
}))

describe('LeverProvider', () => {
  let provider: LeverProvider

  beforeEach(() => {
    provider = new LeverProvider()
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
    expect(provider.name).toBe('lever')
    expect(provider.providerType).toBe('api')
    expect(provider.version).toBe('1.0.0')
  })

  it('returns empty when constructed with empty company list', async () => {
    const emptyProvider = new LeverProvider([])
    const result = await emptyProvider.search(mockInput)
    expect(result).toEqual([])
  })

  it('uses injected companies list for search', async () => {
    const companies = [{ name: 'TestCo', slug: 'testco' }]
    const injectedProvider = new LeverProvider(companies)
    mockGet.mockResolvedValue({ data: [], headers: {} })
    await injectedProvider.search(mockInput)
    expect(mockGet).toHaveBeenCalled()
  })

  it('should return empty array on API failure', async () => {
    mockGet.mockRejectedValue(new Error('Lever API error'))

    const result = await provider.search(mockInput)
    expect(result).toEqual([])
  })

  it('should return empty array on malformed response', async () => {
    mockGet.mockResolvedValue({ data: null, headers: {} })

    const result = await provider.search(mockInput)
    expect(result).toEqual([])
  })

  it('should handle timeout', async () => {
    mockGet.mockRejectedValue(new Error('Connection error'))

    const result = await provider.search(mockInput)
    expect(result).toEqual([])
  })
})
