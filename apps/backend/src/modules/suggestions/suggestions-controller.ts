import type { FastifyInstance } from 'fastify'
import { aggregatedCache } from '../../cache/aggregated-cache.ts'

const SUGGESTED_SKILLS = [
  'TypeScript', 'JavaScript', 'React', 'Node.js', 'Python',
  'AWS', 'Docker', 'Kubernetes', 'Go', 'Java',
  'SQL', 'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL',
  'CSS', 'HTML', 'Vue.js', 'Angular', 'Next.js',
  'Rust', 'C++', 'C#', '.NET', 'PHP',
  'Ruby', 'Swift', 'Kotlin', 'Flutter', 'Terraform',
  'Machine Learning', 'Data Science', 'AI', 'Deep Learning', 'NLP',
  'DevOps', 'CI/CD', 'Git', 'Linux', 'Agile',
  'Microservices', 'REST API', 'gRPC', 'RabbitMQ', 'Kafka',
  'Figma', 'UX Research', 'Product Management', 'A/B Testing', 'Analytics',
]

const FALLBACK_COMPANIES = [
  'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple',
  'Netflix', 'Stripe', 'Shopify', 'Spotify', 'Airbnb',
]

/**
 * Extract unique company names from all cached aggregated results.
 * Returns companies in alphabetical order with no duplicates.
 */
export function getUniqueCompaniesFromCache(): string[] {
  const allCachedJobs = aggregatedCache.getAllJobs()
  if (allCachedJobs.length === 0) {
    return FALLBACK_COMPANIES
  }

  const companySet = new Set<string>()
  for (const jobs of allCachedJobs) {
    for (const job of jobs) {
      companySet.add(job.company)
    }
  }

  if (companySet.size === 0) {
    return FALLBACK_COMPANIES
  }

  return [...companySet].sort((a, b) => a.localeCompare(b))
}

async function suggestionsHandler() {
  return {
    skills: SUGGESTED_SKILLS,
    companies: getUniqueCompaniesFromCache(),
  }
}

export function registerSuggestionsRoute(app: FastifyInstance): void {
  app.get('/jobs/suggestions', suggestionsHandler)
}
