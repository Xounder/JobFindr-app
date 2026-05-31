/**
 * Trust score formula - weighted trust calculations.
 * TASK-050: Create Trust Score Formula
 *
 * Implements a deterministic trust scoring formula:
 * - Provider reputation (30%)
 * - Company reputation (40%)
 * - Transparency signals (30%)
 */
import type { TrustScore, TrustSignals, CompanySizeCategory } from '@jobfindr/types'

export type ProviderReputationInput = {
  score: number
  successRate: number
  averageLatencyMs: number
  totalRequests: number
}

export type CompanyReputationInput = {
  name: string
  industry?: string
  signals: TrustSignals
}

const WEIGHTS = {
  providerReputation: 0.3,
  companyReputation: 0.4,
  transparencySignals: 0.3,
}

/**
 * Score company size category.
 */
function scoreCompanySize(size: CompanySizeCategory): number {
  const scores: Record<CompanySizeCategory, number> = {
    unknown: 4,
    startup: 5,
    small: 6,
    medium: 7,
    large: 8,
    enterprise: 9,
  }
  return scores[size] ?? 5
}

/**
 * Calculate transparency score from trust signals.
 */
function calculateTransparencyScore(signals: TrustSignals): number {
  let score = 5 // Base score

  if (signals.hasWebsite) score += 1.5
  if (signals.hasLinkedIn) score += 1
  if (signals.isPublicCompany) score += 1.5
  if (signals.transparencyScore > 0) score += signals.transparencyScore * 0.5

  score -= signals.complaintScore * 0.3

  return Math.max(0, Math.min(10, score))
}

/**
 * Calculate the overall trust score.
 */
export function calculateTrustScore(
  providerRep: ProviderReputationInput,
  companyRep: CompanyReputationInput
): TrustScore {
  // Provider reputation score (0-10)
  const providerScore = Math.min(10, providerRep.score * 2)

  // Company reputation score (0-10)
  const companySizeScore = scoreCompanySize(companyRep.signals.companySize)
  const companyScore = (companySizeScore + companyRep.signals.transparencyScore) / 2

  // Transparency signals score (0-10)
  const transparencyScore = calculateTransparencyScore(companyRep.signals)

  // Weighted overall score
  const overall = Math.round(
    (providerScore * WEIGHTS.providerReputation +
      companyScore * WEIGHTS.companyReputation +
      transparencyScore * WEIGHTS.transparencySignals) *
      10
  ) / 10

  return {
    overall: Math.max(0, Math.min(10, overall)),
    providerReputation: Math.round(providerScore * 10) / 10,
    companyReputation: Math.round(companyScore * 10) / 10,
    signals: companyRep.signals,
  }
}
