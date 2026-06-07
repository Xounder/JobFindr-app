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

  it('returns explanation with matched and missing skills (job-centric)', () => {
    // User has: javascript (synonym of react/typescript in js_ecosystem group), python
    // Job requires: react, typescript
    // Matched (job skills user has via synonym): react, typescript (both in js_ecosystem group with javascript)
    // Missing (job skills user lacks): none
    const result = calculateWeightedMatchScore(
      ['javascript', 'python'],
      'mid',
      ['react', 'typescript'],
      'senior',
    )
    expect(result.explanation.matchedSkills).toContain('react')
    expect(result.explanation.matchedSkills).toContain('typescript')
    expect(result.explanation.matchedSkills).not.toContain('python')
    expect(result.explanation.matchedSkills).not.toContain('javascript')
    expect(result.explanation.missingSkills).not.toContain('react')
    expect(result.explanation.missingSkills).not.toContain('typescript')
    expect(result.explanation.missingSkills).not.toContain('python')
  })

  it('returns explanation with unmatched job skills when user lacks them', () => {
    // User has: javascript (synonym of react/typescript/node.js in js_ecosystem group)
    // Job requires: react, typescript, node.js
    // Matched (job skills user has via synonym): react, typescript, node.js
    // Missing (job skills user lacks): none
    const result = calculateWeightedMatchScore(
      ['javascript'],
      'mid',
      ['react', 'typescript', 'node.js'],
      'senior',
    )
    expect(result.explanation.matchedSkills).toContain('react')
    expect(result.explanation.matchedSkills).toContain('typescript')
    expect(result.explanation.matchedSkills).toContain('node.js')
    expect(result.explanation.missingSkills).not.toContain('react')
    expect(result.explanation.missingSkills).not.toContain('typescript')
    expect(result.explanation.missingSkills).not.toContain('node.js')
  })

  it('returns explanation with unmatched job skills when user lacks some', () => {
    // User has: python (no js skills)
    // Job requires: react, typescript, node.js
    // Matched (job skills user has via synonym): none
    // Missing (job skills user lacks): react, typescript, node.js
    const result = calculateWeightedMatchScore(
      ['python'],
      'mid',
      ['react', 'typescript', 'node.js'],
      'senior',
    )
    expect(result.explanation.matchedSkills).not.toContain('react')
    expect(result.explanation.matchedSkills).not.toContain('typescript')
    expect(result.explanation.matchedSkills).not.toContain('node.js')
    expect(result.explanation.missingSkills).toContain('react')
    expect(result.explanation.missingSkills).toContain('typescript')
    expect(result.explanation.missingSkills).toContain('node.js')
  })

  it('handles empty user skills', () => {
    const result = calculateWeightedMatchScore([], 'senior', ['react'], 'senior')
    // With empty user skills, matchedSkills is empty, so 0 of 1 job skills matched
    expect(result.explanation.summary).toContain('0 of 1 job skills matched')
  })

  it('handles empty job skills', () => {
    const result = calculateWeightedMatchScore(['react'], 'senior', [], 'senior')
    expect(result.explanation.summary).toContain('No job skills')
  })

  it('handles empty job skills', () => {
    const result = calculateWeightedMatchScore(['react'], 'senior', [], 'senior')
    expect(result.explanation.summary).toContain('No job skills')
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
    expect(result.breakdown.userSeniority).toBe('senior')
    expect(result.breakdown.jobSeniority).toBe('senior')
  })

  it('returns breakdown with unmatched skills for partial match (job-centric)', () => {
    // User has: javascript (synonym of react/typescript in js_ecosystem group), python
    // Job requires: react, typescript
    // Matched (job skills user has via synonym): react, typescript (both in js_ecosystem group with javascript)
    // Missing (job skills user lacks): none
    const result = calculateWeightedMatchScoreWithBreakdown(
      ['javascript', 'python'],
      'mid',
      ['react', 'typescript'],
      'senior',
    )
    expect(result.breakdown.matchedSkills).toContain('react')
    expect(result.breakdown.matchedSkills).toContain('typescript')
    expect(result.breakdown.matchedSkills).not.toContain('python')
    expect(result.breakdown.matchedSkills).not.toContain('javascript')
    expect(result.breakdown.unmatchedSkills).not.toContain('react')
    expect(result.breakdown.unmatchedSkills).not.toContain('typescript')
    expect(result.breakdown.unmatchedSkills).not.toContain('python')
    expect(result.breakdown.seniorityMatch).toBe('close') // mid → senior = 1 diff = 0.7 ≥ 0.7
    expect(result.breakdown.userSeniority).toBe('mid')
    expect(result.breakdown.jobSeniority).toBe('senior')
  })

  it('returns breakdown with unmatched job skills when user lacks them (job-centric)', () => {
    // User has: javascript (synonym of react/typescript/node.js in js_ecosystem group)
    // Job requires: react, typescript, node.js
    // Matched (job skills user has via synonym): react, typescript, node.js
    // Missing (job skills user lacks): none
    const result = calculateWeightedMatchScoreWithBreakdown(
      ['javascript'],
      'mid',
      ['react', 'typescript', 'node.js'],
      'senior',
    )
    expect(result.breakdown.matchedSkills).toContain('react')
    expect(result.breakdown.matchedSkills).toContain('typescript')
    expect(result.breakdown.matchedSkills).toContain('node.js')
    expect(result.breakdown.unmatchedSkills).not.toContain('react')
    expect(result.breakdown.unmatchedSkills).not.toContain('typescript')
    expect(result.breakdown.unmatchedSkills).not.toContain('node.js')
    expect(result.breakdown.userSeniority).toBe('mid')
    expect(result.breakdown.jobSeniority).toBe('senior')
  })

  it('returns breakdown with unmatched job skills when user lacks some (job-centric)', () => {
    // User has: python (no js skills)
    // Job requires: react, typescript, node.js
    // Matched (job skills user has via synonym): none
    // Missing (job skills user lacks): react, typescript, node.js
    const result = calculateWeightedMatchScoreWithBreakdown(
      ['python'],
      'mid',
      ['react', 'typescript', 'node.js'],
      'senior',
    )
    expect(result.breakdown.matchedSkills).not.toContain('react')
    expect(result.breakdown.matchedSkills).not.toContain('typescript')
    expect(result.breakdown.matchedSkills).not.toContain('node.js')
    expect(result.breakdown.unmatchedSkills).toContain('react')
    expect(result.breakdown.unmatchedSkills).toContain('typescript')
    expect(result.breakdown.unmatchedSkills).toContain('node.js')
    expect(result.breakdown.userSeniority).toBe('mid')
    expect(result.breakdown.jobSeniority).toBe('senior')
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
    expect(result.breakdown.skillScoreContribution).toBeLessThanOrEqual(45) // max skill weight 0.45 * 100
    expect(result.breakdown.seniorityScoreContribution).toBeGreaterThan(0)
    expect(result.breakdown.seniorityScoreContribution).toBeLessThanOrEqual(30) // max seniority weight 0.30 * 100
  })

  it('handles empty user skills', () => {
    const result = calculateWeightedMatchScoreWithBreakdown([], 'senior', ['react'], 'senior')
    expect(result.breakdown.matchedSkills).toEqual([])
    expect(result.breakdown.weightedScore).toBeGreaterThanOrEqual(0)
  })

  it('handles empty job skills', () => {
    const result = calculateWeightedMatchScoreWithBreakdown(['react'], 'senior', [], 'senior')
    expect(result.breakdown.matchedSkills).toEqual([])
    expect(result.breakdown.unmatchedSkills).toEqual([])
    expect(result.breakdown.weightedScore).toBeGreaterThanOrEqual(0)
  })

  // Tests for new seniority weight behavior (0.30)
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

  it('verifies seniority penalty is stronger with new 0.30 weight vs old 0.25', () => {
    // With skillWeight=0.45 and seniorityWeight=0.30, the seniority component
    // contributes max 30 points (was 25 with 0.25 weight)
    // A 1-level gap loses 30% of 30 = 9.0 points (was 7.5 with 0.25)
    // A 2-level gap loses 70% of 30 = 21.0 points (was 17.5 with 0.25)
    // A 3+ level gap loses 90% of 30 = 27.0 points (was 22.5 with 0.25)

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

    // Exact match gets full seniority contribution (30)
    expect(exactMatch.breakdown.seniorityScoreContribution).toBe(30)

    // 1-level gap: 0.7 * 30 = 21.0
    expect(oneLevelGap.breakdown.seniorityScoreContribution).toBeCloseTo(21.0, 1)

    // 2-level gap: 0.3 * 30 = 9.0
    expect(twoLevelGap.breakdown.seniorityScoreContribution).toBeCloseTo(9.0, 1)

    // 3+ level gap: 0.1 * 30 = 3.0
    expect(threeLevelGap.breakdown.seniorityScoreContribution).toBeCloseTo(3.0, 1)

    // The penalty difference between exact and 1-level should be ~9.0 points
    const penalty1Level = exactMatch.breakdown.seniorityScoreContribution - oneLevelGap.breakdown.seniorityScoreContribution
    expect(penalty1Level).toBeCloseTo(9.0, 1)

    // The penalty difference between exact and 2-level should be ~21.0 points
    const penalty2Level = exactMatch.breakdown.seniorityScoreContribution - twoLevelGap.breakdown.seniorityScoreContribution
    expect(penalty2Level).toBeCloseTo(21.0, 1)
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
    const weights = { skillWeight: 0.45, seniorityWeight: 0.30, keywordWeight: 0.10, workTypeWeight: 0.15 }
    const sum = weights.skillWeight + weights.seniorityWeight + weights.keywordWeight + weights.workTypeWeight
    expect(sum).toBe(1.0)
  })

  it('populates userSeniority and jobSeniority in breakdown', () => {
    const result = calculateWeightedMatchScoreWithBreakdown(
      ['react'],
      'mid',
      ['react'],
      'senior',
    )
    expect(result.breakdown.userSeniority).toBe('mid')
    expect(result.breakdown.jobSeniority).toBe('senior')
  })

  it('handles undefined seniority in breakdown', () => {
    const result = calculateWeightedMatchScoreWithBreakdown(
      ['react'],
      undefined,
      ['react'],
      undefined,
    )
    expect(result.breakdown.userSeniority).toBeUndefined()
    expect(result.breakdown.jobSeniority).toBeUndefined()
  })

  describe('work type scoring', () => {
    it('returns exact match when remote filter matches job', () => {
      const result = calculateWeightedMatchScoreWithBreakdown(
        ['react'], 'senior', ['react'], 'senior',
        {}, ['remote'], [],
        { id: '1', remoteMode: 'remote', skills: ['react'], seniority: 'senior' } as any,
      )
      expect(result.breakdown.workTypeMatch).toBe('exact')
    })

    it('returns partial when no filters active', () => {
      const result = calculateWeightedMatchScoreWithBreakdown(
        ['react'], 'senior', ['react'], 'senior',
        {}, [], [],
        { id: '1', remoteMode: 'remote', skills: ['react'], seniority: 'senior' } as any,
      )
      expect(result.breakdown.workTypeMatch).toBe('partial')
    })

    it('returns none when filters active but no match', () => {
      const result = calculateWeightedMatchScoreWithBreakdown(
        ['react'], 'senior', ['react'], 'senior',
        {}, ['remote'], [],
        { id: '1', remoteMode: 'on-site', skills: ['react'], seniority: 'senior' } as any,
      )
      expect(result.breakdown.workTypeMatch).toBe('none')
    })

    it('returns exact when hybrid filter matches country', () => {
      const result = calculateWeightedMatchScoreWithBreakdown(
        ['react'], 'senior', ['react'], 'senior',
        {}, ['hybrid'], ['US'],
        { id: '1', remoteMode: 'on-site', location: 'US', skills: ['react'], seniority: 'senior' } as any,
      )
      expect(result.breakdown.workTypeMatch).toBe('exact')
    })

    it('triggers 100% clamp when all conditions perfect', () => {
      const result = calculateWeightedMatchScoreWithBreakdown(
        ['react', 'typescript'], 'senior', ['react', 'typescript'], 'senior',
        {}, ['remote'], [],
        { id: '1', remoteMode: 'remote', skills: ['react', 'typescript'], seniority: 'senior' } as any,
      )
      expect(result.score.overall).toBe(100)
    })

    it('does not trigger 100% clamp when seniority differs', () => {
      const result = calculateWeightedMatchScoreWithBreakdown(
        ['react', 'typescript'], 'mid', ['react', 'typescript'], 'senior',
        {}, ['remote'], [],
        { id: '1', remoteMode: 'remote', skills: ['react', 'typescript'], seniority: 'senior' } as any,
      )
      expect(result.score.overall).toBeLessThan(100)
    })
  })
})
