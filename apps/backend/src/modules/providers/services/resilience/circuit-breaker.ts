import { logger } from '../../../../shared/logger/logger.ts'

export type CircuitState = 'closed' | 'open' | 'half-open'

export type CircuitBreakerConfig = {
  name: string
  failureThreshold: number
  successThreshold: number
  timeoutMs: number
  halfOpenMaxRequests: number
  rollingWindowMs: number
}

export type CircuitBreakerStats = {
  state: CircuitState
  failureCount: number
  successCount: number
  lastFailureAt: string | null
}

const defaultConfig: CircuitBreakerConfig = {
  name: 'default',
  failureThreshold: 5,
  successThreshold: 2,
  timeoutMs: 30_000,
  halfOpenMaxRequests: 1,
  rollingWindowMs: 60_000,
}

export class CircuitBreaker {
  private state: CircuitState = 'closed'
  private failureCount = 0
  private successCount = 0
  private failureTimestamps: number[] = []
  private lastFailureAt: number | null = null
  private halfOpenRequestCount = 0
  private config: CircuitBreakerConfig

  constructor(config: Partial<CircuitBreakerConfig>) {
    this.config = { ...defaultConfig, ...config }
  }

  private pruneOldFailures(): void {
    const now = Date.now()
    this.failureTimestamps = this.failureTimestamps.filter(
      (ts) => now - ts < this.config.rollingWindowMs
    )
    this.failureCount = this.failureTimestamps.length
  }

  async allowRequest(): Promise<boolean> {
    this.pruneOldFailures()

    if (this.state === 'closed') {
      return true
    }

    if (this.state === 'open') {
      if (this.lastFailureAt !== null && Date.now() - this.lastFailureAt >= this.config.timeoutMs) {
        this.state = 'half-open'
        this.halfOpenRequestCount = 1
        this.successCount = 0
        logger.info(`Circuit breaker ${this.config.name} transitioned to half-open`, {
          module: 'circuit-breaker',
          data: { state: this.state },
        })
        return true
      }
      return false
    }

    if (this.halfOpenRequestCount < this.config.halfOpenMaxRequests) {
      this.halfOpenRequestCount++
      return true
    }
    return false
  }

  onSuccess(): void {
    this.failureTimestamps = []
    this.failureCount = 0

    if (this.state === 'half-open') {
      this.successCount++
      if (this.successCount >= this.config.successThreshold) {
        this.state = 'closed'
        this.successCount = 0
        this.halfOpenRequestCount = 0
        this.lastFailureAt = null
        logger.info(`Circuit breaker ${this.config.name} closed after recovery`, {
          module: 'circuit-breaker',
          data: { state: this.state },
        })
      }
    }
  }

  onFailure(): void {
    this.pruneOldFailures()
    this.lastFailureAt = Date.now()
    this.failureTimestamps.push(this.lastFailureAt)
    this.failureCount = this.failureTimestamps.length

    if (this.state === 'half-open') {
      this.state = 'open'
      this.successCount = 0
      this.halfOpenRequestCount = 0
      logger.warn(`Circuit breaker ${this.config.name} re-opened after half-open failure`, {
        module: 'circuit-breaker',
        data: { state: this.state, failureCount: this.failureCount },
      })
    } else if (this.state === 'closed' && this.failureCount >= this.config.failureThreshold) {
      this.state = 'open'
      logger.warn(`Circuit breaker ${this.config.name} opened after ${this.failureCount} failures`, {
        module: 'circuit-breaker',
        data: { state: this.state, failureCount: this.failureCount },
      })
    }
  }

  getState(): CircuitState {
    return this.state
  }

  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureAt: this.lastFailureAt ? new Date(this.lastFailureAt).toISOString() : null,
    }
  }

  getConfig(): CircuitBreakerConfig {
    return { ...this.config }
  }
}
