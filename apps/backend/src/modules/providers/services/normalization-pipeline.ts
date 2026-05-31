/**
 * Provider Normalization Pipeline.
 * TASK-114: Create Provider Normalization Pipeline
 *
 * Transforms raw provider responses into validated NormalizedJob objects.
 * Handles field mapping, defaults for missing fields, and schema validation.
 */
import type { NormalizedJob, Normalizer, SalaryInfo, SeniorityLevel, RemoteMode } from '@jobfindr/types'
import { createJobId } from '@jobfindr/utils'
import { cleanHtml } from '../../normalization/services/html-cleaner.ts'
import { extractSkillsFromJob } from '../../normalization/services/skill-extraction.ts'
import { detectSeniority } from '../../normalization/services/seniority-parser.ts'
import { parseSalary } from '../../normalization/services/salary-parser.ts'
import { logger } from '../../../shared/logger/logger.ts'

/**
 * Create a NormalizedJob from raw provider data with field mapping support.
 * All optional fields gracefully default when missing.
 */
export function normalizeJob(
  providerName: string,
  externalId: string,
  fields: JobFieldMapping
): NormalizedJob {
  const title = fields.title?.trim() ?? 'Unknown Position'
  const description = fields.description ? cleanHtml(fields.description) : ''
  const company = fields.company?.trim() ?? 'Unknown Company'

  const skills = fields.skills ?? extractSkillsFromJob(title, description)
  const seniority = fields.seniority ?? detectSeniority(title, description) ?? undefined

  const job: NormalizedJob = {
    id: createJobId(providerName, externalId),
    title,
    company,
    description,
    skills,
    url: fields.url ?? '',
    source: providerName,
    postedAt: fields.postedAt ?? undefined,
    salary: fields.salary ?? undefined,
    benefits: fields.benefits ?? undefined,
    seniority,
    remoteMode: fields.remoteMode ?? undefined,
    location: fields.location ?? undefined,
    industry: fields.industry ?? undefined,
  }

  return job
}

/**
 * Fields extracted from a provider response.
 * All are optional — missing fields get sensible defaults.
 */
export type JobFieldMapping = {
  title?: string
  description?: string
  company?: string
  url?: string
  postedAt?: string
  location?: string
  industry?: string
  salary?: SalaryInfo
  skills?: string[]
  benefits?: string[]
  seniority?: SeniorityLevel
  remoteMode?: RemoteMode
}

/**
 * Parse a location object (e.g., from Ashby) into a string.
 */
export function locationToString(location: Record<string, string> | string | null | undefined): string {
  if (!location) return ''
  if (typeof location === 'string') return location
  const parts: string[] = []
  if (location.city) parts.push(location.city)
  if (location.state) parts.push(location.state)
  if (location.country) parts.push(location.country)
  if (location.remote) parts.push('Remote')
  return parts.join(', ')
}

/**
 * Parse HTML description and extract clean text + skills.
 */
export function parseDescription(html: string | null | undefined): {
  cleanText: string
  skills: string[]
  seniority?: SeniorityLevel
} {
  const cleanText = html ? cleanHtml(html) : ''
  const skills = html ? extractSkillsFromJob('', cleanText) : []
  const seniority = cleanText ? detectSeniority('', cleanText) ?? undefined : undefined
  return { cleanText, skills, seniority }
}

/**
 * Parse compensation into SalaryInfo.
 * Handles various formats: { min, max, currency, interval }, or string ranges.
 */
export function parseCompensation(
  comp: Record<string, unknown> | string | null | undefined
): SalaryInfo | undefined {
  if (!comp) return undefined

  // Object format: { min, max, currency, interval }
  if (typeof comp === 'object') {
    const min = typeof comp.min === 'number' ? comp.min : undefined
    const max = typeof comp.max === 'number' ? comp.max : undefined
    const currency = typeof comp.currency === 'string' ? comp.currency : 'USD'
    const interval = typeof comp.interval === 'string' ? comp.interval : 'yearly'

    if (min !== undefined && max !== undefined) {
      return {
        min,
        max,
        currency,
        period: mapPeriod(interval),
      }
    }
    return undefined
  }

  // String format — delegate to existing salary parser
  return parseSalary(comp) ?? undefined
}

/**
 * Map compensation interval string to SalaryPeriod.
 */
function mapPeriod(interval: string): 'yearly' | 'monthly' | 'hourly' {
  const lower = interval.toLowerCase()
  if (lower.includes('year') || lower.includes('annual') || lower === 'yearly') return 'yearly'
  if (lower.includes('month') || lower === 'monthly') return 'monthly'
  if (lower.includes('hour') || lower === 'hourly') return 'hourly'
  return 'yearly'
}

/**
 * Infer seniority level from a job title text.
 */
export function inferSeniority(title: string): SeniorityLevel | undefined {
  const lower = title.toLowerCase()
  if (lower.includes('senior') || lower.includes('sr.')) return 'senior'
  if (lower.includes('junior') || lower.includes('jr.')) return 'junior'
  if (lower.includes('lead') || lower.includes('head')) return 'lead'
  if (lower.includes('principal')) return 'principal'
  if (lower.includes('intern') || lower.includes('estag') || lower.includes('trainee')) return 'intern'
  if (lower.includes('pleno') || lower.includes('mid')) return 'mid'
  return undefined
}

/**
 * Create a Normalizer function from a mapping function.
 */
export function createNormalizer<T>(
  mapFn: (raw: T) => JobFieldMapping,
  providerName: string
): Normalizer<T> {
  return (raw: T): NormalizedJob => {
    const fields = mapFn(raw)

    // Generate a stable external ID from the raw data
    const externalId = String((raw as Record<string, unknown>)?.id ?? (raw as Record<string, unknown>)?.uuid ?? Math.random().toString(36).slice(2))

    const job = normalizeJob(providerName, externalId, fields)

    // Log normalization issues
    if (!fields.title) {
      logger.warn(`[${providerName}] Missing title in raw data`, {
        module: 'normalization-pipeline',
        data: { externalId },
      })
    }

    return job
  }
}

/**
 * Validate a NormalizedJob has all required fields.
 * Returns array of validation error messages (empty if valid).
 */
export function validateNormalizedJob(job: NormalizedJob): string[] {
  const errors: string[] = []
  if (!job.id) errors.push('Missing id')
  if (!job.title) errors.push('Missing title')
  if (!job.company) errors.push('Missing company')
  if (!job.url) errors.push('Missing url')
  if (!job.source) errors.push('Missing source')
  return errors
}

/**
 * Safe version — normalizes and validates, returns job + errors.
 */
export function normalizeAndValidate(
  providerName: string,
  externalId: string,
  fields: JobFieldMapping
): { job: NormalizedJob; errors: string[] } {
  const job = normalizeJob(providerName, externalId, fields)
  const errors = validateNormalizedJob(job)
  return { job, errors }
}
