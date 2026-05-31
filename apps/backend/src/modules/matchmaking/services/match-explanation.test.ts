import { describe, it, expect } from 'vitest'
import { generateMatchExplanation } from './match-explanation.ts'
import type { MatchScore } from '@jobfindr/types'

describe('generateMatchExplanation', () => {
  const baseScore: MatchScore = {
    overall: 85,
    skillScore: 80,
    seniorityScore: 90,
    keywordScore: 70,
    explanation: {
      matchedSkills: ['react', 'typescript'],
      missingSkills: ['python'],
      seniorityMatch: 'Exact seniority match',
      keywordMatches: ['react', 'typescript'],
      summary: 'Strong match!',
    },
  }

  it('generates excellent summary for high scores', () => {
    const result = generateMatchExplanation(baseScore, ['react', 'typescript'], 'Frontend Developer')
    expect(result.summary).toContain('Excellent match')
  })

  it('generates good summary for medium scores', () => {
    const midScore = { ...baseScore, overall: 75 }
    const result = generateMatchExplanation(midScore, ['react'], 'Backend Developer')
    expect(result.summary).toContain('Good match')
  })

  it('generates poor summary for low scores', () => {
    const lowScore = { ...baseScore, overall: 20 }
    const result = generateMatchExplanation(lowScore, ['python'], 'Designer')
    expect(result.summary).toContain('Limited match')
  })

  it('includes seniority match text', () => {
    const result = generateMatchExplanation(baseScore, ['react'], 'Developer')
    expect(result.seniorityMatch).toBeTruthy()
  })

  it('includes matched skills', () => {
    const result = generateMatchExplanation(baseScore, ['react', 'typescript'], 'Developer')
    expect(result.matchedSkills).toContain('react')
    expect(result.matchedSkills).toContain('typescript')
  })
})
