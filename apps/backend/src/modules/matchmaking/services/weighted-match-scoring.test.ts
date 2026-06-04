import { describe, it, expect } from 'vitest'
import { calculateWeightedMatchScore, calculateWeightedMatchScoreWithBreakdown } from './weighted-match-scoring.ts'

describe('calculateWeightedMatchScore', () => {
  it('returns high score for perfect match', () => {
    const result = calculateWeightedMatchScore(
      ['react', 'typescript', 'node'],
      'senior',
      ['react', 'typescript', 'node'],
      'senior',
    )
    expect(result.overall).toBeGreaterThanOrEqual(80)
    expect(result.seniorityScore).toBe(100)
  })

  it('returns low score for no match', () => {
    const result = calculateWeightedMatchScore(
      ['python'],
      'junior',
      ['react', 'figma'],
      'senior',
    )
    expect(result.overall).toBeLessThan(50)
  })

  it('penalizes when user seniority is missing (returns 0 instead of neutral 0.5)', () => {
    const result = calculateWeightedMatchScore(
      ['react'],
      undefined,
      ['react'],
      undefined,
    )
    // Skill match still contributes ~60, but seniority contributes 0
    expect(result.overall).toBeGreaterThanOrEqual(50)
    expect(result.seniorityScore).toBe(0)
  })

  it('accepts custom weights', () => {
    const result = calculateWeightedMatchScore(
      ['react'],
      'senior',
      ['react'],
      'senior',
      { skillWeight: 1, seniorityWeight: 0, keywordWeight: 0 },
    )
    expect(result.overall).toBeGreaterThan(80)
  })

  it('returns explanation with matched and missing skills', () => {
    const result = calculateWeightedMatchScore(
      ['react', 'python'],
      'mid',
      ['react', 'typescript'],
      'senior',
    )
    expect(result.explanation.matchedSkills).toContain('react')
    expect(result.explanation.missingSkills).toContain('python')
  })

  it('handles empty user skills', () => {
    const result = calculateWeightedMatchScore([], 'senior', ['react'], 'senior')
    expect(result.explanation.summary).toContain('No skills provided')
  })
})

describe('calculateWeightedMatchScoreWithBreakdown', () => {
  it('returns score and breakdown for perfect match', () => {
    const result = calculateWeightedMatchScoreWithBreakdown(
      ['react', 'typescript', 'node'],
      'senior',
      ['react', 'typescript', 'node'],
      'senior',
    )
    expect(result.score.overall).toBeGreaterThanOrEqual(80)
    expect(result.breakdown.matchedSkills).toEqual(['react', 'typescript', 'node'])
    expect(result.breakdown.unmatchedSkills).toEqual([])
    expect(result.breakdown.seniorityMatch).toBe('exact')
    expect(result.breakdown.weightedScore).toBe(result.score.overall)
    expect(result.breakdown.skillScoreContribution).toBeGreaterThan(0)
    expect(result.breakdown.seniorityScoreContribution).toBeGreaterThan(0)
  })

  it('returns breakdown with unmatched skills for partial match', () => {
    const result = calculateWeightedMatchScoreWithBreakdown(
      ['react', 'python', 'figma'],
      'mid',
      ['react', 'typescript'],
      'senior',
    )
    expect(result.breakdown.matchedSkills).toContain('react')
    expect(result.breakdown.unmatchedSkills).toContain('python')
    expect(result.breakdown.unmatchedSkills).toContain('figma')
    expect(result.breakdown.seniorityMatch).toBe('close') // mid → senior = 1 diff = 0.7 ≥ 0.7
  })

  it('returns seniorityMatch "none" for far-apart seniority', () => {
    const result = calculateWeightedMatchScoreWithBreakdown(
      ['react'],
      'intern',
      ['react'],
      'executive',
    )
    expect(result.breakdown.seniorityMatch).toBe('none')
  })

  it('returns seniorityMatch "exact" for same seniority', () => {
    const result = calculateWeightedMatchScoreWithBreakdown(
      ['react'],
      'junior',
      ['react'],
      'junior',
    )
    expect(result.breakdown.seniorityMatch).toBe('exact')
  })

  it('populates skillScoreContribution and seniorityScoreContribution', () => {
    const result = calculateWeightedMatchScoreWithBreakdown(
      ['react', 'typescript'],
      'senior',
      ['react', 'typescript'],
      'senior',
    )
    expect(result.breakdown.skillScoreContribution).toBeGreaterThan(0)
    expect(result.breakdown.skillScoreContribution).toBeLessThanOrEqual(60) // max skill weight 0.6 * 100
    expect(result.breakdown.seniorityScoreContribution).toBeGreaterThan(0)
    expect(result.breakdown.seniorityScoreContribution).toBeLessThanOrEqual(25) // max seniority weight 0.25 * 100
  })

  it('handles empty user skills', () => {
    const result = calculateWeightedMatchScoreWithBreakdown([], 'senior', ['react'], 'senior')
    expect(result.breakdown.matchedSkills).toEqual([])
    expect(result.breakdown.weightedScore).toBeGreaterThanOrEqual(0)
  })
})
