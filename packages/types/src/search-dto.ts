/**
 * Search Data Transfer Objects and validation schemas.
 * TASK-010: Create Search DTO
 */
import type { SeniorityLevel, RemoteMode } from './normalized-job.ts'

/**
 * Input parameters for a job search request.
 */
export type SearchJobsInput = {
  /** Free-text query (job title, keywords) */
  q?: string
  /** Comma-separated list of skills */
  skills?: string[]
  /** Page number (1-indexed) */
  page?: number
  /** Page size (max 20) */
  pageSize?: number
  /** Filter by seniority levels */
  seniority?: SeniorityLevel[]
  /** Filter by remote mode */
  remoteMode?: RemoteMode[]
  /** Filter by specific companies (whitelist) */
  companies?: string[]
  /** Exclude specific companies (blacklist) */
  excludedCompanies?: string[]
  /** Filter by source providers */
  sources?: string[]
  /** Minimum trust score (0-10) */
  minTrustScore?: number
  /** Include hidden/low-trust results */
  includeHidden?: boolean
  /** Sort order */
  sort?: SearchSortOption
  /** ISO-8601 date to filter jobs posted after */
  postedAfter?: string
}

export type SearchSortOption =
  | 'relevance'
  | 'date'
  | 'salary_high'
  | 'salary_low'

/**
 * Normalized search parameters after validation.
 */
export type ValidatedSearchInput = {
  q: string
  skills: string[]
  page: number
  pageSize: number
  seniority: SeniorityLevel[]
  remoteMode: RemoteMode[]
  companies: string[]
  excludedCompanies: string[]
  sources: string[]
  minTrustScore: number
  includeHidden: boolean
  sort: SearchSortOption
  postedAfter: string | undefined
}
