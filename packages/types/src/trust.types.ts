/**
 * Trust and reputation types.
 * TASK-049: Create Trust Engine (types)
 */

export type TrustScore = {
  overall: number
  providerReputation: number
  companyReputation: number
  signals: TrustSignals
}

export type TrustSignals = {
  hasWebsite: boolean
  hasLinkedIn: boolean
  isPublicCompany: boolean
  companySize: CompanySizeCategory
  complaintScore: number
  transparencyScore: number
}

export type CompanySizeCategory =
  | 'startup'
  | 'small'
  | 'medium'
  | 'large'
  | 'enterprise'
  | 'unknown'

/**
 * Trust thresholds for visibility.
 *
 * - BLOCKED:   < 5.0 → blocked (Extreme Low Trust)
 * - HIDDEN:     5.0–5.9 → hidden (Low Trust)
 * - VISIBLE:   >= 6.0 → visible
 * - HIGHLIGHTED: >= 8.0 → highlighted (Good / High Trust)
 */
export const TRUST_THRESHOLDS = {
  BLOCKED: 5,
  HIDDEN: 6,
  VISIBLE: 6,
  HIGHLIGHTED: 8,
} as const

export type TrustVisibility = 'blocked' | 'hidden' | 'visible' | 'highlighted'

export function getTrustVisibility(score: number): TrustVisibility {
  if (score < TRUST_THRESHOLDS.BLOCKED) return 'blocked'
  if (score < TRUST_THRESHOLDS.VISIBLE) return 'hidden'
  if (score >= TRUST_THRESHOLDS.HIGHLIGHTED) return 'highlighted'
  return 'visible'
}

/**
 * 6-level trust classification for display purposes.
 *
 * | Range   | Label        |
 * |---------|--------------|
 * | < 5     | extreme-low  |
 * | 5–5.9   | low          |
 * | 6–6.9   | medium       |
 * | 7–7.9   | trust        |
 * | 8–8.9   | good         |
 * | 9–10    | high         |
 */
export type TrustClassification =
  | 'extreme-low'
  | 'low'
  | 'medium'
  | 'trust'
  | 'good'
  | 'high'

export function getTrustClassification(score: number): TrustClassification {
  if (score >= 9) return 'high'
  if (score >= 8) return 'good'
  if (score >= 7) return 'trust'
  if (score >= 6) return 'medium'
  if (score >= 5) return 'low'
  return 'extreme-low'
}
