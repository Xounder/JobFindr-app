/**
 * Semantic Matching MVP.
 * TASK-046: Create Semantic Matching MVP
 *
 * Implements basic semantic similarity without external AI APIs.
 * Uses word overlap, synonym matching, and simple NLP techniques.
 *
 * For MVP, this is a rules-based approach. Future versions can integrate
 * embeddings-based semantic search.
 */
export type SemanticMatchResult = {
  score: number
  relevantTerms: string[]
  matchType: 'exact' | 'synonym' | 'partial' | 'none'
}

// Job title keywords and their semantic groups
const TITLE_GROUPS: Record<string, string[]> = {
  'frontend': ['frontend', 'front-end', 'ui', 'web developer', 'react', 'angular', 'vue', 'css', 'html'],
  'backend': ['backend', 'back-end', 'server', 'api', 'microservice', 'node.js', 'express', 'django', 'spring'],
  'fullstack': ['fullstack', 'full-stack', 'full stack', 'full'],
  'devops': ['devops', 'sre', 'infrastructure', 'platform', 'cloud', 'aws', 'azure', 'gcp', 'kubernetes'],
  'data': ['data', 'analytics', 'data science', 'machine learning', 'ai', 'database', 'big data'],
  'mobile': ['mobile', 'ios', 'android', 'react native', 'flutter', 'swift', 'kotlin'],
  'security': ['security', 'cybersecurity', 'infosec', 'security engineer', 'security analyst'],
  'design': ['design', 'ux', 'ui', 'product design', 'figma', 'sketch', 'user experience'],
  'product': ['product', 'product manager', 'product owner', 'product management', 'pm'],
  'qa': ['qa', 'quality', 'testing', 'test', 'automation', 'manual testing'],
}

/**
 * Calculate semantic similarity between a search query and a job.
 */
export function calculateSemanticSimilarity(
  query: string,
  jobTitle: string,
  jobDescription: string
): SemanticMatchResult {
  const queryLower = query.toLowerCase().trim()
  const titleLower = jobTitle.toLowerCase()
  const descLower = jobDescription.toLowerCase()

  const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 2)

  // Check for exact title match
  if (titleLower.includes(queryLower)) {
    return { score: 1.0, relevantTerms: [queryLower], matchType: 'exact' }
  }

  // Check for partial title match
  let titleMatchCount = 0
  for (const word of queryWords) {
    if (titleLower.includes(word)) {
      titleMatchCount++
    }
  }

  // Check description for query words
  let descMatchCount = 0
  for (const word of queryWords) {
    if (descLower.includes(word)) {
      descMatchCount++
    }
  }

  // Check synonym groups
  const relevantTerms: string[] = []
  let synonymMatchFound = false

  for (const [, terms] of Object.entries(TITLE_GROUPS)) {
    for (const word of queryWords) {
      if (terms.some((t) => t.includes(word) || word.includes(t))) {
        relevantTerms.push(word)
        synonymMatchFound = true
        break
      }
    }
  }

  // Calculate score
  const titleScore = queryWords.length > 0 ? titleMatchCount / queryWords.length : 0
  const descScore = queryWords.length > 0 ? descMatchCount / queryWords.length : 0
  const synonymScore = synonymMatchFound ? 0.6 : 0

  const score = Math.max(titleScore * 0.7 + descScore * 0.2 + synonymScore * 0.1, 0)

  const matchType: SemanticMatchResult['matchType'] =
    score >= 0.8 ? 'exact' : score >= 0.5 ? 'synonym' : score >= 0.2 ? 'partial' : 'none'

  return {
    score: Math.round(score * 100) / 100,
    relevantTerms: [...new Set(relevantTerms)],
    matchType,
  }
}
