/**
 * Provider reputation scores.
 * TASK-053: Create Provider Reputation Scores
 *
 * Scores providers based on trustworthiness, data quality, and reliability.
 */
import type { ProviderReputationInput } from './trust-score-formula.ts'

interface ProviderReputationData {
  baseScore: number
  description: string
}

const PROVIDER_REPUTATIONS: Record<string, ProviderReputationData> = {
  linkedin: {
    baseScore: 8,
    description: 'Established professional network with verified company data',
  },
  gupy: {
    baseScore: 7,
    description: 'Major Brazilian job platform with company verification',
  },
  indeed: {
    baseScore: 7,
    description: 'Large global job aggregator with user reviews',
  },
  greenhouse: {
    baseScore: 8,
    description: 'Popular ATS with direct company integrations',
  },
  workday: {
    baseScore: 8,
    description: 'Enterprise HCM platform used by major companies',
  },
}

const DEFAULT_PROVIDER_SCORE = 5

const providerStats: Map<string, {
  totalSuccesses: number
  totalFailures: number
  totalLatency: number
  totalRequests: number
}> = new Map()

/**
 * Record a provider request result for reputation tracking.
 */
export function recordProviderRequest(
  providerName: string,
  success: boolean,
  latencyMs: number
): void {
  const stats = providerStats.get(providerName) ?? {
    totalSuccesses: 0,
    totalFailures: 0,
    totalLatency: 0,
    totalRequests: 0,
  }

  stats.totalRequests++
  if (success) stats.totalSuccesses++
  else stats.totalFailures++
  stats.totalLatency += latencyMs

  providerStats.set(providerName, stats)
}

/**
 * Get the reputation score for a provider.
 */
export function getProviderReputation(
  providerName: string
): ProviderReputationInput {
  const base = PROVIDER_REPUTATIONS[providerName.toLowerCase()]
  const baseScore = base?.baseScore ?? DEFAULT_PROVIDER_SCORE
  const stats = providerStats.get(providerName.toLowerCase())

  if (!stats || stats.totalRequests === 0) {
    return {
      score: baseScore,
      successRate: 1,
      averageLatencyMs: 0,
      totalRequests: 0,
    }
  }

  const successRate = stats.totalRequests > 0
    ? stats.totalSuccesses / stats.totalRequests
    : 0

  const averageLatency = stats.totalRequests > 0
    ? stats.totalLatency / stats.totalRequests
    : 0

  // Adjust base score based on real performance
  const adjustedScore = baseScore * (0.5 + successRate * 0.5)

  return {
    score: Math.round(adjustedScore * 10) / 10,
    successRate,
    averageLatencyMs: Math.round(averageLatency),
    totalRequests: stats.totalRequests,
  }
}

/**
 * Reset provider stats (for testing).
 */
export function resetProviderStats(): void {
  providerStats.clear()
}
