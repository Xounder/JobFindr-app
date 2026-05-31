import { describe, it, expect } from 'vitest'
import { validateSearchInput } from './search-validation.ts'

/**
 * Helper to create minimal valid params with defaults.
 */
function makeParams(overrides: Record<string, string | undefined> = {}): Record<string, string | undefined> {
  return {
    ...overrides,
  }
}

describe('validateSearchInput - userSkills', () => {
  it('parses comma-separated userSkills into array', () => {
    const result = validateSearchInput(makeParams({ userSkills: 'react,typescript,node' }))
    expect(result.userSkills).toEqual(['react', 'typescript', 'node'])
  })

  it('lowercases userSkills values', () => {
    const result = validateSearchInput(makeParams({ userSkills: 'React,TypeScript' }))
    expect(result.userSkills).toEqual(['react', 'typescript'])
  })

  it('returns empty array when userSkills is absent', () => {
    const result = validateSearchInput(makeParams({}))
    expect(result.userSkills).toEqual([])
  })

  it('returns empty array when userSkills is empty', () => {
    const result = validateSearchInput(makeParams({ userSkills: '' }))
    expect(result.userSkills).toEqual([])
  })

  it('rejects userSkills with more than 30 items', () => {
    const manySkills = Array.from({ length: 31 }, (_, i) => `skill${i}`).join(',')
    expect(() => validateSearchInput(makeParams({ userSkills: manySkills }))).toThrow('Maximum 30 user skills allowed')
  })

  it('trims whitespace from userSkills', () => {
    const result = validateSearchInput(makeParams({ userSkills: '  react , typescript  ' }))
    expect(result.userSkills).toEqual(['react', 'typescript'])
  })
})

describe('validateSearchInput - userSeniority', () => {
  it('parses valid seniority level', () => {
    const result = validateSearchInput(makeParams({ userSeniority: 'senior' }))
    expect(result.userSeniority).toBe('senior')
  })

  it('lowercases userSeniority', () => {
    const result = validateSearchInput(makeParams({ userSeniority: 'Senior' }))
    expect(result.userSeniority).toBe('senior')
  })

  it('returns undefined when userSeniority is absent', () => {
    const result = validateSearchInput(makeParams({}))
    expect(result.userSeniority).toBeUndefined()
  })

  it('returns undefined when userSeniority is empty string', () => {
    const result = validateSearchInput(makeParams({ userSeniority: '' }))
    expect(result.userSeniority).toBeUndefined()
  })

  it('rejects invalid seniority level', () => {
    expect(() => validateSearchInput(makeParams({ userSeniority: 'super-senior' }))).toThrow('Invalid seniority level: super-senior')
  })

  it('accepts all valid seniority levels', () => {
    const validLevels = ['intern', 'junior', 'mid', 'senior', 'lead', 'principal', 'executive']
    for (const level of validLevels) {
      const result = validateSearchInput(makeParams({ userSeniority: level }))
      expect(result.userSeniority).toBe(level)
    }
  })
})

describe('validateSearchInput - backward compatibility', () => {
  it('still parses skills correctly alongside userSkills', () => {
    const result = validateSearchInput(makeParams({
      skills: 'java,python',
      userSkills: 'react,typescript',
    }))
    expect(result.skills).toEqual(['java', 'python'])
    expect(result.userSkills).toEqual(['react', 'typescript'])
  })

  it('existing fields still work with userSkills absent', () => {
    const result = validateSearchInput(makeParams({
      q: 'developer',
      skills: 'react',
      seniority: 'senior',
    }))
    expect(result.q).toBe('developer')
    expect(result.skills).toEqual(['react'])
    expect(result.seniority).toEqual(['senior'])
    expect(result.userSkills).toEqual([])
    expect(result.userSeniority).toBeUndefined()
  })
})
