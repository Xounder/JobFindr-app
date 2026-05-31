import { describe, it, expect } from 'vitest'
import { applyManualOverrides, buildOverrideConfig } from './manual-override.ts'
import type { NormalizedJob } from '@jobfindr/types'

function makeJob(id: string, company: string): NormalizedJob {
  return {
    id, title: 'Job', company, description: 'desc',
    skills: [], url: 'https://example.com', source: 'test',
  }
}

describe('applyManualOverrides', () => {
  const jobs = [
    makeJob('1', 'Google'),
    makeJob('2', 'Microsoft'),
    makeJob('3', 'unknown-company'),
    makeJob('4', 'StartupXYZ'),
  ]

  it('excludes companies in exclude list', () => {
    const result = applyManualOverrides(jobs, {
      includeCompanies: [],
      excludeCompanies: ['Microsoft'],
      includeHidden: false,
    })
    expect(result).toHaveLength(2)
    expect(result.find((j) => j.company === 'Microsoft')).toBeUndefined()
    expect(result.find((j) => j.company === 'Google')).toBeDefined()
    expect(result.find((j) => j.company === 'unknown-company')).toBeUndefined()
  })

  it('includes hidden companies when includeHidden is true', () => {
    const result = applyManualOverrides(jobs, {
      includeCompanies: [],
      excludeCompanies: [],
      includeHidden: true,
    })
    expect(result).toHaveLength(4)
  })

  it('filters hidden companies by default', () => {
    const result = applyManualOverrides(jobs, {
      includeCompanies: [],
      excludeCompanies: [],
      includeHidden: false,
    })
    expect(result.find((j) => j.company === 'unknown-company')).toBeUndefined()
  })

  it('includes hidden company if explicitly requested', () => {
    const result = applyManualOverrides(jobs, {
      includeCompanies: ['unknown-company'],
      excludeCompanies: [],
      includeHidden: false,
    })
    expect(result.find((j) => j.company === 'unknown-company')).toBeDefined()
  })
})

describe('buildOverrideConfig', () => {
  it('builds config from inputs', () => {
    const config = buildOverrideConfig(['Google'], ['Microsoft'], true)
    expect(config.includeCompanies).toEqual(['Google'])
    expect(config.excludeCompanies).toEqual(['Microsoft'])
    expect(config.includeHidden).toBe(true)
  })

  it('defaults to empty arrays and false', () => {
    const config = buildOverrideConfig([], [], false)
    expect(config.includeCompanies).toEqual([])
    expect(config.excludeCompanies).toEqual([])
    expect(config.includeHidden).toBe(false)
  })
})
