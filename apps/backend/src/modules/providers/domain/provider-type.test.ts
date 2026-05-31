import { describe, it, expect } from 'vitest'
import { isHttpBased, getProviderTypeLabel } from './provider-type.ts'

describe('provider-type', () => {
  it('should identify HTTP-based types', () => {
    expect(isHttpBased('api')).toBe(true)
    expect(isHttpBased('json')).toBe(true)
    expect(isHttpBased('html')).toBe(false)
    expect(isHttpBased('browser')).toBe(false)
  })

  it('should return labels for all types', () => {
    expect(getProviderTypeLabel('api')).toBe('REST API')
    expect(getProviderTypeLabel('json')).toBe('JSON Endpoint')
    expect(getProviderTypeLabel('html')).toBe('HTML Scraping')
    expect(getProviderTypeLabel('browser')).toBe('Browser Automation')
  })
})
