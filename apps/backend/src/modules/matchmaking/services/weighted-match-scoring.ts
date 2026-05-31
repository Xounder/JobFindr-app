/**
 * Weighted match scoring system.
 * TASK-044: Create Weighted Match Scoring
 *
 * Calculates a weighted compatibility score between user skills and job requirements.
 */
import type { MatchScore } from '@jobfindr/types'
import { calculateSimilarity, type SimilarityResult } from './similarity-engine.ts'

export type MatchWeights = {
  skillWeight: number
  seniorityWeight: number
  keywordWeight: number
}

const DEFAULT_WEIGHTS: MatchWeights = {
  skillWeight: 0.6,
  seniorityWeight: 0.25,
  keywordWeight: 0.15,
}

/**
 * Calculate seniority compatibility score.
 * Returns 1.0 for exact match, 0.5 for adjacent levels, 0.2 for 2 levels apart, 0 otherwise.
 */
function calculateSeniorityScore(
  userSeniority: string | undefined,
  jobSeniority: string | undefined
): number {
  if (!userSeniority || !jobSeniority) return 0.5 // Neutral if unknown

  const levels = ['intern', 'junior', 'mid', 'senior', 'lead', 'principal', 'executive']
  const userIndex = levels.indexOf(userSeniority.toLowerCase())
  const jobIndex = levels.indexOf(jobSeniority.toLowerCase())

  if (userIndex === -1 || jobIndex === -1) return 0.5

  const diff = Math.abs(userIndex - jobIndex)

  if (diff === 0) return 1.0
  if (diff <= 1) return 0.7
  if (diff <= 2) return 0.3
  return 0.1
}

/**
 * Calculate weighted match score between user profile and a job.
 */
export function calculateWeightedMatchScore(
  userSkills: string[],
  userSeniority: string | undefined,
  jobSkills: string[],
  jobSeniority: string | undefined,
  weights: Partial<MatchWeights> = {}
): MatchScore {
  const w = { ...DEFAULT_WEIGHTS, ...weights }

  // Skill similarity
  const similarity: SimilarityResult = calculateSimilarity(userSkills, jobSkills)

  // Seniority compatibility
  const seniorityScore = calculateSeniorityScore(userSeniority, jobSeniority)

  // Keyword score from similarity
  const keywordScore = similarity.keywordScore

  // Weighted overall score (0-100 scale)
  const skillComponent = similarity.combinedScore * w.skillWeight * 100
  const seniorityComponent = seniorityScore * w.seniorityWeight * 100
  const keywordComponent = keywordScore * w.keywordWeight * 100

  const overall = Math.round(
    Math.min(100, skillComponent + seniorityComponent + keywordComponent)
  )

  // Build explanation
  const matchedSkillsDisplay = similarity.matchedSkills.length > 0
    ? similarity.matchedSkills
    : userSkills.filter((s) => jobSkills.some((js) => js.toLowerCase() === s.toLowerCase()))

  const missingSkillsDisplay = similarity.missingSkills

  const seniorityMatch =
    seniorityScore >= 1
      ? 'Exact seniority match'
      : seniorityScore >= 0.7
        ? 'Close seniority level'
        : 'Different seniority level'

  const explanation = {
    matchedSkills: matchedSkillsDisplay,
    missingSkills: missingSkillsDisplay,
    seniorityMatch,
    keywordMatches: similarity.matchedSkills,
    summary: buildSummary(overall, matchedSkillsDisplay.length, userSkills.length),
  }

  return {
    overall,
    skillScore: Math.round(similarity.combinedScore * 100),
    seniorityScore: Math.round(seniorityScore * 100),
    keywordScore: Math.round(keywordScore * 100),
    explanation,
  }
}

function buildSummary(
  score: number,
  matchedCount: number,
  totalUserSkills: number
): string {
  if (totalUserSkills === 0) {
    return 'No skills provided to compare.'
  }

  const percentage = Math.round((matchedCount / totalUserSkills) * 100)

  if (score >= 80) {
    return `Strong match! ${matchedCount}/${totalUserSkills} skills match (${percentage}% skill coverage).`
  }
  if (score >= 60) {
    return `Good match. ${matchedCount}/${totalUserSkills} skills match (${percentage}% skill coverage).`
  }
  if (score >= 40) {
    return `Fair match. ${matchedCount}/${totalUserSkills} skills match (${percentage}% skill coverage).`
  }
  return `Low match. ${matchedCount}/${totalUserSkills} skills match (${percentage}% skill coverage).`
}
