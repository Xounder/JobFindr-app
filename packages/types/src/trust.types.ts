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
 */
export const TRUST_THRESHOLDS = {
  BLOCKED: 4,
  HIDDEN: 6.5,
  VISIBLE: 6.5,
  HIGHLIGHTED: 8,
} as const

export type TrustVisibility = 'blocked' | 'hidden' | 'visible' | 'highlighted'

export function getTrustVisibility(score: number): TrustVisibility {
  if (score < TRUST_THRESHOLDS.BLOCKED) return 'blocked'
  if (score < TRUST_THRESHOLDS.VISIBLE) return 'hidden'
  if (score >= TRUST_THRESHOLDS.HIGHLIGHTED) return 'highlighted'
  return 'visible'
}
