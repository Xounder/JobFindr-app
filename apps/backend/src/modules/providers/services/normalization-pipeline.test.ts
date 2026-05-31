import { describe, it, expect } from 'vitest'
import { normalizeJob, normalizeAndValidate, locationToString, parseCompensation, parseDescription, createNormalizer } from './normalization-pipeline.ts'
import type { JobFieldMapping } from './normalization-pipeline.ts'

describe('normalizeJob', () => {
  it('should create a job with all fields', () => {
    const fields: JobFieldMapping = {
      title: 'Software Engineer',
      description: 'Build cool stuff',
      company: 'Acme Inc',
      url: 'https://example.com/job/1',
      postedAt: '2024-01-15T00:00:00Z',
      location: 'San Francisco, CA',
      industry: 'Technology',
      skills: ['react', 'typescript'],
    }

    const job = normalizeJob('test', 'ext-1', fields)
    expect(job.id).toBe('test:ext-1')
    expect(job.title).toBe('Software Engineer')
    expect(job.company).toBe('Acme Inc')
    expect(job.url).toBe('https://example.com/job/1')
    expect(job.source).toBe('test')
    expect(job.location).toBe('San Francisco, CA')
    expect(job.industry).toBe('Technology')
    expect(job.skills).toEqual(['react', 'typescript'])
    expect(job.postedAt).toBe('2024-01-15T00:00:00Z')
  })

  it('should use defaults for missing fields', () => {
    const job = normalizeJob('test', 'ext-1', {})
    expect(job.title).toBe('Unknown Position')
    expect(job.company).toBe('Unknown Company')
    expect(job.description).toBe('')
    expect(job.url).toBe('')
    expect(job.skills).toEqual([])
  })

  it('should clean HTML from description', () => {
    const job = normalizeJob('test', 'ext-1', {
      title: 'Engineer',
      description: '<p>Hello <b>World</b></p>',
    })
    expect(job.description).toContain('Hello World')
    expect(job.description).not.toContain('<p>')
    expect(job.description).not.toContain('<b>')
  })

  it('should generate id from source and external id', () => {
    const job = normalizeJob('greenhouse', 'stripe-123', { title: 'Engineer' })
    expect(job.id).toBe('greenhouse:stripe-123')
  })
})

describe('normalizeAndValidate', () => {
  it('should return errors for missing required fields (url has no default)', () => {
    const result = normalizeAndValidate('test', 'ext-1', {})
    // title defaults to 'Unknown Position', company to 'Unknown Company'
    // but url defaults to '' which is falsy
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors.some((e) => e.includes('url'))).toBe(true)
  })

  it('should return valid for complete jobs', () => {
    const result = normalizeAndValidate('test', 'ext-1', {
      title: 'Engineer',
      url: 'https://example.com',
      company: 'Acme',
    })
    expect(result.errors).toHaveLength(0)
  })
})

describe('locationToString', () => {
  it('should format location object', () => {
    const result = locationToString({ city: 'San Francisco', state: 'CA', country: 'US' })
    expect(result).toBe('San Francisco, CA, US')
  })

  it('should return empty string for null', () => {
    expect(locationToString(null)).toBe('')
  })

  it('should pass through string values', () => {
    expect(locationToString('Remote')).toBe('Remote')
  })
})

describe('parseCompensation', () => {
  it('should parse object compensation', () => {
    const result = parseCompensation({ min: 100000, max: 200000, currency: 'USD', interval: 'yearly' })
    expect(result).toBeDefined()
    expect(result!.min).toBe(100000)
    expect(result!.max).toBe(200000)
    expect(result!.currency).toBe('USD')
    expect(result!.period).toBe('yearly')
  })

  it('should return undefined for null', () => {
    expect(parseCompensation(null)).toBeUndefined()
  })

  it('should return undefined for missing min/max', () => {
    const result = parseCompensation({ currency: 'USD' })
    expect(result).toBeUndefined()
  })
})

describe('parseDescription', () => {
  it('should extract clean text and skills', () => {
    const result = parseDescription('<p>Looking for a <b>React</b> developer</p>')
    expect(result.cleanText).toContain('Looking for a React developer')
    expect(result.skills).toContain('react')
  })

  it('should handle null input', () => {
    const result = parseDescription(null)
    expect(result.cleanText).toBe('')
    expect(result.skills).toEqual([])
  })
})

describe('createNormalizer', () => {
  it('should create a normalizer function', () => {
    const normalizer = createNormalizer<{ name: string; id: string }>(
      (raw) => ({ title: raw.name }),
      'test'
    )

    const job = normalizer({ name: 'Engineer', id: 'abc' })
    expect(job.title).toBe('Engineer')
    expect(job.id).toBe('test:abc')
  })
})
