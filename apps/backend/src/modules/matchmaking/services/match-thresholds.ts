/**
 * Match score threshold utilities.
 * TASK-048: Create Match Score Thresholds
 *
 * Defines and interprets match score ranges.
 */
import { getMatchThresholdLabel, MATCH_THRESHOLDS } from '@jobfindr/types'
import type { MatchThresholdLabel } from '@jobfindr/types'

export type ThresholdConfig = {
  label: MatchThresholdLabel
  minScore: number
  description: string
  color: string
}

export const THRESHOLD_CONFIGS: Record<MatchThresholdLabel, ThresholdConfig> = {
  excellent: {
    label: 'excellent',
    minScore: MATCH_THRESHOLDS.EXCELLENT,
    description: 'Strong match with excellent skill alignment',
    color: 'green',
  },
  good: {
    label: 'good',
    minScore: MATCH_THRESHOLDS.GOOD,
    description: 'Good match with several relevant skills',
    color: 'blue',
  },
  fair: {
    label: 'fair',
    minScore: MATCH_THRESHOLDS.FAIR,
    description: 'Fair match with some skill overlap',
    color: 'yellow',
  },
  poor: {
    label: 'poor',
    minScore: 0,
    description: 'Limited match with minimal skill overlap',
    color: 'red',
  },
}

/**
 * Get the threshold config for a given score.
 */
export function getThresholdForScore(score: number): ThresholdConfig {
  const label = getMatchThresholdLabel(score)
  return THRESHOLD_CONFIGS[label]
}

/**
 * Get the color associated with a match score.
 */
export function getMatchScoreColor(score: number): string {
  return getThresholdForScore(score).color
}

export { getMatchThresholdLabel, MATCH_THRESHOLDS }
