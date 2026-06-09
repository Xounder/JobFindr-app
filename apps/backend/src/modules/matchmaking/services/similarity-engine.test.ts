import { describe, it, expect } from 'vitest'
import { calculateSimilarity } from './similarity-engine.ts'

describe('calculateSimilarity', () => {
  it('returns perfect score for identical skill sets', () => {
    const result = calculateSimilarity(['react', 'typescript'], ['react', 'typescript'])
    expect(result.coverageScore).toBe(1)
    expect(result.combinedScore).toBeGreaterThan(0.9)
    expect(result.matchedSkills).toEqual(['react', 'typescript'])
    expect(result.missingSkills).toEqual([])
  })

  it('returns zero for completely different skills', () => {
    const result = calculateSimilarity(['python', 'docker'], ['react', 'figma'])
    expect(result.coverageScore).toBe(0)
    // Job-centric: missingSkills now contains job skills user doesn't have
    expect(result.matchedSkills).toEqual([])
    expect(result.missingSkills).toEqual(['react', 'figma'])
  })

  it('detects synonym matches (job-centric)', () => {
    const result = calculateSimilarity(['react'], ['vue'])
    expect(result.synonymScore).toBeGreaterThan(0)
    // Job-centric: matchedSkills contains job skill (vue) that matches via synonym
    expect(result.matchedSkills).toContain('vue')
  })

  it('handles empty user skills', () => {
    const result = calculateSimilarity([], ['react'])
    expect(result.coverageScore).toBe(0)
    expect(result.combinedScore).toBe(0)
    expect(result.matchedSkills).toEqual([])
    expect(result.missingSkills).toEqual(['react'])
  })

  it('handles empty job skills', () => {
    const result = calculateSimilarity(['react'], [])
    expect(result.coverageScore).toBe(0)
    expect(result.combinedScore).toBe(0)
    expect(result.matchedSkills).toEqual([])
    expect(result.missingSkills).toEqual([])
  })

  it('is case insensitive', () => {
    const result = calculateSimilarity(['React', 'TypeScript'], ['react', 'typescript'])
    expect(result.coverageScore).toBe(1)
  })

  it('handles partial keyword matches', () => {
    const result = calculateSimilarity(['node'], ['node.js', 'express'])
    expect(result.keywordScore).toBeGreaterThan(0)
  })

  it('job-centric: matchedSkills are job skills user has, missingSkills are job skills user lacks', () => {
    // User has: javascript (synonym of react/typescript/node.js in js_ecosystem group), python
    // Job requires: react, typescript, node.js
    // Matched (job skills user has via synonym): react, typescript, node.js (all in js_ecosystem group with javascript)
    // Missing (job skills user lacks): none
    const result = calculateSimilarity(['javascript', 'python'], ['react', 'typescript', 'node.js'])
    expect(result.matchedSkills).toContain('react')
    expect(result.matchedSkills).toContain('typescript')
    expect(result.matchedSkills).toContain('node.js')
    expect(result.matchedSkills).not.toContain('python')
    expect(result.matchedSkills).not.toContain('javascript')
    expect(result.missingSkills).not.toContain('react')
    expect(result.missingSkills).not.toContain('typescript')
    expect(result.missingSkills).not.toContain('node.js')
    expect(result.missingSkills).not.toContain('python')
  })

  it('job-centric: user has javascript, job requires react and node.js', () => {
    // User has: javascript
    // Job requires: react, node.js
    // Matched (job skills user has via synonym): react, node.js (both in js_ecosystem group with javascript)
    // Missing (job skills user lacks): none
    const result = calculateSimilarity(['javascript'], ['react', 'node.js'])
    expect(result.matchedSkills).toContain('react')
    expect(result.matchedSkills).toContain('node.js')
    expect(result.matchedSkills).not.toContain('javascript') // job-centric: matched skills are JOB skills
    expect(result.missingSkills).not.toContain('react')
    expect(result.missingSkills).not.toContain('node.js')
  })
})
