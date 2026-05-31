import { describe, it, expect } from 'vitest'
import { calculateSimilarity } from './similarity-engine.ts'

describe('calculateSimilarity', () => {
  it('returns perfect score for identical skill sets', () => {
    const result = calculateSimilarity(['react', 'typescript'], ['react', 'typescript'])
    expect(result.jaccardScore).toBe(1)
    expect(result.combinedScore).toBeGreaterThan(0.9)
    expect(result.matchedSkills).toEqual(['react', 'typescript'])
    expect(result.missingSkills).toEqual([])
  })

  it('returns zero for completely different skills', () => {
    const result = calculateSimilarity(['python', 'docker'], ['react', 'figma'])
    expect(result.jaccardScore).toBe(0)
    expect(result.matchedSkills).toEqual([])
    expect(result.missingSkills).toEqual(['python', 'docker'])
  })

  it('detects synonym matches', () => {
    const result = calculateSimilarity(['react'], ['vue'])
    expect(result.synonymScore).toBeGreaterThan(0)
    expect(result.matchedSkills).toContain('react')
  })

  it('handles empty user skills', () => {
    const result = calculateSimilarity([], ['react'])
    expect(result.jaccardScore).toBe(0)
    expect(result.combinedScore).toBe(0)
  })

  it('is case insensitive', () => {
    const result = calculateSimilarity(['React', 'TypeScript'], ['react', 'typescript'])
    expect(result.jaccardScore).toBe(1)
  })

  it('handles partial keyword matches', () => {
    const result = calculateSimilarity(['node'], ['node.js', 'express'])
    expect(result.keywordScore).toBeGreaterThan(0)
  })
})
