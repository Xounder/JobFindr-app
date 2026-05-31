/**
 * Error monitoring for the backend.
 * TASK-103: Create Error Monitoring
 */
import { logger } from '../logger/logger.ts'
import { metrics } from './metrics.ts'

type ErrorEvent = {
  module: string
  errorCode: string
  message: string
  timestamp: string
  context?: Record<string, unknown>
}

class ErrorMonitor {
  private errors: ErrorEvent[] = []
  private readonly maxErrors = 1000

  recordError(
    module: string,
    errorCode: string,
    message: string,
    context?: Record<string, unknown>
  ): void {
    const event: ErrorEvent = {
      module,
      errorCode,
      message,
      timestamp: new Date().toISOString(),
      context,
    }

    this.errors.push(event)
    if (this.errors.length > this.maxErrors) {
      this.errors.shift()
    }

    metrics.incrementCounter('backend_errors_total', { module, errorCode })
    metrics.setGauge('backend_errors_last_timestamp', Date.now(), {
      module,
      errorCode,
    })

    logger.error(`Error in ${module}: ${message}`, {
      module,
      error: errorCode,
      data: context,
    })
  }

  getRecentErrors(limit: number = 20): ErrorEvent[] {
    return this.errors.slice(-limit)
  }

  getErrorCount(module?: string): number {
    if (module) {
      return this.errors.filter((e) => e.module === module).length
    }
    return this.errors.length
  }

  hasCriticalErrors(): boolean {
    return this.errors.some(
      (e) => e.errorCode === 'INTERNAL_ERROR' || e.errorCode === 'STARTUP_FAILURE'
    )
  }

  clear(): void {
    this.errors = []
  }
}

export const errorMonitor = new ErrorMonitor()
