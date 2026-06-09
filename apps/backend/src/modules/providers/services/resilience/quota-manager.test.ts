import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { QuotaManager } from './quota-manager.ts'

describe('QuotaManager', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('token bucket', () => {
    it('should allow requests when tokens are available', async () => {
      const qm = new QuotaManager()
      const allowed = await qm.tryAcquire('greenhouse')
      expect(allowed).toBe(true)
    })

    it('should deny requests when tokens are exhausted', async () => {
      const qm = new QuotaManager({
        greenhouse: { maxPerMinute: 2, refillRate: 0 },
      })

      expect(await qm.tryAcquire('greenhouse')).toBe(true)
      expect(await qm.tryAcquire('greenhouse')).toBe(true)
      expect(await qm.tryAcquire('greenhouse')).toBe(false)
    })

    it('should refill tokens over time', async () => {
      const qm = new QuotaManager({
        test: { maxPerMinute: 2, refillRate: 1 },
      })

      expect(await qm.tryAcquire('test')).toBe(true)
      expect(await qm.tryAcquire('test')).toBe(true)
      expect(await qm.tryAcquire('test')).toBe(false)

      vi.advanceTimersByTime(2000)

      expect(await qm.tryAcquire('test')).toBe(true)
    })

    it('should not exceed maxPerMinute tokens', async () => {
      const qm = new QuotaManager({
        test: { maxPerMinute: 5, refillRate: 10 },
      })

      for (let i = 0; i < 5; i++) {
        expect(await qm.tryAcquire('test')).toBe(true)
      }

      expect(await qm.tryAcquire('test')).toBe(false)
    })
  })

  describe('concurrent limits', () => {
    it('should enforce maxConcurrent limit', async () => {
      const qm = new QuotaManager({
        test: { maxPerMinute: 100, maxConcurrent: 2 },
      })

      expect(await qm.tryAcquire('test')).toBe(true)
      expect(await qm.tryAcquire('test')).toBe(true)
      expect(await qm.tryAcquire('test')).toBe(false)
    })

    it('should allow new requests after release', async () => {
      const qm = new QuotaManager({
        test: { maxPerMinute: 100, maxConcurrent: 2 },
      })

      expect(await qm.tryAcquire('test')).toBe(true)
      expect(await qm.tryAcquire('test')).toBe(true)
      expect(await qm.tryAcquire('test')).toBe(false)

      qm.release('test')

      expect(await qm.tryAcquire('test')).toBe(true)
    })

    it('should handle concurrent count independently per provider', async () => {
      const qm = new QuotaManager({
        providerA: { maxPerMinute: 100, maxConcurrent: 1 },
        providerB: { maxPerMinute: 100, maxConcurrent: 1 },
      })

      expect(await qm.tryAcquire('providerA')).toBe(true)
      expect(await qm.tryAcquire('providerB')).toBe(true)

      expect(await qm.tryAcquire('providerA')).toBe(false)
      expect(await qm.tryAcquire('providerB')).toBe(false)
    })
  })

  describe('getQuotaState', () => {
    it('should return current quota state', () => {
      const qm = new QuotaManager({
        test: { maxPerMinute: 30, maxConcurrent: 5 },
      })

      const state = qm.getQuotaState('test')
      expect(state.available).toBeGreaterThan(0)
      expect(state.maxPerMinute).toBe(30)
      expect(state.concurrent).toBe(0)
    })

    it('should reflect consumed tokens', async () => {
      const qm = new QuotaManager({
        test: { maxPerMinute: 10, refillRate: 0 },
      })

      await qm.tryAcquire('test')
      await qm.tryAcquire('test')

      const state = qm.getQuotaState('test')
      expect(state.available).toBe(8)
    })

    it('should return zero state for unknown provider', () => {
      const qm = new QuotaManager()
      const state = qm.getQuotaState('nonexistent')
      expect(state.available).toBeGreaterThan(0)
      expect(state.maxPerMinute).toBe(30)
      expect(state.concurrent).toBe(0)
    })
  })

  describe('resetQuota', () => {
    it('should reset tokens and concurrent count', async () => {
      const qm = new QuotaManager({
        test: { maxPerMinute: 5, maxConcurrent: 2, refillRate: 0 },
      })

      await qm.tryAcquire('test')
      await qm.tryAcquire('test')
      await qm.tryAcquire('test')

      qm.resetQuota('test')

      const state = qm.getQuotaState('test')
      expect(state.available).toBe(5)
      expect(state.concurrent).toBe(0)
    })
  })

  describe('clear', () => {
    it('should clear all buckets', async () => {
      const qm = new QuotaManager({
        test: { maxPerMinute: 5 },
      })

      qm.clear()

      const state = qm.getQuotaState('test')
      expect(state.available).toBeGreaterThan(0)
    })
  })

  describe('per-provider configs', () => {
    it('should use different limits for different providers', async () => {
      const qm = new QuotaManager({
        small: { maxPerMinute: 2, refillRate: 0 },
        large: { maxPerMinute: 100, refillRate: 0 },
      })

      expect(await qm.tryAcquire('small')).toBe(true)
      expect(await qm.tryAcquire('small')).toBe(true)
      expect(await qm.tryAcquire('small')).toBe(false)

      expect(await qm.tryAcquire('large')).toBe(true)
      expect(await qm.tryAcquire('large')).toBe(true)
    })
  })
})
