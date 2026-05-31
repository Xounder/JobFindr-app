import { describe, it, expect, vi } from 'vitest'
import { runAllProviders, runSingleProvider } from './provider-engine.ts'
import type { JobProvider, ValidatedSearchInput } from '@jobfindr/types'

vi.mock('../../../shared/services/provider-isolation.ts', () => ({
  executeIsolatedProvider: vi.fn((name: string, fn: (input: ValidatedSearchInput) => Promise<unknown[]>, _input: ValidatedSearchInput, _timeoutMs: number) => {
    return fn(_input).then(
      (jobs: unknown[]) => ({
        providerName: name,
        success: true,
        jobs,
        error: null,
        latencyMs: 10,
      }),
      (error: Error) => ({
        providerName: name,
        success: false,
        jobs: [],
        error: error.message,
        latencyMs: 10,
      })
    )
  }),
}))

vi.mock('../../search/services/timeout-manager.ts', () => ({
  getProviderTimeout: vi.fn(() => 10000),
}))

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

describe('runAllProviders', () => {
  it('should aggregate results from multiple providers', async () => {
    const provider1: JobProvider = {
      name: 'provider1',
      providerType: 'api',
      search: vi.fn().mockResolvedValue([{ id: '1', title: 'Job 1' }]),
    }
    const provider2: JobProvider = {
      name: 'provider2',
      providerType: 'api',
      search: vi.fn().mockResolvedValue([{ id: '2', title: 'Job 2' }]),
    }

    const result = await runAllProviders([provider1, provider2], mockInput)
    expect(result.jobs).toHaveLength(2)
    expect(result.succeededCount).toBe(2)
    expect(result.failedCount).toBe(0)
  })

  it('should handle provider failures without blocking others', async () => {
    const provider1: JobProvider = {
      name: 'provider1',
      providerType: 'api',
      search: vi.fn().mockRejectedValue(new Error('Failure')),
    }
    const provider2: JobProvider = {
      name: 'provider2',
      providerType: 'api',
      search: vi.fn().mockResolvedValue([{ id: '2', title: 'Job 2' }]),
    }

    const result = await runAllProviders([provider1, provider2], mockInput)
    expect(result.jobs).toHaveLength(1)
    expect(result.succeededCount).toBe(1)
    expect(result.failedCount).toBe(1)
  })

  it('should return empty result when no providers provided', async () => {
    const result = await runAllProviders([], mockInput)
    expect(result.jobs).toHaveLength(0)
    expect(result.results).toHaveLength(0)
  })
})

describe('runSingleProvider', () => {
  it('should return provider result', async () => {
    const provider: JobProvider = {
      name: 'test',
      providerType: 'api',
      search: vi.fn().mockResolvedValue([{ id: '1', title: 'Job 1' }]),
    }

    const result = await runSingleProvider(provider, mockInput, 5000)
    expect(result.success).toBe(true)
    expect(result.jobs).toHaveLength(1)
  })
})
