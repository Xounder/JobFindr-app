/**
 * Similarity engine for comparing skills.
 * TASK-043: Create Similarity Engine
 *
 * Measures job-skill coverage: what fraction of the job's required skills
 * the user possesses (exact match, synonym, or keyword).
 */
import { synonymDictionary } from './synonym-dictionary.ts'

export type SimilarityResult = {
  coverageScore: number
  synonymScore: number
  keywordScore: number
  combinedScore: number
  matchedSkills: string[]
  missingSkills: string[]
}

/**
 * Calculate the similarity between user skills and job skills.
 * All sub-scores are job-centric: they measure coverage of job skills.
 */
export function calculateSimilarity(
  userSkills: string[],
  jobSkills: string[]
): SimilarityResult {
  const userSet = new Set(userSkills.map((s) => s.toLowerCase().trim()))
  const jobSet = new Set(jobSkills.map((s) => s.toLowerCase().trim()))

  // Exact-match coverage (fraction of job skills the user has directly)
  const intersection = new Set([...userSet].filter((x) => jobSet.has(x)))
  const coverageScore = jobSet.size > 0 ? intersection.size / jobSet.size : 0

  // Synonym-aware matching (job-centric)
  let synonymMatches = 0
  for (const jobSkill of jobSet) {
    for (const userSkill of userSet) {
      if (synonymDictionary.areSynonyms(jobSkill, userSkill)) {
        synonymMatches++
        break
      }
    }
  }
  const synonymScore = jobSet.size > 0 ? synonymMatches / jobSet.size : 0

  // Keyword relevance — partial word matches (job-centric)
  let keywordMatches = 0
  for (const jobSkill of jobSet) {
    const jobWords = new Set(jobSkill.split(/[\s.-]+/))
    for (const userSkill of userSet) {
      const userWords = new Set(userSkill.split(/[\s.-]+/))
      const commonWords = [...jobWords].filter((w) => userWords.has(w) && w.length > 2)
      if (commonWords.length > 0) {
        keywordMatches++
        break
      }
    }
  }
  const keywordScore = jobSet.size > 0 ? keywordMatches / jobSet.size : 0

  // Matched and missing skills (job-centric: iterate over job skills)
  const matchedSkills: string[] = []
  const missingSkills: string[] = []

  for (const jobSkill of jobSet) {
    let isMatched = false
    for (const userSkill of userSet) {
      if (
        jobSkill === userSkill ||
        synonymDictionary.areSynonyms(jobSkill, userSkill)
      ) {
        isMatched = true
        matchedSkills.push(jobSkill)
        break
      }
    }
    if (!isMatched) {
      missingSkills.push(jobSkill)
    }
  }

  // Combined score (weighted average)
  const combinedScore =
    coverageScore * 0.5 + synonymScore * 0.3 + keywordScore * 0.2

  return {
    coverageScore,
    synonymScore,
    keywordScore,
    combinedScore: Math.round(combinedScore * 100) / 100,
    matchedSkills: [...new Set(matchedSkills)],
    missingSkills: [...new Set(missingSkills)],
  }
}
