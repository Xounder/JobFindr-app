import { describe, it, expect } from 'vitest'
import { createJobId, safeJsonParse, clamp, sleep, hashString, truncate, unique, parseCommaList } from './index.ts'

describe('createJobId', () => {
  it('combines source and externalId with colon', () => {
    expect(createJobId('linkedin', '123')).toBe('linkedin:123')
  })
})

describe('safeJsonParse', () => {
  it('parses valid JSON', () => {
    expect(safeJsonParse('{"a":1}', null)).toEqual({ a: 1 })
  })
  it('returns fallback on invalid JSON', () => {
    expect(safeJsonParse('invalid', {})).toEqual({})
  })
})

describe('clamp', () => {
  it('clamps below min', () => expect(clamp(-5, 0, 10)).toBe(0))
  it('clamps above max', () => expect(clamp(15, 0, 10)).toBe(10))
  it('returns value in range', () => expect(clamp(5, 0, 10)).toBe(5))
})

describe('sleep', () => {
  it('resolves after specified ms', async () => {
    const start = Date.now()
    await sleep(10)
    expect(Date.now() - start).toBeGreaterThanOrEqual(5)
  })
})

describe('hashString', () => {
  it('produces consistent hash', () => {
    expect(hashString('hello')).toBe(hashString('hello'))
  })
  it('produces different hashes for different strings', () => {
    expect(hashString('hello')).not.toBe(hashString('world'))
  })
})

describe('truncate', () => {
  it('returns full string if shorter than max', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })
  it('truncates with ellipsis', () => {
    expect(truncate('hello world', 8)).toBe('hello...')
  })
})

describe('unique', () => {
  it('removes duplicates', () => {
    expect(unique([1, 2, 2, 3, 1])).toEqual([1, 2, 3])
  })
})

describe('parseCommaList', () => {
  it('parses comma-separated string', () => {
    expect(parseCommaList('React, TypeScript, Node')).toEqual(['react', 'typescript', 'node'])
  })
  it('returns empty array for empty input', () => {
    expect(parseCommaList('')).toEqual([])
  })
  it('returns empty array for undefined', () => {
    expect(parseCommaList(undefined)).toEqual([])
  })
})
