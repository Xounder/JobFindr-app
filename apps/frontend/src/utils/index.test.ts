import { describe, it, expect } from 'vitest'
import { formatDate, truncate, trustLabel, buildQueryString } from './index.ts'

describe('formatDate', () => {
  const now = new Date()
  const todayStr = now.toISOString()

  it('returns "Today" for current date', () => {
    expect(formatDate(todayStr)).toBe('Today')
  })

  it('returns "Yesterday" for one day ago', () => {
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
    expect(formatDate(yesterday)).toBe('Yesterday')
  })

  it('returns "X days ago" for less than 7 days', () => {
    const threeDays = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
    expect(formatDate(threeDays)).toBe('3 days ago')
  })

  it('returns formatted date for older dates', () => {
    const oldDate = new Date('2024-01-15').toISOString()
    const result = formatDate(oldDate)
    expect(result).toContain('Jan')
    expect(result).toContain('2024')
  })
})

describe('truncate', () => {
  it('returns original if within maxLength', () => {
    expect(truncate('short', 10)).toBe('short')
  })
  it('truncates and appends ellipsis', () => {
    expect(truncate('this is a long string', 10)).toBe('this is a…')
  })
})

describe('trustLabel', () => {
  it('returns "High Trust" for >= 9', () => {
    expect(trustLabel(9)).toBe('High Trust')
    expect(trustLabel(9.5)).toBe('High Trust')
    expect(trustLabel(10)).toBe('High Trust')
  })
  it('returns "Good Trust" for >= 8', () => {
    expect(trustLabel(8)).toBe('Good Trust')
    expect(trustLabel(8.9)).toBe('Good Trust')
  })
  it('returns "Trust" for >= 7', () => {
    expect(trustLabel(7)).toBe('Trust')
    expect(trustLabel(7.9)).toBe('Trust')
  })
  it('returns "Medium Trust" for >= 6', () => {
    expect(trustLabel(6)).toBe('Medium Trust')
    expect(trustLabel(6.9)).toBe('Medium Trust')
  })
  it('returns "Low Trust" for >= 5', () => {
    expect(trustLabel(5)).toBe('Low Trust')
    expect(trustLabel(5.9)).toBe('Low Trust')
  })
  it('returns "Extreme Low Trust" for < 5', () => {
    expect(trustLabel(4.9)).toBe('Extreme Low Trust')
    expect(trustLabel(0)).toBe('Extreme Low Trust')
  })
})

describe('buildQueryString', () => {
  it('builds query string from params', () => {
    const result = buildQueryString({ q: 'react', page: 1 })
    expect(result).toContain('q=react')
    expect(result).toContain('page=1')
  })
  it('skips undefined and empty values', () => {
    const result = buildQueryString({ q: 'react', skills: '' })
    expect(result).not.toContain('skills')
  })
  it('returns empty string for no params', () => {
    expect(buildQueryString({})).toBe('')
  })
})
