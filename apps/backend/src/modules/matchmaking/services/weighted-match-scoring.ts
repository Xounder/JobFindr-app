/**
 * Weighted match scoring system.
 * TASK-044: Create Weighted Match Scoring
 *
 * Calculates a weighted compatibility score between user skills and job requirements.
 */
import type { MatchScore, MatchBreakdown } from '@jobfindr/types'
import { calculateSimilarity, type SimilarityResult } from './similarity-engine.ts'

export type MatchWeights = {
  skillWeight: number
  seniorityWeight: number
  keywordWeight: number
}

const DEFAULT_WEIGHTS: MatchWeights = {
  skillWeight: 0.5,
  seniorityWeight: 0.35,
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
  if (!userSeniority) return 0 // Penalize when user didn't specify seniority
  if (!jobSeniority) return 0.5 // Neutral if job seniority unknown

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
 * Internal compute function that returns both MatchScore and MatchBreakdown.
 */
function computeMatchScoreWithBreakdown(
  userSkills: string[],
  userSeniority: string | undefined,
  jobSkills: string[],
  jobSeniority: string | undefined,
  weights: Partial<MatchWeights> = {}
): { score: MatchScore; breakdown: MatchBreakdown } {
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

  // Build explanation (job-centric: matched/unmatched are job skills)
  const matchedSkillsDisplay = similarity.matchedSkills.length > 0
    ? similarity.matchedSkills
    : jobSkills.filter((js) => userSkills.some((s) => s.toLowerCase() === js.toLowerCase()))

  const missingSkillsDisplay = similarity.missingSkills

  const seniorityMatchDisplay =
    seniorityScore >= 1
      ? 'Exact seniority match'
      : seniorityScore >= 0.7
        ? 'Close seniority level'
        : 'Different seniority level'

  const explanation = {
    matchedSkills: matchedSkillsDisplay,
    missingSkills: missingSkillsDisplay,
    seniorityMatch: seniorityMatchDisplay,
    keywordMatches: similarity.matchedSkills,
    summary: buildSummary(overall, matchedSkillsDisplay.length, jobSkills.length),
  }

  // Derive seniorityMatch for breakdown
  const seniorityMatch: MatchBreakdown['seniorityMatch'] =
    seniorityScore >= 1
      ? 'exact'
      : seniorityScore >= 0.7
        ? 'close'
        : 'none'

  const score: MatchScore = {
    overall,
    skillScore: Math.round(similarity.combinedScore * 100),
    seniorityScore: Math.round(seniorityScore * 100),
    keywordScore: Math.round(keywordScore * 100),
    explanation,
  }

  const breakdown: MatchBreakdown = {
    matchedSkills: matchedSkillsDisplay,
    unmatchedSkills: missingSkillsDisplay,
    seniorityMatch,
    weightedScore: overall,
    skillScoreContribution: Math.round(skillComponent * 100) / 100,
    seniorityScoreContribution: Math.round(seniorityComponent * 100) / 100,
    userSeniority,
    jobSeniority,
  }

  return { score, breakdown }
}

/**
 * Calculate weighted match score between user profile and a job.
 * Returns only the score (backward-compatible).
 */
export function calculateWeightedMatchScore(
  userSkills: string[],
  userSeniority: string | undefined,
  jobSkills: string[],
  jobSeniority: string | undefined,
  weights: Partial<MatchWeights> = {}
): MatchScore {
  return computeMatchScoreWithBreakdown(userSkills, userSeniority, jobSkills, jobSeniority, weights).score
}

/**
 * Calculate weighted match score with full breakdown data.
 * Returns both the score and a MatchBreakdown for explanation modals.
 */
export function calculateWeightedMatchScoreWithBreakdown(
  userSkills: string[],
  userSeniority: string | undefined,
  jobSkills: string[],
  jobSeniority: string | undefined,
  weights: Partial<MatchWeights> = {}
): { score: MatchScore; breakdown: MatchBreakdown } {
  return computeMatchScoreWithBreakdown(userSkills, userSeniority, jobSkills, jobSeniority, weights)
}

function buildSummary(
  score: number,
  matchedCount: number,
  totalJobSkills: number
): string {
  if (totalJobSkills === 0) {
    return 'No job skills to compare.'
  }

  const percentage = Math.round((matchedCount / totalJobSkills) * 100)

  if (score >= 80) {
    return `Strong match! ${matchedCount} of ${totalJobSkills} job skills matched (${percentage}% coverage).`
  }
  if (score >= 60) {
    return `Good match. ${matchedCount} of ${totalJobSkills} job skills matched (${percentage}% coverage).`
  }
  if (score >= 40) {
    return `Fair match. ${matchedCount} of ${totalJobSkills} job skills matched (${percentage}% coverage).`
  }
  return `Low match. ${matchedCount} of ${totalJobSkills} job skills matched (${percentage}% coverage).`
}
