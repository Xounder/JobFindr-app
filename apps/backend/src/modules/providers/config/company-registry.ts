import {
  GREENHOUSE_COMPANIES,
  ASHBY_COMPANIES,
  LEVER_COMPANIES,
  WORKDAY_COMPANIES,
} from './companies.ts'
import { env } from '../../../config/env.ts'
import { logger } from '../../../shared/logger/logger.ts'

export type ProviderName = 'greenhouse' | 'ashby' | 'lever' | 'workday' | 'gupy'
export type CompanySource = 'discovery' | 'admin' | 'static'

export type GreenhouseConfig = { boardToken: string }
export type AshbyConfig = { board: string }
export type LeverConfig = { slug: string }
export type WorkdayConfig = { subdomain: string; tenant: string; careerSite: string }
export type GupyConfig = { careerPageId: number; careerPageName: string }

export type ProviderSpecificConfig = GreenhouseConfig | AshbyConfig | LeverConfig | WorkdayConfig | GupyConfig

export type CompanyConfig = {
  id: string
  provider: ProviderName
  name: string
  enabled: boolean
  priority: number
  createdAt: string
  updatedAt: string
  config: ProviderSpecificConfig
  metadata?: {
    source: CompanySource
    lastSyncedAt?: string
    staleAt?: string
    discoveredCount?: number
  }
}

export type CompanyRegistryOptions = {
  ttlMs?: number
  fallbackOnEmpty?: boolean
}

const PROVIDER_NAMES: ProviderName[] = ['greenhouse', 'ashby', 'lever', 'workday', 'gupy']

function generateId(provider: ProviderName, identifier: string): string {
  return `${provider}:${identifier}`
}

function isDynamicProvider(provider: ProviderName): boolean {
  switch (provider) {
    case 'greenhouse':
      return env.GREENHOUSE_DYNAMIC_COMPANIES
    case 'gupy':
      return env.GUPY_DYNAMIC_COMPANIES
    case 'ashby':
      return env.ASHBY_DYNAMIC_COMPANIES
    case 'lever':
      return env.LEVER_DYNAMIC_COMPANIES
    case 'workday':
      return env.WORKDAY_DYNAMIC_COMPANIES
  }
}

export class CompanyRegistry {
  private cache = new Map<ProviderName, { data: CompanyConfig[]; expiresAt: number }>()
  private fallbackData = new Map<ProviderName, CompanyConfig[]>()
  private stats = { hits: 0, misses: 0 }
  private ttlMs: number

  constructor(options?: CompanyRegistryOptions) {
    this.ttlMs = options?.ttlMs ?? env.COMPANY_REGISTRY_TTL_SECONDS * 1000
  }

  async initialize(): Promise<void> {
    const now = new Date().toISOString()
    this.addStaticFallback('greenhouse', GREENHOUSE_COMPANIES.map(c => ({
      id: generateId('greenhouse', c.boardToken),
      provider: 'greenhouse',
      name: c.name,
      enabled: true,
      priority: 10,
      createdAt: now,
      updatedAt: now,
      config: { boardToken: c.boardToken },
      metadata: { source: 'static' },
    })))

    this.addStaticFallback('ashby', ASHBY_COMPANIES.map(c => ({
      id: generateId('ashby', c.board),
      provider: 'ashby',
      name: c.name,
      enabled: true,
      priority: 10,
      createdAt: now,
      updatedAt: now,
      config: { board: c.board },
      metadata: { source: 'static' },
    })))

    this.addStaticFallback('lever', LEVER_COMPANIES.map(c => ({
      id: generateId('lever', c.slug),
      provider: 'lever',
      name: c.name,
      enabled: true,
      priority: 10,
      createdAt: now,
      updatedAt: now,
      config: { slug: c.slug },
      metadata: { source: 'static' },
    })))

    this.addStaticFallback('workday', WORKDAY_COMPANIES.map(c => ({
      id: generateId('workday', c.subdomain),
      provider: 'workday',
      name: c.name,
      enabled: true,
      priority: 10,
      createdAt: now,
      updatedAt: now,
      config: { subdomain: c.subdomain, tenant: c.tenant, careerSite: c.careerSite },
      metadata: { source: 'static' },
    })))

    this.addStaticFallback('gupy', [])

    logger.info('CompanyRegistry initialized with static fallback data', {
      module: 'company-registry',
      data: { providers: Array.from(this.fallbackData.keys()), ttlMs: this.ttlMs },
    })
  }

  private addStaticFallback(provider: ProviderName, configs: CompanyConfig[]): void {
    this.fallbackData.set(provider, configs)
  }

  async getAll(provider: ProviderName): Promise<CompanyConfig[]> {
    const cached = this.cache.get(provider)
    if (cached && cached.expiresAt > Date.now()) {
      this.stats.hits++
      return cached.data
    }

    this.stats.misses++

    const fallback = this.fallbackData.get(provider) ?? []
    if (isDynamicProvider(provider)) {
      const stale = cached?.data
      if (stale && stale.length > 0) {
        this.cache.set(provider, { data: stale, expiresAt: Date.now() + this.ttlMs })
        return stale
      }
      if (fallback.length > 0) {
        this.cache.set(provider, { data: fallback, expiresAt: Date.now() + this.ttlMs })
        return fallback
      }
      return []
    }

    this.cache.set(provider, { data: fallback, expiresAt: Date.now() + this.ttlMs })
    return fallback
  }

  async getEnabled(provider: ProviderName): Promise<CompanyConfig[]> {
    const all = await this.getAll(provider)
    return all.filter(c => c.enabled)
  }

  async getById(id: string): Promise<CompanyConfig | undefined> {
    for (const provider of PROVIDER_NAMES) {
      const all = await this.getAll(provider)
      const found = all.find(c => c.id === id)
      if (found) return found
    }
    return undefined
  }

  async count(provider: ProviderName): Promise<number> {
    const enabled = await this.getEnabled(provider)
    return enabled.length
  }

  async upsert(input: Omit<CompanyConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<CompanyConfig> {
    const now = new Date().toISOString()
    const existing = Array.from(this.cache.values())
      .flatMap(e => e.data)
      .find(c => c.provider === input.provider && c.name === input.name)

    const config: CompanyConfig = existing
      ? { ...existing, ...input, updatedAt: now }
      : {
          ...input,
          id: generateId(input.provider, input.name.toLowerCase().replace(/\s+/g, '-')),
          createdAt: now,
          updatedAt: now,
        }

    const cached = this.cache.get(input.provider)
    if (cached) {
      const idx = cached.data.findIndex(c => c.id === config.id)
      if (idx >= 0) {
        cached.data[idx] = config
      } else {
        cached.data.push(config)
      }
    } else {
      this.cache.set(input.provider, { data: [config], expiresAt: Date.now() + this.ttlMs })
    }

    return config
  }

  async disable(id: string): Promise<boolean> {
    for (const [, cached] of this.cache) {
      const idx = cached.data.findIndex(c => c.id === id)
      if (idx >= 0) {
        cached.data[idx] = { ...cached.data[idx], enabled: false, updatedAt: new Date().toISOString() }
        return true
      }
    }
    return false
  }

  async delete(id: string): Promise<boolean> {
    for (const [, cached] of this.cache) {
      const idx = cached.data.findIndex(c => c.id === id)
      if (idx >= 0) {
        cached.data.splice(idx, 1)
        return true
      }
    }
    return false
  }

  async upsertMany(inputs: Omit<CompanyConfig, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<CompanyConfig[]> {
    return Promise.all(inputs.map(i => this.upsert(i)))
  }

  async replaceAll(provider: ProviderName, inputs: Omit<CompanyConfig, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<CompanyConfig[]> {
    const now = new Date().toISOString()
    const configs: CompanyConfig[] = inputs.map(i => {
      const c = i.config as ProviderSpecificConfig
      const identifier = 'boardToken' in c ? c.boardToken
        : 'board' in c ? c.board
        : 'slug' in c ? c.slug
        : 'subdomain' in c ? c.subdomain
        : String('careerPageId' in c ? c.careerPageId : i.name.toLowerCase().replace(/\s+/g, '-'))
      return {
        ...i,
        id: generateId(provider, identifier),
        createdAt: now,
        updatedAt: now,
      }
    })

    this.cache.set(provider, { data: configs, expiresAt: Date.now() + this.ttlMs })
    return configs
  }

  invalidateCache(provider?: ProviderName): void {
    if (provider) {
      this.cache.delete(provider)
    } else {
      this.cache.clear()
    }
  }

  getCacheStats(): { size: number; hitRate: number; entries: Array<{ provider: string; count: number; age: number }> } {
    const totalAccesses = this.stats.hits + this.stats.misses
    return {
      size: this.cache.size,
      hitRate: totalAccesses > 0 ? this.stats.hits / totalAccesses : 0,
      entries: Array.from(this.cache.entries()).map(([provider, cached]) => ({
        provider,
        count: cached.data.length,
        age: Date.now() - (cached.expiresAt - this.ttlMs),
      })),
    }
  }
}
