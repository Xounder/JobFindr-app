/**
 * Similarity engine for comparing skills.
 * TASK-043: Create Similarity Engine
 *
 * Implements text similarity scoring using:
 * - Jaccard similarity for direct skill matches
 * - Synonym-aware matching
 * - Keyword relevance scoring
 */
import { synonymDictionary } from './synonym-dictionary.ts'

export type SimilarityResult = {
  jaccardScore: number
  synonymScore: number
  keywordScore: number
  combinedScore: number
  matchedSkills: string[]
  missingSkills: string[]
}

/**
 * Calculate Jaccard similarity between two sets of strings.
 */
function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 0
  const intersection = new Set([...setA].filter((x) => setB.has(x)))
  const union = new Set([...setA, ...setB])
  return intersection.size / union.size
}

/**
 * Calculate the similarity between user skills and job skills.
 */
export function calculateSimilarity(
  userSkills: string[],
  jobSkills: string[]
): SimilarityResult {
  const userSet = new Set(userSkills.map((s) => s.toLowerCase().trim()))
  const jobSet = new Set(jobSkills.map((s) => s.toLowerCase().trim()))

  // Jaccard similarity (direct matches)
  const jaccardScore = jaccardSimilarity(userSet, jobSet)

  // Synonym-aware matching
  let synonymMatches = 0
  for (const userSkill of userSet) {
    for (const jobSkill of jobSet) {
      if (synonymDictionary.areSynonyms(userSkill, jobSkill)) {
        synonymMatches++
        break
      }
    }
  }
  const synonymScore = userSet.size > 0 ? synonymMatches / userSet.size : 0

  // Keyword relevance (partial word matches)
  let keywordMatches = 0
  for (const userSkill of userSet) {
    const userWords = new Set(userSkill.split(/[\s.-]+/))
    for (const jobSkill of jobSet) {
      const jobWords = new Set(jobSkill.split(/[\s.-]+/))
      const commonWords = [...userWords].filter((w) => jobWords.has(w) && w.length > 2)
      if (commonWords.length > 0) {
        keywordMatches++
        break
      }
    }
  }
  const keywordScore = userSet.size > 0 ? keywordMatches / userSet.size : 0

  // Matched and missing skills
  const matchedSkills: string[] = []
  const missingSkills: string[] = []

  for (const userSkill of userSet) {
    let isMatched = false
    for (const jobSkill of jobSet) {
      if (
        userSkill === jobSkill ||
        synonymDictionary.areSynonyms(userSkill, jobSkill)
      ) {
        isMatched = true
        matchedSkills.push(userSkill)
        break
      }
    }
    if (!isMatched) {
      missingSkills.push(userSkill)
    }
  }

  // Combined score (weighted average)
  const combinedScore =
    jaccardScore * 0.5 + synonymScore * 0.3 + keywordScore * 0.2

  return {
    jaccardScore,
    synonymScore,
    keywordScore,
    combinedScore: Math.round(combinedScore * 100) / 100,
    matchedSkills: [...new Set(matchedSkills)],
    missingSkills: [...new Set(missingSkills)],
  }
}
