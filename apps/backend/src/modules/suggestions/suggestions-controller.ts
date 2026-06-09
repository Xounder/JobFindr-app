import type { FastifyInstance } from 'fastify'
import { aggregatedCache } from '../../cache/aggregated-cache.ts'
import type { CompanyRegistry, ProviderName } from '../providers/config/company-registry.ts'

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

const SUGGESTED_TITLES = [
  'Software Engineer', 'Senior Software Engineer', 'Lead Software Engineer',
  'Frontend Engineer', 'Backend Engineer', 'Full Stack Engineer',
  'DevOps Engineer', 'Platform Engineer', 'Site Reliability Engineer',
  'Data Engineer', 'Data Scientist', 'Machine Learning Engineer',
  'Mobile Engineer', 'iOS Engineer', 'Android Engineer',
  'QA Engineer', 'Test Engineer', 'Automation Engineer',
  'Security Engineer', 'Cloud Engineer', 'Infrastructure Engineer',
  'Engineering Manager', 'Technical Lead', 'Principal Engineer',
  'Product Manager', 'Technical Product Manager',
  'Designer', 'UX Designer', 'UI Designer', 'Product Designer',
  'Architect', 'Solutions Architect', 'Systems Architect',
]

const PROVIDER_NAMES: ProviderName[] = ['greenhouse', 'ashby', 'lever', 'workday', 'gupy']

const FALLBACK_COMPANIES = [
  'Stripe', 'Airbnb', 'Coinbase', 'Dropbox',
  'Netflix', 'Notion', 'Linear',
]

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

async function getRegistryCompanyNames(registry?: CompanyRegistry): Promise<string[]> {
  if (!registry) return []
  const names = new Set<string>()
  for (const provider of PROVIDER_NAMES) {
    const configs = await registry.getAll(provider)
    for (const c of configs) {
      if (c.enabled && c.name) {
        names.add(c.name)
      }
    }
  }
  return [...names].sort((a, b) => a.localeCompare(b))
}

function suggestionsHandler(registry?: CompanyRegistry) {
  return async () => {
    const cacheCompanies = getUniqueCompaniesFromCache()
    const registryCompanies = await getRegistryCompanyNames(registry)

    const all = new Set<string>()
    for (const c of cacheCompanies) all.add(c)
    for (const c of registryCompanies) all.add(c)

    return {
      skills: SUGGESTED_SKILLS,
      companies: [...all].sort((a, b) => a.localeCompare(b)),
      titles: SUGGESTED_TITLES,
    }
  }
}

export function registerSuggestionsRoute(app: FastifyInstance, registry?: CompanyRegistry): void {
  app.get('/jobs/suggestions', suggestionsHandler(registry))
}
