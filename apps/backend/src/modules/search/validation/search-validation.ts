/**
 * Search input validation.
 * TASK-011: Implement Search Validation
 *
 * Validates and normalizes search query parameters.
 */
import type { ValidatedSearchInput, SearchSortOption, SeniorityLevel, RemoteMode } from '@jobfindr/types'
import { AppError } from '../../../shared/middleware/error-handler.ts'
import { env } from '../../../config/env.ts'

const VALID_SENIORITY_LEVELS: SeniorityLevel[] = [
  'intern', 'junior', 'mid', 'senior', 'lead', 'principal', 'executive',
]

const VALID_REMOTE_MODES: RemoteMode[] = [
  'remote', 'hybrid', 'on-site',
]

const VALID_SORT_OPTIONS: SearchSortOption[] = [
  'relevance', 'date', 'salary_high', 'salary_low',
]

/**
 * Parse and validate search query parameters.
 * Throws AppError on validation failure.
 */
export function validateSearchInput(params: Record<string, string | undefined>): ValidatedSearchInput {
  const errors: string[] = []

  // q - free text query
  const q = (params.q ?? '').trim().slice(0, 200)

  // skills - comma-separated list
  const skills = parseCommaSeparated(params.skills).map((s) => s.toLowerCase())
  if (skills.length > 30) {
    errors.push('Maximum 30 skills allowed')
  }

  // page - 1-indexed
  const page = parsePositiveInt(params.page, 1)
  if (page < 1) {
    errors.push('Page must be >= 1')
  }

  // pageSize - max 20
  const pageSize = parsePositiveInt(params.pageSize, 20)
  if (pageSize < 1) {
    errors.push('Page size must be >= 1')
  }
  if (pageSize > env.MAX_PAGE_SIZE) {
    errors.push(`Page size must be <= ${env.MAX_PAGE_SIZE}`)
  }

  // seniority - filter
  const seniority = parseCommaSeparated(params.seniority) as SeniorityLevel[]
  for (const s of seniority) {
    if (!VALID_SENIORITY_LEVELS.includes(s as SeniorityLevel)) {
      errors.push(`Invalid seniority level: ${s}`)
    }
  }

  // remoteMode - filter
  const remoteMode = parseCommaSeparated(params.remoteMode) as RemoteMode[]
  for (const r of remoteMode) {
    if (!VALID_REMOTE_MODES.includes(r as RemoteMode)) {
      errors.push(`Invalid remote mode: ${r}`)
    }
  }

  // companies - whitelist
  const companies = parseCommaSeparated(params.companies).map((c) => c.toLowerCase())
  if (companies.length > 50) {
    errors.push('Maximum 50 companies allowed')
  }

  // excludedCompanies - blacklist (also accepts excludeCompanies as alias)
  const excludedCompaniesRaw = params.excludedCompanies ?? params.excludeCompanies
  const excludedCompanies = parseCommaSeparated(excludedCompaniesRaw).map((c) => c.toLowerCase())
  if (excludedCompanies.length > 50) {
    errors.push('Maximum 50 excluded companies allowed')
  }

  // countries - location-based filter
  const countries = parseCommaSeparated(params.countries).map((c) => c.toLowerCase())
  if (countries.length > 50) {
    errors.push('Maximum 50 countries allowed')
  }

  // sources - provider filter
  const sources = parseCommaSeparated(params.sources).map((s) => s.toLowerCase())

  // minTrustScore - filter (also accepts trustMin as alias)
  const minTrustScoreRaw = params.minTrustScore ?? params.trustMin
  const minTrustScore = parseFloatParam(minTrustScoreRaw, 0)
  if (minTrustScore < 0 || minTrustScore > 10) {
    errors.push('minTrustScore must be between 0 and 10')
  }

  // includeHidden - boolean
  const includeHidden = params.includeHidden?.toLowerCase() === 'true'

  // sort - order
  const sort = (params.sort ?? 'relevance') as SearchSortOption
  if (!VALID_SORT_OPTIONS.includes(sort)) {
    errors.push(`Invalid sort option: ${sort}`)
  }

  // postedAfter - ISO date
  let postedAfter: string | undefined = params.postedAfter
  if (postedAfter) {
    const date = new Date(postedAfter)
    if (isNaN(date.getTime())) {
      errors.push('Invalid postedAfter date format (use ISO-8601)')
    } else {
      postedAfter = date.toISOString()
    }
  }

  if (errors.length > 0) {
    throw new AppError('VALIDATION_ERROR', errors.join('; '), 400, { errors })
  }

  return {
    q,
    skills,
    page,
    pageSize,
    seniority,
    remoteMode,
    companies,
    excludedCompanies,
    sources,
    minTrustScore,
    includeHidden,
    sort,
    countries,
    postedAfter,
  }
}

function parseCommaSeparated(value: string | undefined): string[] {
  if (!value || value.trim().length === 0) return []
  return value
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

function parsePositiveInt(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue
  const parsed = Number.parseInt(value, 10)
  if (isNaN(parsed) || parsed < 1) return defaultValue
  return parsed
}

function parseFloatParam(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue
  const parsed = Number.parseFloat(value)
  if (isNaN(parsed)) return defaultValue
  return parsed
}
