/**
 * Skill extraction from job descriptions.
 * TASK-035: Create Skill Extraction Engine
 *
 * Extracts technical skills and technologies mentioned in job descriptions
 * using keyword matching and pattern recognition.
 */
import { skillNormalizer } from './skill-normalizer.ts'

/**
 * Known technical skills for extraction (extensive list).
 * In production, this would be loaded from a data file.
 */
const KNOWN_SKILLS = new Set([
  'javascript', 'typescript', 'python', 'java', 'c#', 'c++', 'c', 'go', 'golang',
  'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'perl', 'lua', 'dart',
  'react', 'angular', 'vue', 'svelte', 'next.js', 'nuxt', 'gatsby', 'remix',
  'node.js', 'deno', 'express', 'fastify', 'nestjs', 'spring', 'django', 'flask',
  'fastapi', 'rails', 'laravel', 'asp.net', 'gin',
  'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'sqlite',
  'dynamodb', 'cassandra', 'mariadb', 'oracle', 'sql server', 'firebase',
  'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'terraform',
  'jenkins', 'github actions', 'gitlab ci', 'circleci', 'argocd',
  'graphql', 'rest', 'grpc', 'websocket', 'tcp/ip', 'http',
  'html', 'css', 'sass', 'less', 'tailwind', 'bootstrap', 'material ui',
  'git', 'github', 'gitlab', 'bitbucket',
  'linux', 'unix', 'bash', 'powershell', 'shell',
  'ci/cd', 'microservices', 'serverless', 'event-driven', 'domain-driven',
  'tdd', 'unit testing', 'integration testing', 'e2e testing', 'jest',
  'mocha', 'cypress', 'playwright', 'pytest', 'junit',
  'agile', 'scrum', 'kanban', 'jira', 'confluence',
  'machine learning', 'deep learning', 'ai', 'nlp', 'computer vision',
  'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy',
  'data science', 'data engineering', 'data analysis', 'big data',
  'spark', 'hadoop', 'kafka', 'airflow', 'snowflake', 'databricks',
  'blockchain', 'solidity', 'web3', 'smart contracts',
  'react native', 'flutter', 'android', 'ios', 'mobile',
  'figma', 'sketch', 'adobe xd', 'photoshop', 'ui/ux',
  'product management', 'product owner', 'business analysis',
  'devops', 'sre', 'site reliability', 'observability', 'monitoring',
  'prometheus', 'grafana', 'datadog', 'new relic', 'sentry',
  'oauth', 'jwt', 'saml', 'openid', 'authentication', 'authorization',
  'webpack', 'vite', 'rollup', 'esbuild', 'babel',
  'redux', 'zustand', 'mobx', 'vuex', 'pinia', 'rxjs',
  'prisma', 'typeorm', 'sequelize', 'mongoose', 'knex',
  'nginx', 'apache', 'caddy', 'traefik', 'haproxy',
  'rabbitmq', 'sqs', 'pub/sub', 'nats', 'zeromq',
])

const SKILL_PATTERNS = [
  /\b(?:experienced?\s+(?:in|with)\s+)?([A-Za-z#.+]+(?:\s*\+\+)?(?:\s*\.?\w*))\b/gi,
]

/**
 * Extract skills from a job description text.
 */
export function extractSkills(description: string): string[] {
  if (!description) return []

  const lowerDesc = description.toLowerCase()
  const found = new Set<string>()

  // Direct keyword matching
  for (const skill of KNOWN_SKILLS) {
    // Use word boundary matching for multi-word skills
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`\\b${escaped}\\b`, 'i')
    if (regex.test(lowerDesc)) {
      found.add(skill)
    }
  }

  // Pattern matching for compound skills
  for (const pattern of SKILL_PATTERNS) {
    const matches = lowerDesc.matchAll(pattern)
    for (const match of matches) {
      const candidate = match[1]?.trim().toLowerCase()
      if (candidate && KNOWN_SKILLS.has(candidate)) {
        found.add(candidate)
      }
    }
  }

  // Normalize all found skills
  const normalized: string[] = []
  for (const skill of found) {
    const normalizedSkill = skillNormalizer.normalize(skill)
    if (normalizedSkill && !normalized.includes(normalizedSkill)) {
      normalized.push(normalizedSkill)
    }
  }

  return normalized.sort()
}

/**
 * Extract skills from both title and description for maximum coverage.
 */
export function extractSkillsFromJob(
  title: string,
  description: string
): string[] {
  const titleSkills = extractSkills(title)
  const descSkills = extractSkills(description)
  const combined = new Set([...titleSkills, ...descSkills])
  return [...combined].sort()
}
