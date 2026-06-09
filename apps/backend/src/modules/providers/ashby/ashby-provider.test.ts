import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AshbyProvider } from './ashby-provider.ts'
import type { ValidatedSearchInput } from '@jobfindr/types'

const mockGet = vi.fn()

vi.mock('../../scraping/http/axios-client.ts', () => ({
  createHttpClient: vi.fn(() => ({
    get: mockGet,
    post: vi.fn(),
  })),
}))

describe('AshbyProvider', () => {
  let provider: AshbyProvider

  beforeEach(() => {
    provider = new AshbyProvider()
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
    expect(provider.name).toBe('ashby')
    expect(provider.providerType).toBe('api')
    expect(provider.version).toBe('1.0.0')
  })

  it('returns empty when constructed with empty company list', async () => {
    const emptyProvider = new AshbyProvider([])
    const result = await emptyProvider.search(mockInput)
    expect(result).toEqual([])
  })

  it('uses injected companies list for search', async () => {
    const companies = [{ name: 'TestCo', board: 'testco' }]
    const injectedProvider = new AshbyProvider(companies)
    mockGet.mockResolvedValue({
      data: { success: true, listings: [] },
      headers: {},
    })
    await injectedProvider.search(mockInput)
    expect(mockGet).toHaveBeenCalled()
  })

  it('should return empty array on API failure', async () => {
    mockGet.mockRejectedValue(new Error('API unavailable'))

    const result = await provider.search(mockInput)
    expect(result).toEqual([])
  })

  it('should return empty array when API returns no listings', async () => {
    mockGet.mockResolvedValue({
      data: { success: true, listings: [] },
      headers: {},
    })

    const result = await provider.search(mockInput)
    expect(result).toEqual([])
  })

  it('should handle rate limiting gracefully', async () => {
    mockGet.mockRejectedValue(new Error('Provider error'))

    const result = await provider.search(mockInput)
    expect(result).toEqual([])
  })

  it('should be instantiable', () => {
    const p = new AshbyProvider()
    expect(p.name).toBe('ashby')
  })
})
