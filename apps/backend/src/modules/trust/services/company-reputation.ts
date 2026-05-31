/**
 * Company reputation evaluator.
 * TASK-054: Create Company Reputation Evaluator
 *
 * Evaluates companies based on public metrics and signals.
 * For MVP, uses heuristic scoring based on company name signals.
 */
import type { TrustSignals, CompanySizeCategory } from '@jobfindr/types'
import type { CompanyReputationInput } from './trust-score-formula.ts'

// Company name patterns that indicate size/reputation
const ENTERPRISE_PATTERNS = ['jpmorgan', 'goldman', 'morgan stanley', 'google', 'microsoft', 'amazon', 'apple', 'meta', 'netflix', 'ibm', 'oracle', 'sap', 'salesforce', 'accenture', 'deloitte', 'pwc', 'ey', 'kpmg']
const LARGE_COMPANY_PATTERNS = ['bank', 'insurance', 'healthcare', 'pharma', 'telecom', 'airline', 'retail', 'automotive']
const TECH_COMPANY_INDICATORS = ['tech', 'software', 'digital', 'data', 'cloud', 'ai', 'cyber', 'saas', 'platform']

// Well-known tech companies that are public
const PUBLIC_TECH_COMPANIES = [
  'google', 'microsoft', 'amazon', 'apple', 'meta', 'netflix', 'ibm', 'oracle', 'salesforce',
  'adobe', 'intel', 'cisco', 'vmware', 'paypal', 'shopify', 'spotify', 'twitter', 'uber',
  'lyft', 'airbnb', 'stripe', 'square', 'twilio', 'zoom', 'slack', 'dropbox', 'pinterest',
  'snapchat', 'coinbase', 'robinhood', 'roblox', 'unity', 'datadog', 'cloudflare', 'mongodb',
]

const KNOWN_LINKEDIN_COMPANIES = new Set([
  ...PUBLIC_TECH_COMPANIES,
  'accenture', 'deloitte', 'pwc', 'ey', 'kpmg', 'mckinsey', 'bain', 'bcg',
])

/**
 * Estimate company size based on name and industry.
 */
function estimateCompanySize(
  name: string,
  industry?: string
): CompanySizeCategory {
  const lower = name.toLowerCase()

  if (ENTERPRISE_PATTERNS.some((p) => lower.includes(p))) return 'enterprise'
  if (LARGE_COMPANY_PATTERNS.some((p) => lower.includes(p))) return 'large'
  if ((industry?.toLowerCase() ?? '').includes('enterprise')) return 'enterprise'
  if (TECH_COMPANY_INDICATORS.some((p) => lower.includes(p))) return 'medium'

  return 'unknown'
}

/**
 * Build trust signals for a company.
 */
export function buildCompanySignals(
  name: string,
  industry?: string
): TrustSignals {
  const lower = name.toLowerCase()

  return {
    hasWebsite: true, // Assume they have a website if listed
    hasLinkedIn: KNOWN_LINKEDIN_COMPANIES.has(lower) || lower.length > 3,
    isPublicCompany: PUBLIC_TECH_COMPANIES.includes(lower),
    companySize: estimateCompanySize(name, industry),
    complaintScore: 1, // Default low complaint score
    transparencyScore: 5, // Default medium transparency
  }
}

/**
 * Evaluate company reputation.
 */
export function evaluateCompanyReputation(
  companyName: string,
  industry?: string
): CompanyReputationInput {
  return {
    name: companyName,
    industry,
    signals: buildCompanySignals(companyName, industry),
  }
}
