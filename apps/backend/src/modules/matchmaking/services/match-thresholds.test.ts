import { describe, it, expect } from 'vitest'
import { getThresholdForScore, getMatchScoreColor, THRESHOLD_CONFIGS } from './match-thresholds.ts'

describe('getThresholdForScore', () => {
  it('returns excellent for >= 85', () => {
    expect(getThresholdForScore(90).label).toBe('excellent')
  })
  it('returns good for >= 70', () => {
    expect(getThresholdForScore(75).label).toBe('good')
  })
  it('returns fair for >= 50', () => {
    expect(getThresholdForScore(55).label).toBe('fair')
  })
  it('returns poor for < 50', () => {
    expect(getThresholdForScore(20).label).toBe('poor')
  })
})

describe('getMatchScoreColor', () => {
  it('returns green for excellent', () => {
    expect(getMatchScoreColor(90)).toBe('green')
  })
  it('returns red for poor', () => {
    expect(getMatchScoreColor(10)).toBe('red')
  })
})

describe('THRESHOLD_CONFIGS', () => {
  it('has all threshold configs', () => {
    expect(Object.keys(THRESHOLD_CONFIGS)).toEqual(['excellent', 'good', 'fair', 'poor'])
  })
})
