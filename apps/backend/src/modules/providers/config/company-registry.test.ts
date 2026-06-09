import { describe, it, expect, beforeEach } from 'vitest'
import { CompanyRegistry } from './company-registry.ts'
import type { ProviderName } from './company-registry.ts'

describe('CompanyRegistry', () => {
  let registry: CompanyRegistry

  beforeEach(async () => {
    registry = new CompanyRegistry({ ttlMs: 5000 })
    await registry.initialize()
  })

  it('should initialize with static fallback data', async () => {
    const greenhouse = await registry.getAll('greenhouse')
    expect(greenhouse.length).toBeGreaterThanOrEqual(10)
    expect(greenhouse[0].provider).toBe('greenhouse')
    expect(greenhouse[0].metadata?.source).toBe('static')
  })

  it('should return enabled companies', async () => {
    const enabled = await registry.getEnabled('ashby')
    expect(enabled.every(c => c.enabled)).toBe(true)
  })

  it('should count companies per provider', async () => {
    const count = await registry.count('ashby')
    expect(count).toBe(7)
  })

  it('should get company by id', async () => {
    const all = await registry.getAll('greenhouse')
    const first = all[0]
    const found = await registry.getById(first.id)
    expect(found).toBeDefined()
    expect(found?.id).toBe(first.id)
  })

  it('should return undefined for unknown id', async () => {
    const found = await registry.getById('nonexistent')
    expect(found).toBeUndefined()
  })

  it('should upsert a new company', async () => {
    const created = await registry.upsert({
      provider: 'greenhouse',
      name: 'TestCompany',
      enabled: true,
      priority: 5,
      config: { boardToken: 'testcompany' },
      metadata: { source: 'admin' },
    })

    expect(created.name).toBe('TestCompany')
    expect(created.id).toBe('greenhouse:testcompany')
    expect(created.createdAt).toBeDefined()
    expect(created.updatedAt).toBeDefined()
  })

  it('should upsert an existing company (update)', async () => {
    const created = await registry.upsert({
      provider: 'greenhouse',
      name: 'TestCompany',
      enabled: true,
      priority: 5,
      config: { boardToken: 'testcompany' },
    })

    const updated = await registry.upsert({
      provider: 'greenhouse',
      name: 'TestCompany',
      enabled: false,
      priority: 1,
      config: { boardToken: 'testcompany' },
    })

    expect(updated.enabled).toBe(false)
    expect(updated.priority).toBe(1)
    expect(updated.id).toBe(created.id)
  })

  it('should disable a company', async () => {
    const all = await registry.getAll('lever')
    const target = all[0]
    const result = await registry.disable(target.id)
    expect(result).toBe(true)

    const enabled = await registry.getEnabled('lever')
    expect(enabled.find(c => c.id === target.id)).toBeUndefined()
  })

  it('should delete a company', async () => {
    const all = await registry.getAll('workday')
    const target = all[0]
    const result = await registry.delete(target.id)
    expect(result).toBe(true)

    const after = await registry.getAll('workday')
    expect(after.find(c => c.id === target.id)).toBeUndefined()
  })

  it('should disable non-existent company return false', async () => {
    const result = await registry.disable('nonexistent')
    expect(result).toBe(false)
  })

  it('should delete non-existent company return false', async () => {
    const result = await registry.delete('nonexistent')
    expect(result).toBe(false)
  })

  it('should upsert many companies', async () => {
    const inputs = [
      { provider: 'gupy' as ProviderName, name: 'Co1', enabled: true, priority: 1, config: { careerPageId: 1, careerPageName: 'Co1' } },
      { provider: 'gupy' as ProviderName, name: 'Co2', enabled: true, priority: 2, config: { careerPageId: 2, careerPageName: 'Co2' } },
    ]
    const results = await registry.upsertMany(inputs)
    expect(results.length).toBe(2)
  })

  it('should replace all companies for a provider', async () => {
    const inputs = [
      { provider: 'greenhouse' as ProviderName, name: 'NewCo1', enabled: true, priority: 1, config: { boardToken: 'newco1' } },
      { provider: 'greenhouse' as ProviderName, name: 'NewCo2', enabled: true, priority: 2, config: { boardToken: 'newco2' } },
    ]
    await registry.replaceAll('greenhouse', inputs)
    const all = await registry.getAll('greenhouse')
    expect(all.length).toBe(2)
  })

  it('should invalidate cache for a specific provider', async () => {
    await registry.getAll('greenhouse')
    registry.invalidateCache('greenhouse')
    const stats = registry.getCacheStats()
    expect(stats.entries.find(e => e.provider === 'greenhouse')).toBeUndefined()
  })

  it('should invalidate all cache', async () => {
    await registry.getAll('greenhouse')
    await registry.getAll('ashby')
    registry.invalidateCache()
    const stats = registry.getCacheStats()
    expect(stats.size).toBe(0)
  })

  it('should return cache stats', async () => {
    await registry.getAll('greenhouse')
    const stats = registry.getCacheStats()
    expect(stats.size).toBeGreaterThanOrEqual(1)
    expect(typeof stats.hitRate).toBe('number')
    expect(stats.entries.length).toBeGreaterThanOrEqual(1)
  })

  it('should track cache hits and misses', async () => {
    await registry.getAll('greenhouse')
    const stats1 = registry.getCacheStats()
    expect(stats1.hitRate).toBeLessThanOrEqual(1)
  })

  it('should handle empty gupy provider', async () => {
    const gupy = await registry.getAll('gupy')
    expect(gupy).toEqual([])
  })
})
