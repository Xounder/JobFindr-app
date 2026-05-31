import { describe, it, expect } from 'vitest'
import { calculateWeightedMatchScore } from './weighted-match-scoring.ts'

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
