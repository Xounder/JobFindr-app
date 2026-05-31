import { describe, it, expect, beforeEach } from 'vitest'
import { providerHealthStore } from './provider-health.ts'

describe('ProviderHealthStore', () => {
  beforeEach(() => {
    providerHealthStore.reset()
  })

  it('should record success', () => {
    providerHealthStore.recordSuccess('greenhouse', 100)
    const status = providerHealthStore.getStatus('greenhouse')
    expect(status).not.toBeNull()
    expect(status!.successCount).toBe(1)
    expect(status!.failureCount).toBe(0)
    expect(status!.lastSuccessAt).not.toBeNull()
  })

  it('should record failure', () => {
    providerHealthStore.recordFailure('ashby', 200)
    const status = providerHealthStore.getStatus('ashby')
    expect(status).not.toBeNull()
    expect(status!.failureCount).toBe(1)
    expect(status!.lastFailureAt).not.toBeNull()
  })

  it('should track average latency', () => {
    providerHealthStore.recordSuccess('greenhouse', 100)
    providerHealthStore.recordSuccess('greenhouse', 200)
    const status = providerHealthStore.getStatus('greenhouse')
    expect(status!.averageLatencyMs).toBe(150)
  })

  it('should mark provider unhealthy with high failure rate', () => {
    providerHealthStore.recordSuccess('test', 100)
    for (let i = 0; i < 9; i++) {
      providerHealthStore.recordFailure('test', 100)
    }
    const status = providerHealthStore.getStatus('test')
    expect(status!.isHealthy).toBe(false)
    expect(status!.uptimePercent).toBe(10)
  })

  it('should return null for unknown provider', () => {
    const status = providerHealthStore.getStatus('nonexistent')
    expect(status).toBeNull()
  })

  it('should reset all data', () => {
    providerHealthStore.recordSuccess('greenhouse', 100)
    providerHealthStore.reset()
    // After reset, getStatus returns null (no record and no metadata in registry)
    const status = providerHealthStore.getStatus('greenhouse')
    // The record was cleared, but we can confirm it still has provider defaults
    // if provider is registered; otherwise null is expected for unregistered providers
    expect(status).toBeNull()
  })
})
