/**
 * Workday Jobs Provider (Real Implementation).
 * TASK-123: Refactor Workday Provider (Real)
 *
 * Uses Workday CXS API:
 * POST https://{subdomain}.wd1.myworkdayjobs.com/wday/cxs/{tenant}/{career_site}/jobs
 *
 * Pagination via limit/offset in request body.
 */
import type { ValidatedSearchInput, NormalizedJob } from '@jobfindr/types'
import { JsonProvider } from '../domain/json-provider.ts'
import { normalizeJob, inferSeniority } from '../services/normalization-pipeline.ts'
import { withRetry } from '../services/retry-system.ts'
import type { WorkdayCompany } from '../config/companies.ts'
import { cleanHtml } from '../../normalization/services/html-cleaner.ts'
import { extractSkillsFromJob } from '../../normalization/services/skill-extraction.ts'

const PROVIDER_NAME = 'workday'
const MAX_PAGES = 3

/**
 * Raw Workday job response types.
 */
type WorkdayJobPosting = {
  title: string
  businessLocation: string
  location?: string
  jobPostingId: string
  externalPath: string
  primaryPostingDescription?: {
    text: string
  }
  postedOnDate?: string
  categories?: string
  jobFamily?: string
}

type WorkdayApiResponse = {
  total?: number
  totalPages?: number
  jobPostings: WorkdayJobPosting[]
}

type WorkdayApiRequest = {
  limit: number
  offset: number
  searchText: string
}

export class WorkdayProvider extends JsonProvider {
  private companies: readonly WorkdayCompany[]

  constructor(companies?: readonly WorkdayCompany[]) {
    super({
      name: PROVIDER_NAME,
    })
    this.companies = companies ?? []
  }

  search(input: ValidatedSearchInput): Promise<NormalizedJob[]> {
    return this.executeWithInstrumentation(async () => {
      if (this.companies.length === 0) return []
      const query = input.q.toLowerCase()

      const results = await Promise.allSettled(
        this.companies.map(async (company) => {
          const companyJobs = await this.fetchCompanyJobs(company, query, MAX_PAGES)
          this.logInfo(`Fetched ${companyJobs.length} jobs from ${company.name}`)
          return companyJobs
        })
      )

      const allJobs: NormalizedJob[] = []
      for (const result of results) {
        if (result.status === 'fulfilled') {
          allJobs.push(...result.value)
        } else {
          this.logWarn('Failed to fetch jobs for a company',
            result.reason instanceof Error ? result.reason.message : 'Unknown'
          )
        }
      }

      return allJobs
    }, input)
  }

  /**
   * Fetch jobs for a specific Workday company.
   */
  private async fetchCompanyJobs(
    company: WorkdayCompany,
    query: string,
    maxPages: number
  ): Promise<NormalizedJob[]> {
    const jobs: NormalizedJob[] = []
    const baseUrl = `https://${company.subdomain}.wd1.myworkdayjobs.com/wday/cxs/${company.tenant}/${company.careerSite}`

    let offset = 0
    const limit = 20

    for (let page = 0; page < maxPages; page++) {
      try {
        const response = await withRetry(
          PROVIDER_NAME,
          `fetch-${company.name}-page-${page}`,
          async () => {
            const body: WorkdayApiRequest = {
              limit,
              offset,
              searchText: '',
            }

            const res = await this.post<WorkdayApiResponse>(
              `${baseUrl}/jobs`,
              body,
              {
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                },
              }
            )

            return res
          }
        )

        const data = response.data
        const postings = data.jobPostings

        if (!postings || postings.length === 0) break

        for (const posting of postings) {
          const mapped = this.mapJob(posting, company.name)

          // Apply optional query filter
          if (query && !mapped.title.toLowerCase().includes(query) &&
              !mapped.description.toLowerCase().includes(query)) {
            continue
          }

          jobs.push(mapped)
        }

        // Check if there are more pages
        if (data.total !== undefined && offset + limit >= data.total) break
        if (postings.length < limit) break

        offset += limit

        // Small delay between pages
        await new Promise((resolve) => setTimeout(resolve, 300))

      } catch (error) {
        this.logWarn(`Error fetching page ${page} for ${company.name}`,
          error instanceof Error ? error.message : 'Unknown'
        )
        break
      }
    }

    return jobs
  }

  /**
   * Map a Workday raw job posting to NormalizedJob.
   */
  private mapJob(posting: WorkdayJobPosting, companyName: string): NormalizedJob {
    const externalId = `workday-${companyName.toLowerCase().replace(/\s+/g, '-')}-${posting.jobPostingId}`

    // Parse location
    const location = posting.location ?? posting.businessLocation ?? ''

    // Parse description
    const description = posting.primaryPostingDescription?.text
      ? cleanHtml(posting.primaryPostingDescription.text)
      : ''
    const skills = description ? extractSkillsFromJob(posting.title, description) : []

    // Construct URL
    const url = posting.externalPath
      ? `https://${companyName.toLowerCase().replace(/\s+/g, '')}.myworkdayjobs.com${posting.externalPath}`
      : ''

    // Parse postedAt
    const postedAt = posting.postedOnDate
      ? new Date(posting.postedOnDate).toISOString()
      : undefined

    // Extract industry from categories/job family
    const industry = posting.categories ?? posting.jobFamily ?? undefined

    // Detect remote
    const remoteMode = location.toLowerCase().includes('remote')
      ? 'remote' as const
      : location.toLowerCase().includes('hybrid')
        ? 'hybrid' as const
        : undefined

    return normalizeJob(PROVIDER_NAME, externalId, {
      title: posting.title,
      description,
      company: companyName,
      url,
      postedAt,
      location,
      industry,
      skills,
      seniority: inferSeniority(posting.title),
      remoteMode,
    })
  }
}

import { WORKDAY_COMPANIES } from '../config/companies.ts'

/**
 * Create a Workday provider instance.
 */
export async function createWorkdayProvider(companies?: WorkdayCompany[]): Promise<WorkdayProvider> {
  const companyList = companies ?? [...WORKDAY_COMPANIES]
  return new WorkdayProvider(companyList)
}
