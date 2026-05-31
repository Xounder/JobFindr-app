/**
 * Match explanation generator.
 * TASK-047: Create Match Explanation Generator
 *
 * Generates human-readable explanations for match scores.
 */
import type { MatchScore, MatchExplanation } from '@jobfindr/types'
import { getMatchThresholdLabel } from '@jobfindr/types'

/**
 * Generate a human-readable explanation for a match result.
 */
export function generateMatchExplanation(
  matchScore: MatchScore,
  userSkills: string[],
  jobTitle: string
): MatchExplanation {
  const thresholdLabel = getMatchThresholdLabel(matchScore.overall)

  let summary: string

  switch (thresholdLabel) {
    case 'excellent':
      summary = `Excellent match for ${jobTitle}! Your skills align very well with this position.`
      break
    case 'good':
      summary = `Good match for ${jobTitle}. You have several relevant skills.`
      break
    case 'fair':
      summary = `Fair match for ${jobTitle}. Some of your skills are relevant.`
      break
    case 'poor':
      summary = `Limited match for ${jobTitle}. Few skill overlaps detected.`
      break
  }

  const seniorityMatch =
    matchScore.seniorityScore >= 80
      ? 'Your seniority level matches well'
      : matchScore.seniorityScore >= 50
        ? 'Your seniority level is close'
        : 'Seniority level differs'

  const keywordMatches = userSkills.length > 0
    ? matchScore.explanation.matchedSkills
    : []

  return {
    matchedSkills: matchScore.explanation.matchedSkills,
    missingSkills: matchScore.explanation.missingSkills,
    seniorityMatch,
    keywordMatches,
    summary,
  }
}
