/**
 * Abstract base provider with shared logic.
 * TASK-116: Create ProviderType Classification System
 *
 * Provides logging, metrics tracking, and error handling for all providers.
 */
import type { NormalizedJob, ValidatedSearchInput, ProviderType, JobProvider } from '@jobfindr/types'
import { logger } from '../../../shared/logger/logger.ts'
import { recordProviderSuccess, recordProviderFailure } from '../../../shared/metrics/provider-metrics.ts'
import { errorMonitor } from '../../../shared/metrics/error-monitoring.ts'
import type { CircuitBreaker } from '../services/resilience/circuit-breaker.ts'

export type BaseProviderOptions = {
  name: string
  providerType?: ProviderType
  version?: string
  circuitBreaker?: CircuitBreaker
}

/**
 * Abstract base class for all job providers.
 * Implements shared logic: logging, metrics, error handling.
 */
export abstract class BaseProvider implements JobProvider {
  readonly name: string
  readonly providerType: ProviderType
  readonly version: string
  protected circuitBreaker?: CircuitBreaker

  constructor(options: BaseProviderOptions) {
    this.name = options.name
    this.providerType = options.providerType ?? 'api'
    this.version = options.version ?? '1.0.0'
    this.circuitBreaker = options.circuitBreaker
  }

  /**
   * Each subclass must implement its own search logic.
   */
  abstract search(input: ValidatedSearchInput): Promise<NormalizedJob[]>

  /**
   * Execute a search with full instrumentation.
   * Records metrics, handles errors, logs all activity.
   */
  protected async executeWithInstrumentation(
    operation: () => Promise<NormalizedJob[]>,
    input: ValidatedSearchInput
  ): Promise<NormalizedJob[]> {
    const startTime = Date.now()

    if (this.circuitBreaker) {
      const allowed = await this.circuitBreaker.allowRequest()
      if (!allowed) {
        logger.warn(`Provider ${this.name} skipped by circuit breaker`, {
          module: 'base-provider',
          data: { query: input.q },
        })
        return []
      }
    }

    try {
      const jobs = await operation()

      this.circuitBreaker?.onSuccess()

      const latencyMs = Date.now() - startTime
      recordProviderSuccess(this.name, latencyMs, jobs.length)

      logger.info(`Provider ${this.name} completed search`, {
        module: 'base-provider',
        data: { jobCount: jobs.length, latencyMs, query: input.q },
      })

      return jobs
    } catch (error) {
      this.circuitBreaker?.onFailure()

      const latencyMs = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      recordProviderFailure(this.name, 'PROVIDER_ERROR', latencyMs)
      errorMonitor.recordError(this.name, 'SEARCH_FAILURE', errorMessage)

      logger.warn(`Provider ${this.name} search failed`, {
        module: 'base-provider',
        error: errorMessage,
        data: { latencyMs, query: input.q },
      })

      // Never throw - return empty array on failure (provider isolation)
      return []
    }
  }

  /**
   * Log a structured debug message.
   */
  protected logDebug(message: string, data?: Record<string, unknown>): void {
    logger.debug(`[${this.name}] ${message}`, {
      module: `provider:${this.name}`,
      data,
    })
  }

  /**
   * Log a structured info message.
   */
  protected logInfo(message: string, data?: Record<string, unknown>): void {
    logger.info(`[${this.name}] ${message}`, {
      module: `provider:${this.name}`,
      data,
    })
  }

  /**
   * Log a structured warning message.
   */
  protected logWarn(message: string, error?: string, data?: Record<string, unknown>): void {
    logger.warn(`[${this.name}] ${message}`, {
      module: `provider:${this.name}`,
      error,
      data,
    })
  }

  /**
   * Log a structured error message.
   */
  protected logError(message: string, error?: string, data?: Record<string, unknown>): void {
    logger.error(`[${this.name}] ${message}`, {
      module: `provider:${this.name}`,
      error,
      data,
    })
  }
}
