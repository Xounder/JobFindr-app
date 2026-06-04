/**
 * Matchmaking-related types.
 * TASK-048: Create Match Score Thresholds
 */
export type MatchScore = {
  overall: number
  skillScore: number
  seniorityScore: number
  keywordScore: number
  explanation: MatchExplanation
}

/**
 * Structured breakdown of match score for explanation modals.
 */
export type MatchBreakdown = {
  matchedSkills: string[]
  unmatchedSkills: string[]
  seniorityMatch: 'exact' | 'close' | 'none'
  weightedScore: number
  skillScoreContribution: number
  seniorityScoreContribution: number
}

export type MatchExplanation = {
  matchedSkills: string[]
  missingSkills: string[]
  seniorityMatch: string
  keywordMatches: string[]
  summary: string
}

/**
 * Thresholds for interpreting match scores.
 */
export const MATCH_THRESHOLDS = {
  EXCELLENT: 85,
  GOOD: 70,
  FAIR: 50,
  POOR: 30,
} as const

export type MatchThresholdLabel = 'excellent' | 'good' | 'fair' | 'poor'

export function getMatchThresholdLabel(score: number): MatchThresholdLabel {
  if (score >= MATCH_THRESHOLDS.EXCELLENT) return 'excellent'
  if (score >= MATCH_THRESHOLDS.GOOD) return 'good'
  if (score >= MATCH_THRESHOLDS.FAIR) return 'fair'
  return 'poor'
}
