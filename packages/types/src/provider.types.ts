/**
 * Provider-related types.
 * TASK-017/112: Create/Refactor JobProvider Interface
 */
import type { NormalizedJob } from './normalized-job.ts'
import type { ValidatedSearchInput } from './search-dto.ts'

/**
 * Provider type classification.
 * TASK-116: Create ProviderType Classification System
 */
export type ProviderType = 'api' | 'json' | 'html' | 'browser'

/**
 * Standard provider contract.
 * Every job provider MUST implement this interface.
 */
export interface JobProvider {
  /** Unique provider name (e.g., "greenhouse", "gupy") */
  readonly name: string

  /** Provider type classification */
  readonly providerType: ProviderType

  /**
   * Execute a job search against this provider.
   * Must never throw - return empty array on failure.
   */
  search(input: ValidatedSearchInput): Promise<NormalizedJob[]>
}

/**
 * Provider metadata for registry.
 */
export type ProviderMetadata = {
  name: string
  version: string
  providerType: ProviderType
  enabled: boolean
  priority: number
  timeoutMs: number
  retryCount: number
  rateLimitInfo?: RateLimitInfo
  reputation?: ProviderReputation
}

export type RateLimitInfo = {
  requestsPerMinute: number
  remaining?: number
  resetAt?: string
}

export type ProviderReputation = {
  score: number
  lastFailureAt: string | null
  failureCount: number
  successCount: number
  averageLatencyMs: number
}

/**
 * Provider execution result (for partial responses).
 */
export type ProviderResult = {
  providerName: string
  success: boolean
  jobs: NormalizedJob[]
  error: string | null
  latencyMs: number
}

/**
 * Aggregated search result from provider execution engine.
 * TASK-113: Create Provider Execution Engine
 */
export type AggregatedProviderResult = {
  jobs: NormalizedJob[]
  results: ProviderResult[]
  totalDurationMs: number
  succeededCount: number
  failedCount: number
}

/**
 * Provider health status.
 * TASK-115: Create Provider Health Monitoring
 */
export type ProviderHealthStatus = {
  name: string
  providerType: ProviderType
  enabled: boolean
  successCount: number
  failureCount: number
  averageLatencyMs: number
  lastSuccessAt: string | null
  lastFailureAt: string | null
  isHealthy: boolean
  uptimePercent: number
}

/**
 * Normalizer type for provider data transformation.
 * TASK-114: Create Provider Normalization Pipeline
 */
export type Normalizer<T> = (raw: T) => NormalizedJob
