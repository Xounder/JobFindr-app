/**
 * Standardized job entity after normalization.
 * TASK-034: Create NormalizedJob Type
 */
import type { MatchBreakdown } from './match.types.ts'
import type { TrustBreakdown } from './trust.types.ts'

export type NormalizedJob = {
  /** Unique identifier generated from source + provider id */
  id: string
  /** Job title (cleaned) */
  title: string
  /** Company name */
  company: string
  /** Job description (cleaned HTML, plain text) */
  description: string
  /** Extracted skills list (normalized) */
  skills: string[]
  /** Direct apply URL */
  url: string
  /** Provider source name (e.g. "linkedin", "gupy") */
  source: string
  /** ISO-8601 date string when the job was posted (if available) */
  postedAt?: string
  /** Parsed salary information */
  salary?: SalaryInfo
  /** Extracted benefits */
  benefits?: string[]
  /** Detected seniority level */
  seniority?: SeniorityLevel
  /** Remote work mode */
  remoteMode?: RemoteMode
  /** Job location (if available) */
  location?: string
  /** Company industry (if detectable) */
  industry?: string
  /** Trust score (0-10 scale) assigned by the trust engine */
  trustScore?: number
  /** Match score assigned by the matchmaking engine */
  matchScore?: number
  /** Ranking score assigned by the ranking engine */
  rankingScore?: number
  /** Match breakdown data for explanation modals */
  matchBreakdown?: MatchBreakdown
  /** Trust breakdown data for explanation modals */
  trustBreakdown?: TrustBreakdown
}

export type SalaryInfo = {
  min: number
  max: number
  currency: string
  period: SalaryPeriod
}

export type SalaryPeriod = 'yearly' | 'monthly' | 'hourly'

export type SeniorityLevel =
  | 'intern'
  | 'junior'
  | 'mid'
  | 'senior'
  | 'lead'
  | 'principal'
  | 'executive'

export type RemoteMode = 'remote' | 'hybrid' | 'on-site' | 'unknown'
