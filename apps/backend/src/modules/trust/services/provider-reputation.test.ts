import { describe, it, expect, beforeEach } from 'vitest'
import { getProviderReputation, recordProviderRequest, resetProviderStats } from './provider-reputation.ts'

describe('getProviderReputation', () => {
  beforeEach(() => resetProviderStats())

  it('returns base score for known provider without stats', () => {
    const rep = getProviderReputation('linkedin')
    expect(rep.score).toBe(8)
    expect(rep.totalRequests).toBe(0)
  })

  it('returns default score for unknown provider', () => {
    const rep = getProviderReputation('unknown-provider')
    expect(rep.score).toBe(5)
  })

  it('adjusts score based on request success rate', () => {
    for (let i = 0; i < 10; i++) {
      recordProviderRequest('linkedin', true, 100)
    }
    const rep = getProviderReputation('linkedin')
    expect(rep.score).toBeGreaterThan(7)
    expect(rep.successRate).toBe(1)
    expect(rep.totalRequests).toBe(10)
  })

  it('decreases score with failures', () => {
    for (let i = 0; i < 5; i++) {
      recordProviderRequest('gupy', false, 5000)
    }
    const rep = getProviderReputation('gupy')
    expect(rep.score).toBeLessThan(4)
  })
})
