import { describe, it, expect } from 'vitest'
import { calculateTrustScore } from './trust-score-formula.ts'
import type { TrustSignals } from '@jobfindr/types'

describe('calculateTrustScore', () => {
  const goodProvider = { score: 8, successRate: 0.95, averageLatencyMs: 200, totalRequests: 100 }
  const goodSignals: TrustSignals = {
    hasWebsite: true,
    hasLinkedIn: true,
    isPublicCompany: true,
    companySize: 'large',
    complaintScore: 1,
    transparencyScore: 8,
  }

  it('returns high score for reputable company and provider', () => {
    const result = calculateTrustScore(goodProvider, {
      name: 'Google',
      signals: goodSignals,
    })
    expect(result.overall).toBeGreaterThanOrEqual(7)
  })

  it('returns low score for unknown company', () => {
    const badSignals: TrustSignals = {
      hasWebsite: false,
      hasLinkedIn: false,
      isPublicCompany: false,
      companySize: 'unknown',
      complaintScore: 8,
      transparencyScore: 1,
    }
    const result = calculateTrustScore(
      { score: 2, successRate: 0.3, averageLatencyMs: 5000, totalRequests: 1 },
      { name: 'unknown-company', signals: badSignals },
    )
    expect(result.overall).toBeLessThan(5)
  })

  it('provider reputation contributes 30%', () => {
    const signals: TrustSignals = {
      hasWebsite: false, hasLinkedIn: false, isPublicCompany: false,
      companySize: 'unknown', complaintScore: 5, transparencyScore: 5,
    }
    const low = calculateTrustScore(
      { score: 1, successRate: 0.1, averageLatencyMs: 9999, totalRequests: 10 },
      { name: 'x', signals },
    )
    const high = calculateTrustScore(
      { score: 10, successRate: 1, averageLatencyMs: 10, totalRequests: 1000 },
      { name: 'x', signals },
    )
    expect(high.overall).toBeGreaterThan(low.overall)
  })

  it('transparency signals increase score', () => {
    const base = { score: 5, successRate: 0.8, averageLatencyMs: 500, totalRequests: 50 }
    const withWebsite: TrustSignals = {
      hasWebsite: true, hasLinkedIn: false, isPublicCompany: false,
      companySize: 'small', complaintScore: 1, transparencyScore: 5,
    }
    const withoutWebsite: TrustSignals = {
      hasWebsite: false, hasLinkedIn: false, isPublicCompany: false,
      companySize: 'small', complaintScore: 1, transparencyScore: 5,
    }
    const withSite = calculateTrustScore(base, { name: 'co', signals: withWebsite })
    const withoutSite = calculateTrustScore(base, { name: 'co', signals: withoutWebsite })
    expect(withSite.overall).toBeGreaterThan(withoutSite.overall)
  })

  it('returned overall is between 0 and 10', () => {
    const signals: TrustSignals = {
      hasWebsite: true, hasLinkedIn: true, isPublicCompany: true,
      companySize: 'enterprise', complaintScore: 0, transparencyScore: 10,
    }
    const result = calculateTrustScore(
      { score: 10, successRate: 1, averageLatencyMs: 10, totalRequests: 1000 },
      { name: 'BigCo', signals },
    )
    expect(result.overall).toBeGreaterThanOrEqual(0)
    expect(result.overall).toBeLessThanOrEqual(10)
  })
})
