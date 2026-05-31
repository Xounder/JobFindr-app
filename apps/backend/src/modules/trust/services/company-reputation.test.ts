import { describe, it, expect } from 'vitest'
import { evaluateCompanyReputation, buildCompanySignals } from './company-reputation.ts'

describe('evaluateCompanyReputation', () => {
  it('returns high trust signals for well-known tech company', () => {
    const result = evaluateCompanyReputation('Google', 'Technology')
    expect(result.signals.isPublicCompany).toBe(true)
    expect(result.signals.hasLinkedIn).toBe(true)
    expect(result.signals.companySize).toBe('enterprise')
  })

  it('returns moderate signals for unknown small company', () => {
    const result = evaluateCompanyReputation('Some Small Startup')
    expect(result.signals.hasWebsite).toBe(true)
    expect(result.signals.companySize).toBe('unknown')
  })

  it('returns unknown for non-indicative company name', () => {
    const result = evaluateCompanyReputation('Acme Corp')
    expect(result.signals.companySize).toBe('unknown')
  })
})

describe('buildCompanySignals', () => {
  it('detects enterprise companies', () => {
    const signals = buildCompanySignals('jpmorgan')
    expect(signals.companySize).toBe('enterprise')
  })

  it('detects tech companies', () => {
    const signals = buildCompanySignals('TechCorp')
    expect(signals.companySize).toBe('medium')
  })

  it('marks public tech companies', () => {
    const signals = buildCompanySignals('microsoft')
    expect(signals.isPublicCompany).toBe(true)
  })
})
