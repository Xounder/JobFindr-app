import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { CircuitBreaker } from './circuit-breaker.ts'
import type { CircuitBreakerConfig } from './circuit-breaker.ts'

const defaultConfig: Partial<CircuitBreakerConfig> = {
  name: 'test-breaker',
  failureThreshold: 3,
  successThreshold: 2,
  timeoutMs: 1000,
  halfOpenMaxRequests: 1,
  rollingWindowMs: 60_000,
}

describe('CircuitBreaker', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initial state', () => {
    it('should start in closed state', () => {
      const cb = new CircuitBreaker(defaultConfig)
      expect(cb.getState()).toBe('closed')
    })

    it('should allow requests in closed state', async () => {
      const cb = new CircuitBreaker(defaultConfig)
      const allowed = await cb.allowRequest()
      expect(allowed).toBe(true)
    })
  })

  describe('closed -> open transition', () => {
    it('should transition to open after failureThreshold failures', async () => {
      const cb = new CircuitBreaker(defaultConfig)

      for (let i = 0; i < 3; i++) {
        cb.onFailure()
      }

      expect(cb.getState()).toBe('open')
    })

    it('should not transition to open below failureThreshold', async () => {
      const cb = new CircuitBreaker(defaultConfig)

      cb.onFailure()
      cb.onFailure()

      expect(cb.getState()).toBe('closed')
    })

    it('should deny requests when open', async () => {
      const cb = new CircuitBreaker(defaultConfig)

      for (let i = 0; i < 3; i++) {
        cb.onFailure()
      }

      const allowed = await cb.allowRequest()
      expect(allowed).toBe(false)
    })

    it('should reset failure count on success in closed state', async () => {
      const cb = new CircuitBreaker(defaultConfig)

      cb.onFailure()
      cb.onFailure()
      cb.onSuccess()

      expect(cb.getState()).toBe('closed')

      cb.onFailure()
      cb.onFailure()
      cb.onFailure()

      expect(cb.getState()).toBe('open')
    })
  })

  describe('open -> half-open transition', () => {
    it('should transition to half-open after timeoutMs', async () => {
      const cb = new CircuitBreaker(defaultConfig)

      for (let i = 0; i < 3; i++) {
        cb.onFailure()
      }

      expect(cb.getState()).toBe('open')

      let allowed = await cb.allowRequest()
      expect(allowed).toBe(false)

      vi.advanceTimersByTime(1000)

      allowed = await cb.allowRequest()
      expect(allowed).toBe(true)
      expect(cb.getState()).toBe('half-open')
    })

    it('should remain open before timeoutMs elapses', async () => {
      const cb = new CircuitBreaker(defaultConfig)

      for (let i = 0; i < 3; i++) {
        cb.onFailure()
      }

      vi.advanceTimersByTime(500)

      const allowed = await cb.allowRequest()
      expect(allowed).toBe(false)
      expect(cb.getState()).toBe('open')
    })
  })

  describe('half-open behavior', () => {
    it('should close after successThreshold successes', async () => {
      const cb = new CircuitBreaker(defaultConfig)

      for (let i = 0; i < 3; i++) {
        cb.onFailure()
      }

      vi.advanceTimersByTime(1000)
      await cb.allowRequest()
      expect(cb.getState()).toBe('half-open')

      cb.onSuccess()
      expect(cb.getState()).toBe('half-open')

      cb.onSuccess()
      expect(cb.getState()).toBe('closed')
    })

    it('should re-open on failure in half-open state', async () => {
      const cb = new CircuitBreaker(defaultConfig)

      for (let i = 0; i < 3; i++) {
        cb.onFailure()
      }

      vi.advanceTimersByTime(1000)
      await cb.allowRequest()
      expect(cb.getState()).toBe('half-open')

      cb.onFailure()
      expect(cb.getState()).toBe('open')
    })

    it('should limit requests in half-open state', async () => {
      const cb = new CircuitBreaker({
        ...defaultConfig,
        halfOpenMaxRequests: 1,
      })

      for (let i = 0; i < 3; i++) {
        cb.onFailure()
      }

      vi.advanceTimersByTime(1000)
      expect(await cb.allowRequest()).toBe(true)
      expect(cb.getState()).toBe('half-open')

      expect(await cb.allowRequest()).toBe(false)
    })

    it('should allow multiple requests in half-open with higher limit', async () => {
      const cb = new CircuitBreaker({
        ...defaultConfig,
        halfOpenMaxRequests: 3,
      })

      for (let i = 0; i < 3; i++) {
        cb.onFailure()
      }

      vi.advanceTimersByTime(1000)

      expect(await cb.allowRequest()).toBe(true)
      expect(await cb.allowRequest()).toBe(true)
      expect(await cb.allowRequest()).toBe(true)
      expect(await cb.allowRequest()).toBe(false)
    })
  })

  describe('rolling window', () => {
    it('should prune failures outside rolling window', async () => {
      const cb = new CircuitBreaker({
        ...defaultConfig,
        failureThreshold: 3,
        rollingWindowMs: 1000,
      })

      cb.onFailure()
      cb.onFailure()

      vi.advanceTimersByTime(1100)

      cb.onFailure()
      expect(cb.getState()).toBe('closed')

      cb.onFailure()
      expect(cb.getState()).toBe('closed')

      cb.onFailure()
      expect(cb.getState()).toBe('open')
    })
  })

  describe('getStats', () => {
    it('should return current stats', () => {
      const cb = new CircuitBreaker(defaultConfig)
      const stats = cb.getStats()

      expect(stats.state).toBe('closed')
      expect(stats.failureCount).toBe(0)
      expect(stats.successCount).toBe(0)
      expect(stats.lastFailureAt).toBeNull()
    })

    it('should include lastFailureAt after failure', () => {
      const cb = new CircuitBreaker(defaultConfig)
      cb.onFailure()

      const stats = cb.getStats()
      expect(stats.failureCount).toBe(1)
      expect(stats.lastFailureAt).not.toBeNull()
    })
  })

  describe('getConfig', () => {
    it('should return the config', () => {
      const cb = new CircuitBreaker(defaultConfig)
      const config = cb.getConfig()

      expect(config.name).toBe('test-breaker')
      expect(config.failureThreshold).toBe(3)
      expect(config.timeoutMs).toBe(1000)
    })
  })

  describe('custom config', () => {
    it('should use custom failure threshold', async () => {
      const cb = new CircuitBreaker({
        name: 'custom',
        failureThreshold: 1,
      })

      cb.onFailure()
      expect(cb.getState()).toBe('open')
    })

    it('should use custom success threshold', async () => {
      const cb = new CircuitBreaker({
        name: 'custom',
        failureThreshold: 1,
        successThreshold: 3,
      })

      cb.onFailure()
      vi.advanceTimersByTime(30000)
      await cb.allowRequest()

      cb.onSuccess()
      expect(cb.getState()).toBe('half-open')

      cb.onSuccess()
      expect(cb.getState()).toBe('half-open')

      cb.onSuccess()
      expect(cb.getState()).toBe('closed')
    })

    it('should use custom timeout', async () => {
      const cb = new CircuitBreaker({
        name: 'custom',
        failureThreshold: 1,
        timeoutMs: 5000,
      })

      cb.onFailure()

      let allowed = await cb.allowRequest()
      expect(allowed).toBe(false)

      vi.advanceTimersByTime(5000)

      allowed = await cb.allowRequest()
      expect(allowed).toBe(true)
    })
  })

  describe('graceful degradation', () => {
    it('should not throw when methods are called in any state', () => {
      const cb = new CircuitBreaker(defaultConfig)

      expect(() => {
        cb.onSuccess()
        cb.onFailure()
        cb.getStats()
      }).not.toThrow()
    })

    it('should handle repeated transitions', async () => {
      const cb = new CircuitBreaker(defaultConfig)

      for (let i = 0; i < 3; i++) {
        cb.onFailure()
      }
      expect(cb.getState()).toBe('open')

      vi.advanceTimersByTime(1000)
      await cb.allowRequest()
      expect(cb.getState()).toBe('half-open')

      cb.onFailure()
      expect(cb.getState()).toBe('open')

      vi.advanceTimersByTime(1000)
      await cb.allowRequest()
      expect(cb.getState()).toBe('half-open')

      cb.onSuccess()
      cb.onSuccess()
      expect(cb.getState()).toBe('closed')
    })
  })
})
