/**
 * Provider-specific metrics tracking.
 * TASK-101: Create Provider Metrics
 */
import { metrics } from './metrics.ts'

export function recordProviderSuccess(
  providerName: string,
  latencyMs: number,
  jobCount: number
): void {
  metrics.incrementCounter('provider_requests_total', {
    provider: providerName,
    status: 'success',
  })
  metrics.recordHistogram('provider_latency_ms', latencyMs, {
    provider: providerName,
  })
  metrics.recordHistogram('provider_job_count', jobCount, {
    provider: providerName,
  })
}

export function recordProviderFailure(
  providerName: string,
  errorCode: string,
  latencyMs: number
): void {
  metrics.incrementCounter('provider_requests_total', {
    provider: providerName,
    status: 'failure',
  })
  metrics.incrementCounter('provider_errors_total', {
    provider: providerName,
    error: errorCode,
  })
  metrics.recordHistogram('provider_latency_ms', latencyMs, {
    provider: providerName,
  })
}

export function recordProviderTimeout(providerName: string): void {
  metrics.incrementCounter('provider_timeouts_total', {
    provider: providerName,
  })
}

export function recordProviderCacheHit(providerName: string): void {
  metrics.incrementCounter('provider_cache_hits_total', {
    provider: providerName,
  })
}

export function recordProviderCacheMiss(providerName: string): void {
  metrics.incrementCounter('provider_cache_misses_total', {
    provider: providerName,
  })
}
