/**
 * Weighted match scoring system.
 * TASK-044: Create Weighted Match Scoring
 *
 * Calculates a weighted compatibility score between user skills and job requirements.
 */
import type { MatchScore, MatchBreakdown, NormalizedJob } from '@jobfindr/types'
import { calculateSimilarity, type SimilarityResult } from './similarity-engine.ts'

export type MatchWeights = {
  skillWeight: number
  seniorityWeight: number
  keywordWeight: number
  workTypeWeight: number
}

const DEFAULT_WEIGHTS: MatchWeights = {
  skillWeight: 0.45,
  seniorityWeight: 0.30,
  keywordWeight: 0.10,
  workTypeWeight: 0.15,
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
 * Calculate work type compatibility score.
 * Returns 1.0 for exact match, 0.5 for neutral (no filters), 0.0 for mismatch.
 */
function calculateWorkTypeScore(
  remoteMode: string[],
  countries: string[],
  job: NormalizedJob
): { score: number; match: 'exact' | 'partial' | 'none' } {
  // No filters active -> neutral
  if (remoteMode.length === 0 && countries.length === 0) {
    return { score: 0.5, match: 'partial' }
  }

  const jobRemoteMode = job.remoteMode
  const jobLocation = job.location?.toLowerCase() ?? ''

  // Check remote mode match
  let remoteMatch = false
  if (remoteMode.includes('remote') && jobRemoteMode === 'remote') {
    remoteMatch = true
  }
  if (remoteMode.includes('hybrid') && jobRemoteMode === 'hybrid') {
    remoteMatch = true
  }
  if (remoteMode.includes('on-site') && jobRemoteMode === 'on-site') {
    remoteMatch = true
  }

  // Check country match (for hybrid/on-site)
  let countryMatch = false
  if (countries.length > 0 && (jobRemoteMode === 'hybrid' || jobRemoteMode === 'on-site')) {
    countryMatch = countries.some((c) => jobLocation.includes(c.toLowerCase()))
  }

  // If remote mode filter is active and matches -> exact
  if (remoteMode.length > 0 && remoteMatch) {
    return { score: 1.0, match: 'exact' }
  }

  // If country filter is active and matches -> exact
  if (countries.length > 0 && countryMatch) {
    return { score: 1.0, match: 'exact' }
  }

  // If filters are active but no match -> none
  if (remoteMode.length > 0 || countries.length > 0) {
    return { score: 0.0, match: 'none' }
  }

  // Default neutral
  return { score: 0.5, match: 'partial' }
}

/**
 * Internal compute function that returns both MatchScore and MatchBreakdown.
 */
function computeMatchScoreWithBreakdown(
  userSkills: string[],
  userSeniority: string | undefined,
  jobSkills: string[],
  jobSeniority: string | undefined,
  weights: Partial<MatchWeights> = {},
  remoteMode: string[] = [],
  countries: string[] = [],
  job?: NormalizedJob
): { score: MatchScore; breakdown: MatchBreakdown } {
  const w = { ...DEFAULT_WEIGHTS, ...weights }

  // Skill similarity
  const similarity: SimilarityResult = calculateSimilarity(userSkills, jobSkills)

  // Seniority compatibility
  const seniorityScore = calculateSeniorityScore(userSeniority, jobSeniority)

  // Keyword score from similarity
  const keywordScore = similarity.keywordScore

  // Work type score
  let workTypeScore = 0.5
  let workTypeMatch: 'exact' | 'partial' | 'none' = 'partial'
  if (job) {
    const wtResult = calculateWorkTypeScore(remoteMode, countries, job)
    workTypeScore = wtResult.score
    workTypeMatch = wtResult.match
  }

  // Weighted overall score (0-100 scale)
  const skillComponent = similarity.combinedScore * w.skillWeight * 100
  const seniorityComponent = seniorityScore * w.seniorityWeight * 100
  const keywordComponent = keywordScore * w.keywordWeight * 100
  const workTypeComponent = workTypeScore * w.workTypeWeight * 100

  let overall = Math.round(
    Math.min(100, skillComponent + seniorityComponent + keywordComponent + workTypeComponent)
  )

  // 100% clamp: when skillScore >= 95 AND seniorityScore === 1.0 AND workTypeScore === 1.0
  const skillScorePercent = Math.round(similarity.combinedScore * 100)
  if (skillScorePercent >= 95 && seniorityScore === 1.0 && workTypeScore === 1.0) {
    overall = 100
  }

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
    workTypeMatch,
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
  weights: Partial<MatchWeights> = {},
  remoteMode: string[] = [],
  countries: string[] = [],
  job?: NormalizedJob
): MatchScore {
  return computeMatchScoreWithBreakdown(userSkills, userSeniority, jobSkills, jobSeniority, weights, remoteMode, countries, job).score
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
  weights: Partial<MatchWeights> = {},
  remoteMode: string[] = [],
  countries: string[] = [],
  job?: NormalizedJob
): { score: MatchScore; breakdown: MatchBreakdown } {
  return computeMatchScoreWithBreakdown(userSkills, userSeniority, jobSkills, jobSeniority, weights, remoteMode, countries, job)
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
