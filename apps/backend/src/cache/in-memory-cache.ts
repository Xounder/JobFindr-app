/**
 * Simple in-memory cache with TTL support.
 * TASK-084: Create In-Memory Cache
 */

type CacheEntry<T> = {
  value: T
  expiresAt: number
  createdAt: number
  hitCount: number
}

export class InMemoryCache<T = unknown> {
  private store: Map<string, CacheEntry<T>> = new Map()
  private readonly defaultTtlMs: number
  private cleanupInterval: ReturnType<typeof setInterval> | null = null

  constructor(defaultTtlMs: number = 300_000) {
    this.defaultTtlMs = defaultTtlMs
    // Run cleanup every 60 seconds
    this.cleanupInterval = setInterval(() => this.evictExpired(), 60_000)
    if (typeof this.cleanupInterval.unref === 'function') {
      this.cleanupInterval.unref()
    }
  }

  get(key: string): T | undefined {
    const entry = this.store.get(key)
    if (!entry) return undefined

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return undefined
    }

    entry.hitCount++
    return entry.value
  }

  set(key: string, value: T, ttlMs?: number): void {
    const ttl = ttlMs ?? this.defaultTtlMs
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttl,
      createdAt: Date.now(),
      hitCount: 0,
    })
  }

  has(key: string): boolean {
    const entry = this.store.get(key)
    if (!entry) return false
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return false
    }
    return true
  }

  delete(key: string): boolean {
    return this.store.delete(key)
  }

  clear(): void {
    this.store.clear()
  }

  get size(): number {
    return this.store.size
  }

  getStats(): {
    size: number
    totalHits: number
    keys: string[]
  } {
    let totalHits = 0
    const keys: string[] = []
    for (const [key, entry] of this.store) {
      totalHits += entry.hitCount
      keys.push(key)
    }
    return { size: this.store.size, totalHits, keys }
  }

  private evictExpired(): void {
    const now = Date.now()
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) {
        this.store.delete(key)
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.store.clear()
  }
}
