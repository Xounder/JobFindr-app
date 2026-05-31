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
    postedAfter: undefined,
  }

  it('should have correct provider metadata', () => {
    expect(provider.name).toBe('lever')
    expect(provider.providerType).toBe('api')
    expect(provider.version).toBe('1.0.0')
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
