/**
 * Timeout monitoring for provider requests.
 * TASK-102: Create Timeout Monitoring
 */
import { logger } from '../logger/logger.ts'
import { metrics } from './metrics.ts'

type TimeoutEvent = {
  providerName: string
  timeoutMs: number
  timestamp: string
  endpoint: string
}

class TimeoutMonitor {
  private events: TimeoutEvent[] = []
  private readonly maxEvents = 1000

  recordTimeout(
    providerName: string,
    timeoutMs: number,
    endpoint: string
  ): void {
    const event: TimeoutEvent = {
      providerName,
      timeoutMs,
      timestamp: new Date().toISOString(),
      endpoint,
    }

    this.events.push(event)
    if (this.events.length > this.maxEvents) {
      this.events.shift()
    }

    metrics.incrementCounter('provider_timeout_events', { provider: providerName })
    metrics.setGauge('provider_timeout_current_ms', timeoutMs, {
      provider: providerName,
    })

    logger.warn(`Provider timeout`, {
      module: 'timeout-monitor',
      data: { provider: providerName, timeoutMs, endpoint },
    })
  }

  getRecentTimeouts(limit: number = 10): TimeoutEvent[] {
    return this.events.slice(-limit)
  }

  getTimeoutCount(providerName?: string): number {
    if (providerName) {
      return this.events.filter((e) => e.providerName === providerName).length
    }
    return this.events.length
  }

  clear(): void {
    this.events = []
  }
}

export const timeoutMonitor = new TimeoutMonitor()
