/**
 * Anti-spam protection middleware.
 * TASK-096: Create Anti-Spam Protection
 */
import type { FastifyInstance } from 'fastify'
import { AppError } from './error-handler.ts'
import { metrics } from '../metrics/metrics.ts'

const SUSPICIOUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript\s*:/gi,
  /on\w+\s*=\s*['"]/gi,
  /data\s*:\s*text\/html/gi,
]

const SUSPICIOUS_KEYWORDS = [
  'buy now',
  'click here',
  'free money',
  'work from home',
  'earn money fast',
  '$$$',
  '!!!',
]

interface AntiSpamConfig {
  maxQueryLength: number
  maxSkillsCount: number
  enabled: boolean
}

const defaultConfig: AntiSpamConfig = {
  maxQueryLength: 200,
  maxSkillsCount: 30,
  enabled: true,
}

/**
 * Check if a string contains suspicious patterns.
 */
function containsSuspiciousPatterns(input: string): boolean {
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(input)) return true
  }
  return false
}

/**
 * Check if a string contains suspicious keywords.
 */
function containsSuspiciousKeywords(input: string): boolean {
  const lower = input.toLowerCase()
  return SUSPICIOUS_KEYWORDS.some((kw) => lower.includes(kw))
}

export function registerAntiSpamMiddleware(
  app: FastifyInstance,
  config: Partial<AntiSpamConfig> = {}
): void {
  const cfg = { ...defaultConfig, ...config }

  if (!cfg.enabled) return

  app.addHook('preValidation', async (request, _reply) => {
    const query = request.query as Record<string, string | undefined>

    // Check query length
    if (query.q && query.q.length > cfg.maxQueryLength) {
      metrics.incrementCounter('anti_spam_blocks', { reason: 'query_too_long' })
      throw new AppError(
        'SPAM_DETECTED',
        'Query too long',
        400
      )
    }

    // Check skills count
    if (query.skills) {
      const skills = query.skills.split(',').filter(Boolean)
      if (skills.length > cfg.maxSkillsCount) {
        metrics.incrementCounter('anti_spam_blocks', { reason: 'too_many_skills' })
        throw new AppError(
          'SPAM_DETECTED',
          'Too many skills specified',
          400
        )
      }
    }

    // Check for suspicious patterns in query and skills
    const checkFields = [query.q ?? '', query.skills ?? '']
    for (const field of checkFields) {
      if (containsSuspiciousPatterns(field)) {
        metrics.incrementCounter('anti_spam_blocks', { reason: 'suspicious_pattern' })
        throw new AppError(
          'SPAM_DETECTED',
          'Suspicious content detected',
          400
        )
      }
    }

    // Check for suspicious keywords in query
    if (query.q && containsSuspiciousKeywords(query.q)) {
      metrics.incrementCounter('anti_spam_blocks', { reason: 'suspicious_keywords' })
      throw new AppError(
        'SPAM_DETECTED',
        'Suspicious content detected',
        400
      )
    }
  })
}
