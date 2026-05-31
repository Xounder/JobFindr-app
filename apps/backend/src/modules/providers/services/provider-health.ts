/**
 * Provider Health Monitoring.
 * TASK-115: Create Provider Health Monitoring
 *
 * Tracks success count, failure count, average latency per provider.
 * Stores in-memory with timestamps.
 * Exposes GET /providers/status route in Fastify.
 */
import type { ProviderHealthStatus, ProviderType } from '@jobfindr/types'
import { providerRegistry } from '../domain/provider-registry.ts'

type HealthRecord = {
  successCount: number
  failureCount: number
  totalLatencyMs: number
  lastSuccessAt: string | null
  lastFailureAt: string | null
  /** Rolling window of latencies for average calculation */
  recentLatencies: number[]
}

const MAX_LATENCY_SAMPLES = 100

class ProviderHealthStore {
  private records: Map<string, HealthRecord> = new Map()
  private startTime: number = Date.now()

  /**
   * Ensure a record exists for a provider.
   */
  private ensureRecord(providerName: string): HealthRecord {
    let record = this.records.get(providerName)
    if (!record) {
      record = {
        successCount: 0,
        failureCount: 0,
        totalLatencyMs: 0,
        lastSuccessAt: null,
        lastFailureAt: null,
        recentLatencies: [],
      }
      this.records.set(providerName, record)
    }
    return record
  }

  /**
   * Record a successful provider execution.
   */
  recordSuccess(providerName: string, latencyMs: number): void {
    const record = this.ensureRecord(providerName)
    record.successCount++
    record.totalLatencyMs += latencyMs
    record.lastSuccessAt = new Date().toISOString()
    record.recentLatencies.push(latencyMs)
    if (record.recentLatencies.length > MAX_LATENCY_SAMPLES) {
      record.recentLatencies.shift()
    }
  }

  /**
   * Record a failed provider execution.
   */
  recordFailure(providerName: string, latencyMs: number): void {
    const record = this.ensureRecord(providerName)
    record.failureCount++
    record.totalLatencyMs += latencyMs
    record.lastFailureAt = new Date().toISOString()
    record.recentLatencies.push(latencyMs)
    if (record.recentLatencies.length > MAX_LATENCY_SAMPLES) {
      record.recentLatencies.shift()
    }
  }

  /**
   * Get health status for all registered providers.
   */
  getAllStatuses(): ProviderHealthStatus[] {
    const statuses: ProviderHealthStatus[] = []

    for (const provider of providerRegistry.getAll()) {
      const record = this.records.get(provider.name)
      const metadata = providerRegistry.getMetadata(provider.name)

      statuses.push(this.buildStatus(provider.name, metadata?.providerType ?? 'api', record ?? null, metadata?.enabled ?? true))
    }

    // Also include providers that have health data but may be disabled
    for (const [name, record] of this.records) {
      const exists = statuses.some((s) => s.name === name)
      if (!exists) {
        const metadata = providerRegistry.getMetadata(name)
        statuses.push(this.buildStatus(name, metadata?.providerType ?? 'api', record, metadata?.enabled ?? true))
      }
    }

    return statuses.sort((a, b) => a.name.localeCompare(b.name))
  }

  /**
   * Get health status for a single provider.
   */
  getStatus(providerName: string): ProviderHealthStatus | null {
    const record = this.records.get(providerName)
    const metadata = providerRegistry.getMetadata(providerName)

    if (!record && !metadata) return null

    return this.buildStatus(
      providerName,
      metadata?.providerType ?? 'api',
      record ?? null,
      metadata?.enabled ?? true
    )
  }

  /**
   * Build a health status object from a record.
   */
  private buildStatus(
    name: string,
    providerType: ProviderType,
    record: HealthRecord | null,
    enabled: boolean
  ): ProviderHealthStatus {
    const totalCalls = (record?.successCount ?? 0) + (record?.failureCount ?? 0)
    const avgLatency = record && record.successCount > 0
      ? Math.round(record.totalLatencyMs / record.successCount)
      : 0

    // Health check: at least 80% success rate if we have data
    const isHealthy = totalCalls === 0
      ? true
      : (record?.successCount ?? 0) / totalCalls >= 0.8

    const uptimePercent = totalCalls === 0
      ? 100
      : Math.round(((record?.successCount ?? 0) / totalCalls) * 100)

    return {
      name,
      providerType,
      enabled,
      successCount: record?.successCount ?? 0,
      failureCount: record?.failureCount ?? 0,
      averageLatencyMs: avgLatency,
      lastSuccessAt: record?.lastSuccessAt ?? null,
      lastFailureAt: record?.lastFailureAt ?? null,
      isHealthy,
      uptimePercent,
    }
  }

  /**
   * Reset all health data.
   */
  reset(): void {
    this.records.clear()
    this.startTime = Date.now()
  }

  /**
   * Get uptime since store creation.
   */
  get uptimeMs(): number {
    return Date.now() - this.startTime
  }
}

/**
 * Global singleton health store.
 */
export const providerHealthStore = new ProviderHealthStore()
