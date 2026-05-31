/**
 * Metrics collection system.
 * TASK-099: Create Metrics Collection
 *
 * For MVP, uses in-memory counters and gauges.
 * No external metrics service required.
 */

export type MetricType = 'counter' | 'gauge' | 'histogram'

export type MetricEntry = {
  name: string
  type: MetricType
  value: number
  labels: Record<string, string>
  timestamp: string
}

class MetricsCollector {
  private counters: Map<string, number> = new Map()
  private gauges: Map<string, number> = new Map()
  private histograms: Map<string, number[]> = new Map()
  private events: MetricEntry[] = []

  private key(name: string, labels: Record<string, string>): string {
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join(',')
    return labelStr ? `${name}{${labelStr}}` : name
  }

  incrementCounter(
    name: string,
    labels: Record<string, string> = {},
    value: number = 1
  ): void {
    const k = this.key(name, labels)
    this.counters.set(k, (this.counters.get(k) ?? 0) + value)
    this.events.push({
      name,
      type: 'counter',
      value,
      labels,
      timestamp: new Date().toISOString(),
    })
  }

  setGauge(name: string, value: number, labels: Record<string, string> = {}): void {
    const k = this.key(name, labels)
    this.gauges.set(k, value)
    this.events.push({
      name,
      type: 'gauge',
      value,
      labels,
      timestamp: new Date().toISOString(),
    })
  }

  recordHistogram(
    name: string,
    value: number,
    labels: Record<string, string> = {}
  ): void {
    const k = this.key(name, labels)
    const values = this.histograms.get(k) ?? []
    values.push(value)
    this.histograms.set(k, values)
    this.events.push({
      name,
      type: 'histogram',
      value,
      labels,
      timestamp: new Date().toISOString(),
    })
  }

  getCounter(name: string, labels: Record<string, string> = {}): number {
    return this.counters.get(this.key(name, labels)) ?? 0
  }

  getGauge(name: string, labels: Record<string, string> = {}): number {
    return this.gauges.get(this.key(name, labels)) ?? 0
  }

  getHistogramStats(
    name: string,
    labels: Record<string, string> = {}
  ): { count: number; avg: number; min: number; max: number; p95: number } | null {
    const values = this.histograms.get(this.key(name, labels))
    if (!values || values.length === 0) return null
    const sorted = [...values].sort((a, b) => a - b)
    const sum = sorted.reduce((a, b) => a + b, 0)
    const p95Index = Math.ceil(sorted.length * 0.95) - 1
    return {
      count: sorted.length,
      avg: sum / sorted.length,
      min: sorted[0] ?? 0,
      max: sorted[sorted.length - 1] ?? 0,
      p95: sorted[p95Index] ?? 0,
    }
  }

  getAllMetrics(): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    for (const [key, value] of this.counters) {
      result[`counter:${key}`] = value
    }
    for (const [key, value] of this.gauges) {
      result[`gauge:${key}`] = value
    }
    return result
  }

  /** Clear all collected metrics (for testing or reset). */
  reset(): void {
    this.counters.clear()
    this.gauges.clear()
    this.histograms.clear()
    this.events = []
  }
}

export const metrics = new MetricsCollector()
