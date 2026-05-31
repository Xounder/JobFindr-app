/**
 * Large company prioritization for ranking.
 * TASK-059: Create Large Company Prioritization
 *
 * Boosts well-known/major companies in ranking.
 */

// Companies that get a priority boost
const MAJOR_COMPANIES = new Set([
  'google', 'microsoft', 'amazon', 'apple', 'meta', 'netflix', 'ibm', 'oracle',
  'salesforce', 'adobe', 'intel', 'cisco', 'vmware', 'paypal', 'shopify',
  'spotify', 'twitter', 'uber', 'airbnb', 'stripe', 'square', 'twilio',
  'zoom', 'slack', 'dropbox', 'coinbase', 'nvidia', 'amd', 'tesla',
  'jpmorgan chase', 'goldman sachs', 'morgan stanley', 'bank of america',
  'accenture', 'deloitte', 'pwc', 'ey', 'kpmg', 'mckinsey',
  'nubank', 'ifood', 'mercado libre', 'stone', 'pagseguro',
])

const ENTERPRISE_INDICATORS = [
  'corp', 'inc', 'ltd', 'limited', 'group', 'global', 'international',
]

import type { NormalizedJob, RankingWeights } from '@jobfindr/types'

/**
 * Compute company priority score (0-100).
 */
export function computeCompanyPriorityScore(
  job: NormalizedJob,
  weights: RankingWeights
): number {
  const company = job.company.toLowerCase().trim()
  let baseScore = 50 // Default neutral

  // Major companies get a boost
  for (const major of MAJOR_COMPANIES) {
    if (company.includes(major) || major.includes(company)) {
      baseScore = 90
      break
    }
  }

  // Enterprise indicators suggest larger companies
  if (baseScore < 90) {
    for (const indicator of ENTERPRISE_INDICATORS) {
      if (company.endsWith(indicator)) {
        baseScore = Math.max(baseScore, 70)
        break
      }
    }
  }

  return (baseScore / 100) * weights.companyPriority * 100
}
