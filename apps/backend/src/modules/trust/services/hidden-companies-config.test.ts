import { describe, it, expect, beforeEach } from 'vitest'
import { HiddenCompaniesConfig } from './hidden-companies-config.ts'

describe('HiddenCompaniesConfig', () => {
  let config: HiddenCompaniesConfig

  beforeEach(() => {
    config = new HiddenCompaniesConfig()
  })

  it('has default hidden companies', () => {
    expect(config.isHidden('unknown-company')).toBe(true)
    expect(config.isHidden('test-company')).toBe(true)
  })

  it('does not mark normal companies as hidden', () => {
    expect(config.isHidden('Google')).toBe(false)
    expect(config.isHidden('Microsoft')).toBe(false)
  })

  it('allows adding companies to hidden list', () => {
    config.addCompany('bad-company')
    expect(config.isHidden('bad-company')).toBe(true)
  })

  it('allows removing companies from hidden list', () => {
    config.removeCompany('unknown-company')
    expect(config.isHidden('unknown-company')).toBe(false)
  })

  it('returns count of hidden companies', () => {
    expect(config.count).toBeGreaterThan(0)
  })

  it('returns all hidden companies', () => {
    const all = config.getAllHidden()
    expect(all).toContain('unknown-company')
    expect(all).toContain('test-company')
  })

  it('is case insensitive', () => {
    expect(config.isHidden('Unknown-Company')).toBe(true)
  })
})
