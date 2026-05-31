/**
 * Manual override system for trust visibility.
 * TASK-052: Create Manual Override System
 *
 * Allows users to override trust-based hiding of companies.
 * Stateless - overrides are passed per-request via query parameters.
 */
import type { NormalizedJob } from '@jobfindr/types'
import { hiddenCompaniesConfig } from './hidden-companies-config.ts'

export type ManualOverrideConfig = {
  /** Companies to explicitly include (override hidden status) */
  includeCompanies: string[]
  /** Companies to explicitly exclude */
  excludeCompanies: string[]
  /** Whether to include all hidden results */
  includeHidden: boolean
}

/**
 * Apply manual overrides to a list of jobs.
 * Returns filtered list based on user preferences.
 */
export function applyManualOverrides(
  jobs: NormalizedJob[],
  config: ManualOverrideConfig
): NormalizedJob[] {
  const includeLower = config.includeCompanies.map((c) => c.toLowerCase().trim())
  const excludeLower = config.excludeCompanies.map((c) => c.toLowerCase().trim())

  return jobs.filter((job) => {
    const companyLower = job.company.toLowerCase().trim()

    // Exclude companies explicitly rejected
    if (excludeLower.includes(companyLower)) return false

    // If includeHidden is true, keep all
    if (config.includeHidden) return true

    // If company is in include list, keep it regardless of hidden status
    if (includeLower.includes(companyLower)) return true

    // If company is in hidden list, filter out
    if (hiddenCompaniesConfig.isHidden(job.company)) return false

    return true
  })
}

/**
 * Build override config from search input.
 */
export function buildOverrideConfig(
  includeCompanies: string[],
  excludeCompanies: string[],
  includeHidden: boolean
): ManualOverrideConfig {
  return {
    includeCompanies: includeCompanies ?? [],
    excludeCompanies: excludeCompanies ?? [],
    includeHidden: includeHidden ?? false,
  }
}
