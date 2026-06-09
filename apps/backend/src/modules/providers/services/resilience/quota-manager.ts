export type QuotaConfig = {
  maxPerMinute: number
  maxConcurrent: number
  refillRate: number
}

export type QuotaState = {
  available: number
  maxPerMinute: number
  concurrent: number
}

const defaultQuotaConfigs: Record<string, QuotaConfig> = {
  default: { maxPerMinute: 30, maxConcurrent: 5, refillRate: 0.5 },
  greenhouse: { maxPerMinute: 30, maxConcurrent: 5, refillRate: 0.5 },
  gupy: { maxPerMinute: 30, maxConcurrent: 3, refillRate: 0.5 },
  workday: { maxPerMinute: 20, maxConcurrent: 3, refillRate: 0.33 },
  ashby: { maxPerMinute: 30, maxConcurrent: 5, refillRate: 0.5 },
  lever: { maxPerMinute: 30, maxConcurrent: 5, refillRate: 0.5 },
}

export class QuotaManager {
  private buckets: Map<string, {
    tokens: number
    lastRefillAt: number
    config: QuotaConfig
    concurrent: number
  }>

  constructor(configs: Record<string, Partial<QuotaConfig>> = {}) {
    this.buckets = new Map()
    const allProviders = new Set([...Object.keys(defaultQuotaConfigs), ...Object.keys(configs)])
    for (const provider of allProviders) {
      const base = defaultQuotaConfigs[provider] ?? defaultQuotaConfigs.default
      const overrides = configs[provider] ?? {}
      const merged: QuotaConfig = { ...base, ...overrides }
      this.buckets.set(provider, {
        tokens: merged.maxPerMinute,
        lastRefillAt: Date.now(),
        config: merged,
        concurrent: 0,
      })
    }
  }

  private getOrCreateBucket(provider: string): {
    tokens: number
    lastRefillAt: number
    config: QuotaConfig
    concurrent: number
  } {
    let bucket = this.buckets.get(provider)
    if (!bucket) {
      const base = defaultQuotaConfigs[provider] ?? defaultQuotaConfigs.default
      bucket = {
        tokens: base.maxPerMinute,
        lastRefillAt: Date.now(),
        config: base,
        concurrent: 0,
      }
      this.buckets.set(provider, bucket)
    }
    return bucket
  }

  private refill(bucket: {
    tokens: number
    lastRefillAt: number
    config: QuotaConfig
    concurrent: number
  }): void {
    const now = Date.now()
    const elapsed = (now - bucket.lastRefillAt) / 1000
    if (elapsed <= 0) return
    const tokensToAdd = elapsed * bucket.config.refillRate
    bucket.tokens = Math.min(bucket.config.maxPerMinute, bucket.tokens + tokensToAdd)
    bucket.lastRefillAt = now
  }

  async tryAcquire(provider: string): Promise<boolean> {
    const bucket = this.getOrCreateBucket(provider)
    this.refill(bucket)

    if (bucket.concurrent >= bucket.config.maxConcurrent) {
      return false
    }

    if (bucket.tokens < 1) {
      return false
    }

    bucket.tokens--
    bucket.concurrent++
    return true
  }

  release(provider: string): void {
    const bucket = this.buckets.get(provider)
    if (bucket) {
      bucket.concurrent = Math.max(0, bucket.concurrent - 1)
    }
  }

  getQuotaState(provider: string): QuotaState {
    const bucket = this.getOrCreateBucket(provider)
    this.refill(bucket)
    return {
      available: Math.floor(bucket.tokens),
      maxPerMinute: bucket.config.maxPerMinute,
      concurrent: bucket.concurrent,
    }
  }

  resetQuota(provider: string): void {
    const bucket = this.buckets.get(provider)
    if (bucket) {
      bucket.tokens = bucket.config.maxPerMinute
      bucket.lastRefillAt = Date.now()
      bucket.concurrent = 0
    }
  }

  clear(): void {
    this.buckets.clear()
  }
}
