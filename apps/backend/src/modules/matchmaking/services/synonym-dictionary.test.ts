import { describe, it, expect } from 'vitest'
import { synonymDictionary } from './synonym-dictionary.ts'

describe('SynonymDictionary', () => {
  it('detects synonyms within same group', () => {
    expect(synonymDictionary.areSynonyms('react', 'vue')).toBe(true)
    expect(synonymDictionary.areSynonyms('javascript', 'typescript')).toBe(true)
  })

  it('returns false for non-synonyms', () => {
    expect(synonymDictionary.areSynonyms('react', 'docker')).toBe(false)
  })

  it('returns synonyms for a term', () => {
    const synonyms = synonymDictionary.getSynonyms('react')
    expect(synonyms).toContain('vue')
    expect(synonyms).toContain('angular')
  })

  it('expands skills with synonyms', () => {
    const expanded = synonymDictionary.expandWithSynonyms(['react'])
    expect(expanded.length).toBeGreaterThan(1)
    expect(expanded).toContain('vue')
  })

  it('calculates synonym overlap', () => {
    const overlap = synonymDictionary.calculateSynonymOverlap(
      ['react', 'typescript'],
      ['vue', 'javascript'],
    )
    expect(overlap).toBeGreaterThan(0)
  })

  it('is case insensitive', () => {
    expect(synonymDictionary.areSynonyms('React', 'VUE')).toBe(true)
  })

  it('returns group name for known term', () => {
    const group = synonymDictionary.getGroupName('react')
    expect(['frontend', 'js_ecosystem']).toContain(group)
  })

  it('returns undefined for unknown term group', () => {
    expect(synonymDictionary.getGroupName('nonexistent12345')).toBeUndefined()
  })

  it('can add custom groups', () => {
    synonymDictionary.addGroup({ group: 'test_group', terms: ['foo', 'bar'] })
    expect(synonymDictionary.areSynonyms('foo', 'bar')).toBe(true)
  })
})
