import { describe, it, expect } from 'vitest'
import {
  GREENHOUSE_COMPANIES,
  ASHBY_COMPANIES,
  LEVER_COMPANIES,
  WORKDAY_COMPANIES,
  getCompanyDisplayName,
} from './companies.ts'

describe('companies config', () => {
  it('should have Greenhouse companies', () => {
    expect(GREENHOUSE_COMPANIES.length).toBeGreaterThanOrEqual(10)
    expect(GREENHOUSE_COMPANIES.some((c) => c.name === 'Stripe')).toBe(true)
    expect(GREENHOUSE_COMPANIES.some((c) => c.name === 'Airbnb')).toBe(true)
    expect(GREENHOUSE_COMPANIES.some((c) => c.name === 'Coinbase')).toBe(true)
  })

  it('should have Ashby companies', () => {
    expect(ASHBY_COMPANIES.length).toBeGreaterThanOrEqual(5)
    expect(ASHBY_COMPANIES.some((c) => c.name === 'Notion')).toBe(true)
    expect(ASHBY_COMPANIES.some((c) => c.name === 'Linear')).toBe(true)
  })

  it('should have Lever companies', () => {
    expect(LEVER_COMPANIES.length).toBeGreaterThanOrEqual(2)
    expect(LEVER_COMPANIES.some((c) => c.name === 'Netflix')).toBe(true)
    expect(LEVER_COMPANIES.some((c) => c.name === 'AngelList')).toBe(true)
  })

  it('should have Workday companies', () => {
    expect(WORKDAY_COMPANIES.length).toBeGreaterThanOrEqual(3)
    expect(WORKDAY_COMPANIES.some((c) => c.name === 'Target')).toBe(true)
  })

  it('should resolve display names', () => {
    expect(getCompanyDisplayName('stripe')).toBe('Stripe')
    expect(getCompanyDisplayName('notion')).toBe('Notion')
    expect(getCompanyDisplayName('unknown')).toBe('unknown')
  })

  it('should have unique board tokens per company list', () => {
    const tokens = GREENHOUSE_COMPANIES.map((c) => c.boardToken)
    expect(new Set(tokens).size).toBe(tokens.length)
  })
})
