import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AdzunaProvider } from './adzuna-provider.ts'
import type { ValidatedSearchInput } from '@jobfindr/types'

const mockGet = vi.fn()

vi.mock('../../scraping/http/axios-client.ts', () => ({
  createHttpClient: vi.fn(() => ({
    get: mockGet,
    post: vi.fn(),
  })),
}))

describe('AdzunaProvider', () => {
  let provider: AdzunaProvider

  beforeEach(() => {
    provider = new AdzunaProvider('test-id', 'test-key')
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

  const createMockResponse = (overrides: Record<string, unknown> = {}) => ({
    data: {
      results: [
        {
          id: '123',
          title: 'Senior Software Engineer',
          company: { display_name: 'TechCorp' },
          location: { display_name: 'São Paulo, Brazil' },
          salary_min: 100000,
          salary_max: 150000,
          description: '<p>Great job opportunity</p>',
          category: { label: 'Engineering' },
          contract_type: 'CLT',
          created: '2026-06-10T10:00:00Z',
          redirect_url: 'https://example.com/apply',
        },
      ],
      count: 1,
      __CLASS__: 'AdzunaApiResponse',
      ...overrides,
    },
    headers: {},
  })

  it('should have correct provider metadata', () => {
    expect(provider.name).toBe('adzuna')
    expect(provider.providerType).toBe('api')
    expect(provider.version).toBe('1.0.0')
  })

  it('returns empty array when credentials are empty', async () => {
    const emptyProvider = new AdzunaProvider('', '')
    const result = await emptyProvider.search(mockInput)
    expect(result).toEqual([])
  })

  it('maps full response correctly to NormalizedJob', async () => {
    mockGet.mockResolvedValue(createMockResponse())
    const result = await provider.search(mockInput)

    expect(result).toHaveLength(1)
    expect(result[0]!.title).toBe('Senior Software Engineer')
    expect(result[0]!.company).toBe('TechCorp')
    expect(result[0]!.location).toBe('São Paulo, Brazil')
    expect(result[0]!.url).toBe('https://example.com/apply')
    expect(result[0]!.industry).toBe('Engineering')
    expect(result[0]!.source).toBe('adzuna')
  })

  it('maps salary_min and salary_max to SalaryInfo', async () => {
    mockGet.mockResolvedValue(createMockResponse())
    const result = await provider.search(mockInput)

    expect(result[0]!.salary).toBeDefined()
    expect(result[0]!.salary!.min).toBe(100000)
    expect(result[0]!.salary!.max).toBe(150000)
    expect(result[0]!.salary!.currency).toBe('BRL')
    expect(result[0]!.salary!.period).toBe('yearly')
  })

  it('handles missing salary fields', async () => {
    mockGet.mockResolvedValue(
      createMockResponse({
        results: [
          {
            id: '456',
            title: 'Junior Developer',
            company: { display_name: 'StartupCo' },
            location: { display_name: 'Remote' },
            description: 'Entry level position',
            created: '2026-06-10T10:00:00Z',
            redirect_url: 'https://example.com/apply',
          },
        ],
      })
    )
    const result = await provider.search(mockInput)
    expect(result[0]!.salary).toBeUndefined()
  })

  it('handles missing optional fields gracefully', async () => {
    mockGet.mockResolvedValue(createMockResponse({
      results: [
        {
          id: '999',
          title: 'Test Position',
          company: { display_name: 'TestCo' },
          location: { display_name: 'Remote' },
          description: 'Job description',
          created: '2026-06-10T10:00:00Z',
          redirect_url: 'https://example.com/apply',
        },
      ],
    }))
    const result = await provider.search(mockInput)
    expect(result).toHaveLength(1)
    expect(result[0]!.title).toBe('Test Position')
    expect(result[0]!.salary).toBeUndefined()
  })

  it('converts created date to ISO string in postedAt', async () => {
    mockGet.mockResolvedValue(createMockResponse())
    const result = await provider.search(mockInput)
    expect(result[0]!.postedAt).toBe('2026-06-10T10:00:00.000Z')
  })

  it('cleans HTML from description', async () => {
    mockGet.mockResolvedValue(createMockResponse())
    const result = await provider.search(mockInput)
    expect(result[0]!.description).not.toContain('<p>')
    expect(result[0]!.description).toContain('Great job opportunity')
  })

  it('filters by query on client side', async () => {
    mockGet.mockResolvedValue(createMockResponse())
    const queryInput = { ...mockInput, q: 'nonexistent' }
    const result = await provider.search(queryInput)
    expect(result).toHaveLength(0)
  })

  it('returns empty array on API failure', async () => {
    mockGet.mockRejectedValue(new Error('API unavailable'))
    const result = await provider.search(mockInput)
    expect(result).toEqual([])
  })

  it('hasMorePages returns true when more pages exist', () => {
    const response = { results: [], count: 150, __CLASS__: 'AdzunaApiResponse' }
    expect(provider['hasMorePages'](response, 1)).toBe(true)
  })

  it('hasMorePages returns false when no more pages', () => {
    const response = { results: [], count: 30, __CLASS__: 'AdzunaApiResponse' }
    expect(provider['hasMorePages'](response, 1)).toBe(false)
  })

  it('hasMorePages returns false for invalid response', () => {
    expect(provider['hasMorePages'](null, 1)).toBe(false)
    expect(provider['hasMorePages'](undefined, 1)).toBe(false)
  })

  it('builds correct query params with search query', async () => {
    mockGet.mockResolvedValue(createMockResponse())
    const queryInput = { ...mockInput, q: 'react' }
    await provider.search(queryInput)

    const callParams = mockGet.mock.calls[0]?.[1]?.params
    expect(callParams?.app_id).toBe('test-id')
    expect(callParams?.app_key).toBe('test-key')
    expect(callParams?.what).toBe('react')
    expect(callParams?.results_per_page).toBe(50)
  })

  it('detects remote mode from contract_type', async () => {
    mockGet.mockResolvedValue(
      createMockResponse({
        results: [
          {
            id: 'remote-1',
            title: 'Remote Dev',
            company: { display_name: 'RemoteCo' },
            location: { display_name: 'Anywhere' },
            description: 'Remote position',
            contract_type: 'Remoto',
            created: '2026-06-10T10:00:00Z',
            redirect_url: 'https://example.com/apply',
          },
        ],
      })
    )
    const result = await provider.search(mockInput)
    expect(result[0]!.remoteMode).toBe('remote')
  })

  it('createAdzunaProvider factory returns provider with empty credentials when env vars missing', async () => {
    const { createAdzunaProvider } = await import('./adzuna-provider.ts')
    const created = await createAdzunaProvider()
    expect(created).toBeInstanceOf(AdzunaProvider)
    const result = await created.search(mockInput)
    expect(result).toEqual([])
  })
})
