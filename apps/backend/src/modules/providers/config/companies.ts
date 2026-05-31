/**
 * Company Board Mapping Config.
 * TASK-119: Create Company Board Mapping Config
 *
 * Centralized mapping of companies to their board tokens/endpoints
 * for each provider (Greenhouse, Ashby, Lever, Workday).
 */

/**
 * Greenhouse company board mapping.
 * Each company has a board_token used in the Greenhouse Job Board API.
 * Format: GET https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs
 */
export type GreenhouseCompany = {
  name: string
  boardToken: string
}

export const GREENHOUSE_COMPANIES: readonly GreenhouseCompany[] = [
  { name: 'Stripe', boardToken: 'stripe' },
  { name: 'Airbnb', boardToken: 'airbnb' },
  { name: 'Coinbase', boardToken: 'coinbase' },
  { name: 'Dropbox', boardToken: 'dropbox' },
  { name: 'Square', boardToken: 'square' },
  { name: 'Twilio', boardToken: 'twilio' },
  { name: 'Slack', boardToken: 'slack' },
  { name: 'Pinterest', boardToken: 'pinterest' },
  { name: 'Robinhood', boardToken: 'robinhood' },
  { name: 'Palantir', boardToken: 'palantir' },
  { name: 'GitHub', boardToken: 'github' },
  { name: 'Shopify', boardToken: 'shopify' },
  { name: 'Canva', boardToken: 'canva' },
] as const

/**
 * Ashby company board mapping.
 * Each company has a board identifier used in the Ashby Posting API.
 * Format: GET https://api.ashbyhq.com/posting-api/job-board/{board}
 */
export type AshbyCompany = {
  name: string
  board: string
}

export const ASHBY_COMPANIES: readonly AshbyCompany[] = [
  { name: 'Notion', board: 'notion' },
  { name: 'Linear', board: 'linear' },
  { name: 'Loom', board: 'loom' },
  { name: 'Vercel', board: 'vercel' },
  { name: 'Rippling', board: 'rippling' },
  { name: 'Figma', board: 'figma' },
] as const

/**
 * Lever company mapping.
 * Each company has a slug used in the Lever Posting API.
 * Format: GET https://api.lever.co/v0/postings/{company}?mode=json
 */
export type LeverCompany = {
  name: string
  slug: string
}

export const LEVER_COMPANIES: readonly LeverCompany[] = [
  { name: 'Netflix', slug: 'netflix' },
  { name: 'Uber', slug: 'uber' },
  { name: 'Asana', slug: 'asana' },
  { name: 'Buffer', slug: 'buffer' },
  { name: 'Walmart', slug: 'walmart' },
  { name: 'TripActions', slug: 'tripactions' },
] as const

/**
 * Workday company mapping.
 * Workday uses a custom CXS API with company-specific subdomain, tenant, and career site.
 * Format: POST https://{subdomain}.wd1.myworkdayjobs.com/wday/cxs/{tenant}/{career_site}/jobs
 */
export type WorkdayCompany = {
  name: string
  subdomain: string
  tenant: string
  careerSite: string
}

export const WORKDAY_COMPANIES: readonly WorkdayCompany[] = [
  { name: 'Target', subdomain: 'target', tenant: 'target', careerSite: 'target' },
  { name: 'Salesforce', subdomain: 'salesforce', tenant: 'salesforce', careerSite: 'salesforce' },
  { name: 'Walmart', subdomain: 'walmart', tenant: 'walmart', careerSite: 'us' },
  { name: 'Starbucks', subdomain: 'starbucks', tenant: 'starbucks', careerSite: 'starbucks' },
] as const

/**
 * Get a Greenhouse company by board token.
 */
export function getGreenhouseCompanyByToken(boardToken: string): GreenhouseCompany | undefined {
  return GREENHOUSE_COMPANIES.find((c) => c.boardToken === boardToken)
}

/**
 * Get company name from any provider's company list.
 * Useful for display/logging purposes.
 */
export function getCompanyDisplayName(boardTokenOrSlug: string): string {
  const greenhouse = GREENHOUSE_COMPANIES.find((c) => c.boardToken === boardTokenOrSlug)
  if (greenhouse) return greenhouse.name

  const ashby = ASHBY_COMPANIES.find((c) => c.board === boardTokenOrSlug)
  if (ashby) return ashby.name

  const lever = LEVER_COMPANIES.find((c) => c.slug === boardTokenOrSlug)
  if (lever) return lever.name

  return boardTokenOrSlug
}
