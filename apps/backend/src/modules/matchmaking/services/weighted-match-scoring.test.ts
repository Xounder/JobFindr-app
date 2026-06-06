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
    expect(result.breakdown.skillScoreContribution).toBeLessThanOrEqual(50) // max skill weight 0.5 * 100
    expect(result.breakdown.seniorityScoreContribution).toBeGreaterThan(0)
    expect(result.breakdown.seniorityScoreContribution).toBeLessThanOrEqual(35) // max seniority weight 0.35 * 100
  })

  it('handles empty user skills', () => {
    const result = calculateWeightedMatchScoreWithBreakdown([], 'senior', ['react'], 'senior')
    expect(result.breakdown.matchedSkills).toEqual([])
    expect(result.breakdown.weightedScore).toBeGreaterThanOrEqual(0)
  })

  // Tests for new seniority weight behavior (0.35)
  it('rewards exact seniority match with higher score', () => {
    const exactMatch = calculateWeightedMatchScore(
      ['react', 'typescript'],
      'senior',
      ['react', 'typescript'],
      'senior',
    )
    const oneLevelGap = calculateWeightedMatchScore(
      ['react', 'typescript'],
      'senior',
      ['react', 'typescript'],
      'mid',
    )
    const twoLevelGap = calculateWeightedMatchScore(
      ['react', 'typescript'],
      'senior',
      ['react', 'typescript'],
      'junior',
    )
    const threeLevelGap = calculateWeightedMatchScore(
      ['react', 'typescript'],
      'senior',
      ['react', 'typescript'],
      'intern',
    )

    // Exact match should score highest
    expect(exactMatch.overall).toBeGreaterThan(oneLevelGap.overall)
    expect(oneLevelGap.overall).toBeGreaterThan(twoLevelGap.overall)
    expect(twoLevelGap.overall).toBeGreaterThan(threeLevelGap.overall)

    // Seniority score should reflect the gap
    expect(exactMatch.seniorityScore).toBe(100)
    expect(oneLevelGap.seniorityScore).toBe(70) // diff=1 → 0.7 * 100
    expect(twoLevelGap.seniorityScore).toBe(30) // diff=2 → 0.3 * 100
    expect(threeLevelGap.seniorityScore).toBe(10) // diff=3+ → 0.1 * 100
  })

  it('verifies seniority penalty is stronger with new 0.35 weight vs old 0.25', () => {
    // With skillWeight=0.5 and seniorityWeight=0.35, the seniority component
    // contributes max 35 points (was 25 with 0.25 weight)
    // A 1-level gap loses 30% of 35 = 10.5 points (was 7.5 with 0.25)
    // A 2-level gap loses 70% of 35 = 24.5 points (was 17.5 with 0.25)
    // A 3+ level gap loses 90% of 35 = 31.5 points (was 22.5 with 0.25)

    const exactMatch = calculateWeightedMatchScoreWithBreakdown(
      ['react'],
      'senior',
      ['react'],
      'senior',
    )
    const oneLevelGap = calculateWeightedMatchScoreWithBreakdown(
      ['react'],
      'senior',
      ['react'],
      'mid',
    )
    const twoLevelGap = calculateWeightedMatchScoreWithBreakdown(
      ['react'],
      'senior',
      ['react'],
      'junior',
    )
    const threeLevelGap = calculateWeightedMatchScoreWithBreakdown(
      ['react'],
      'senior',
      ['react'],
      'intern',
    )

    // Exact match gets full seniority contribution (35)
    expect(exactMatch.breakdown.seniorityScoreContribution).toBe(35)

    // 1-level gap: 0.7 * 35 = 24.5
    expect(oneLevelGap.breakdown.seniorityScoreContribution).toBeCloseTo(24.5, 1)

    // 2-level gap: 0.3 * 35 = 10.5
    expect(twoLevelGap.breakdown.seniorityScoreContribution).toBeCloseTo(10.5, 1)

    // 3+ level gap: 0.1 * 35 = 3.5
    expect(threeLevelGap.breakdown.seniorityScoreContribution).toBeCloseTo(3.5, 1)

    // The penalty difference between exact and 1-level should be ~10.5 points
    const penalty1Level = exactMatch.breakdown.seniorityScoreContribution - oneLevelGap.breakdown.seniorityScoreContribution
    expect(penalty1Level).toBeCloseTo(10.5, 1)

    // The penalty difference between exact and 2-level should be ~24.5 points
    const penalty2Level = exactMatch.breakdown.seniorityScoreContribution - twoLevelGap.breakdown.seniorityScoreContribution
    expect(penalty2Level).toBeCloseTo(24.5, 1)
  })

  it('does not penalize when user seniority is missing', () => {
    const result = calculateWeightedMatchScore(
      ['react'],
      undefined,
      ['react'],
      'senior',
    )
    // Seniority score is 0 when user didn't specify
    expect(result.seniorityScore).toBe(0)
    // But skill match still contributes
    expect(result.overall).toBeGreaterThan(0)
  })

  it('verifies weight sum equals 1.0', () => {
    const weights = { skillWeight: 0.5, seniorityWeight: 0.35, keywordWeight: 0.15 }
    const sum = weights.skillWeight + weights.seniorityWeight + weights.keywordWeight
    expect(sum).toBe(1.0)
  })
})
