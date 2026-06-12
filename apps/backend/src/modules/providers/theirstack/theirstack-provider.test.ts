import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TheirStackProvider } from './theirstack-provider.ts'
import type { ValidatedSearchInput } from '@jobfindr/types'

const mockPost = vi.fn()

vi.mock('../../scraping/http/axios-client.ts', () => ({
  createHttpClient: vi.fn(() => ({
    get: vi.fn(),
    post: mockPost,
  })),
}))

describe('TheirStackProvider', () => {
  let provider: TheirStackProvider

  beforeEach(() => {
    provider = new TheirStackProvider('test-api-key')
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
      data: [
        {
          job_title: 'Senior Software Engineer',
          company_name: 'TechCorp',
          location: 'São Paulo',
          salary: 'R$ 150000 - R$ 200000 per year',
          description: '<p>Great tech opportunity</p>',
          technologies: ['React', 'Node.js'],
          posting_age: 5,
          remote: true,
          job_url: 'https://example.com/job/123',
          country: 'Brazil',
        },
      ],
      total: 1,
      page: 1,
      ...overrides,
    },
    headers: {},
  })

  it('should have correct provider metadata', () => {
    expect(provider.name).toBe('theirstack')
    expect(provider.providerType).toBe('api')
    expect(provider.version).toBe('1.0.0')
  })

  it('returns empty array when API key is empty', async () => {
    const emptyProvider = new TheirStackProvider('')
    const result = await emptyProvider.search(mockInput)
    expect(result).toEqual([])
  })

  it('maps full response correctly to NormalizedJob', async () => {
    mockPost.mockResolvedValue(createMockResponse())
    const result = await provider.search(mockInput)

    expect(result).toHaveLength(1)
    expect(result[0]!.title).toBe('Senior Software Engineer')
    expect(result[0]!.company).toBe('TechCorp')
    expect(result[0]!.location).toBe('São Paulo, Brazil')
    expect(result[0]!.url).toBe('https://example.com/job/123')
    expect(result[0]!.source).toBe('theirstack')
    expect(result[0]!.remoteMode).toBe('remote')
  })

  it('maps technologies array to skills', async () => {
    mockPost.mockResolvedValue(createMockResponse())
    const result = await provider.search(mockInput)

    expect(result[0]!.skills).toContain('React')
    expect(result[0]!.skills).toContain('Node.js')
  })

  it('maps remote: true to remoteMode: remote', async () => {
    mockPost.mockResolvedValue(createMockResponse())
    const result = await provider.search(mockInput)

    expect(result[0]!.remoteMode).toBe('remote')
  })

  it('maps remote: false or undefined to undefined remoteMode', async () => {
    mockPost.mockResolvedValue(
      createMockResponse({
        data: [
          {
            job_title: 'Office Developer',
            company_name: 'OfficeCorp',
            location: 'New York',
            description: 'Office based job',
            job_url: 'https://example.com/job/456',
            remote: false,
          },
        ],
      })
    )
    const result = await provider.search(mockInput)
    expect(result[0]!.remoteMode).toBeUndefined()
  })

  it('converts posting_age to postedAt correctly', async () => {
    mockPost.mockResolvedValue(createMockResponse())
    const result = await provider.search(mockInput)

    expect(result[0]!.postedAt).toBeDefined()
    const postedDate = new Date(result[0]!.postedAt!)
    const expectedDate = new Date()
    expectedDate.setDate(expectedDate.getDate() - 5)
    expect(postedDate.toISOString().split('T')[0]).toBe(expectedDate.toISOString().split('T')[0])
  })

  it('returns undefined postedAt when posting_age is missing', async () => {
    mockPost.mockResolvedValue(
      createMockResponse({
        data: [
          {
            job_title: 'Test Dev',
            company_name: 'TestCo',
            location: 'Remote',
            description: 'Test position',
            job_url: 'https://example.com/job/789',
          },
        ],
      })
    )
    const result = await provider.search(mockInput)
    expect(result[0]!.postedAt).toBeUndefined()
  })

  it('parses salary string when provided', async () => {
    mockPost.mockResolvedValue(createMockResponse())
    const result = await provider.search(mockInput)

    expect(result[0]!.salary).toBeDefined()
    expect(result[0]!.salary!.min).toBeGreaterThan(0)
    expect(result[0]!.salary!.currency).toBe('BRL')
  })

  it('handles missing salary field', async () => {
    mockPost.mockResolvedValue(
      createMockResponse({
        data: [
          {
            job_title: 'No Salary Job',
            company_name: 'NonProfit',
            location: 'Anywhere',
            description: 'No salary listed',
            job_url: 'https://example.com/job/nosalary',
          },
        ],
      })
    )
    const result = await provider.search(mockInput)
    expect(result[0]!.salary).toBeUndefined()
  })

  it('handles missing optional fields gracefully', async () => {
    mockPost.mockResolvedValue(createMockResponse({
      data: [
        {
          job_title: 'Test Engineer',
          company_name: 'TestCo',
          location: 'Office',
          description: 'A test job',
          job_url: 'https://example.com/job/test',
        },
      ],
    }))
    const result = await provider.search(mockInput)
    expect(result).toHaveLength(1)
    expect(result[0]!.title).toBe('Test Engineer')
    expect(result[0]!.salary).toBeUndefined()
  })

  it('filters by query on client side', async () => {
    mockPost.mockResolvedValue(createMockResponse())
    const queryInput = { ...mockInput, q: 'nonexistent' }
    const result = await provider.search(queryInput)
    expect(result).toHaveLength(0)
  })

  it('returns empty array on API failure', async () => {
    mockPost.mockRejectedValue(new Error('API unavailable'))
    const result = await provider.search(mockInput)
    expect(result).toEqual([])
  })

  it('builds correct POST body with country filter', async () => {
    mockPost.mockResolvedValue(createMockResponse())
    await provider.search(mockInput)

    const callBody = mockPost.mock.calls[0]?.[1]
    expect(callBody?.country).toBe('br')
    expect(callBody?.page).toBe(1)
    expect(callBody?.limit).toBe(20)
  })

  it('includes job_title in POST body when query is provided', async () => {
    mockPost.mockResolvedValue(createMockResponse())
    const queryInput = { ...mockInput, q: 'react' }
    await provider.search(queryInput)

    const callBody = mockPost.mock.calls[0]?.[1]
    expect(callBody?.job_title).toBe('react')
  })

  it('hasMorePages returns true when more pages exist', () => {
    const response = { data: [], total: 50 }
    expect(provider['hasMorePages'](response, 1)).toBe(true)
  })

  it('hasMorePages returns false when no more pages', () => {
    const response = { data: [], total: 10 }
    expect(provider['hasMorePages'](response, 1)).toBe(false)
  })

  it('hasMorePages returns false for invalid response', () => {
    expect(provider['hasMorePages'](null, 1)).toBe(false)
    expect(provider['hasMorePages'](undefined, 1)).toBe(false)
  })

  it('cleans HTML from description', async () => {
    mockPost.mockResolvedValue(createMockResponse())
    const result = await provider.search(mockInput)
    expect(result[0]!.description).not.toContain('<p>')
    expect(result[0]!.description).toContain('Great tech opportunity')
  })

  it('infers seniority from job title', async () => {
    mockPost.mockResolvedValue(createMockResponse())
    const result = await provider.search(mockInput)
    expect(result[0]!.seniority).toBe('senior')
  })

  it('createTheirStackProvider factory returns provider with empty key when env var missing', async () => {
    const { createTheirStackProvider } = await import('./theirstack-provider.ts')
    const created = await createTheirStackProvider()
    expect(created).toBeInstanceOf(TheirStackProvider)
    const result = await created.search(mockInput)
    expect(result).toEqual([])
  })
})
