/**
 * Final composite score calculation.
 * TASK-062: Create Final Composite Score
 *
 * Combines all ranking factors into a single composite score.
 * All factors are normalized to 0-100 before weighted combination.
 */
import type { RankingBreakdown } from '@jobfindr/types'

/**
 * Compute the final composite ranking score.
 * The score is the sum of all weighted contributions (already pre-weighted).
 * Normalized to 0-100 range.
 */
export function computeFinalScore(breakdown: RankingBreakdown): number {
  const total =
    breakdown.matchScoreContribution +
    breakdown.trustScoreContribution +
    breakdown.companyPriorityContribution +
    breakdown.salaryContribution +
    breakdown.recencyContribution

  // Normalize to 0-100 (theoretical max is sum of weights * 100 = 100)
  return Math.round(Math.min(100, Math.max(0, total)) * 100) / 100
}

/**
 * Generate a human-readable breakdown explanation.
 */
export function explainScore(breakdown: RankingBreakdown): string {
  const parts: string[] = []
  if (breakdown.matchScoreContribution > 0) {
    parts.push(`Match: ${breakdown.matchScoreContribution.toFixed(1)}`)
  }
  if (breakdown.trustScoreContribution > 0) {
    parts.push(`Trust: ${breakdown.trustScoreContribution.toFixed(1)}`)
  }
  if (breakdown.companyPriorityContribution > 0) {
    parts.push(`Company: ${breakdown.companyPriorityContribution.toFixed(1)}`)
  }
  if (breakdown.salaryContribution > 0) {
    parts.push(`Salary: ${breakdown.salaryContribution.toFixed(1)}`)
  }
  if (breakdown.recencyContribution > 0) {
    parts.push(`Recency: ${breakdown.recencyContribution.toFixed(1)}`)
  }

  const total = computeFinalScore(breakdown)
  return `Score ${total.toFixed(1)}/100 (${parts.join(', ')})`
}
