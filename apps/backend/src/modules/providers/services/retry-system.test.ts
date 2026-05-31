import { describe, it, expect, vi } from 'vitest'
import { calculateBackoff, isTransientError, withRetry } from './retry-system.ts'
import type { RetryConfig } from './retry-system.ts'

const testConfig: RetryConfig = {
  maxRetries: 2,
  baseDelayMs: 100,
  maxDelayMs: 1000,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
}

describe('calculateBackoff', () => {
  it('should calculate exponential backoff', () => {
    expect(calculateBackoff(0, testConfig)).toBe(100)
    expect(calculateBackoff(1, testConfig)).toBe(200)
    expect(calculateBackoff(2, testConfig)).toBe(400)
  })

  it('should cap at maxDelayMs', () => {
    const result = calculateBackoff(10, testConfig)
    expect(result).toBeLessThanOrEqual(1000)
  })
})

describe('isTransientError', () => {
  it('should detect timeout errors', () => {
    expect(isTransientError(new Error('Connection timeout'))).toBe(true)
  })

  it('should detect network errors', () => {
    expect(isTransientError(new Error('ECONNREFUSED'))).toBe(true)
    expect(isTransientError(new Error('ECONNRESET'))).toBe(true)
    expect(isTransientError(new Error('ETIMEDOUT'))).toBe(true)
  })

  it('should detect rate limit errors', () => {
    expect(isTransientError(new Error('Rate limit exceeded'))).toBe(true)
    expect(isTransientError(new Error('Too many requests'))).toBe(true)
  })

  it('should return false for non-transient errors', () => {
    expect(isTransientError(new Error('Not found'))).toBe(false)
    expect(isTransientError(new Error('Unauthorized'))).toBe(false)
    expect(isTransientError(new Error('Invalid input'))).toBe(false)
  })

  it('should return false for non-Error objects', () => {
    expect(isTransientError('string error')).toBe(false)
    expect(isTransientError(null)).toBe(false)
    expect(isTransientError(undefined)).toBe(false)
  })
})

describe('withRetry', () => {
  it('should succeed on first attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success')
    const result = await withRetry('test', 'op', fn, testConfig)
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should retry on transient errors and succeed', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('Timeout'))
      .mockResolvedValueOnce('success')

    const result = await withRetry('test', 'op', fn, testConfig)
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('should throw on non-transient errors without retrying', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('Not found'))
    await expect(withRetry('test', 'op', fn, testConfig)).rejects.toThrow('Not found')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should throw after exhausting retries', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('Timeout'))
    await expect(withRetry('test', 'op', fn, testConfig)).rejects.toThrow('Timeout')
    expect(fn).toHaveBeenCalledTimes(3) // 1 initial + 2 retries
  })
})
