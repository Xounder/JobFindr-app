/**
 * Greenhouse Jobs Provider (Real Implementation).
 * TASK-120: Implement Greenhouse Provider (Real)
 *
 * Uses the public Greenhouse Job Board API:
 * GET https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs?content=true
 *
 * Supports pagination via 'page' param.
 */
import type { ValidatedSearchInput, NormalizedJob } from '@jobfindr/types'
import { ApiProvider } from '../domain/api-provider.ts'
import { normalizeJob, inferSeniority } from '../services/normalization-pipeline.ts'
import { withRetry } from '../services/retry-system.ts'
import { GREENHOUSE_COMPANIES } from '../config/companies.ts'
import { cleanHtml } from '../../normalization/services/html-cleaner.ts'
import { extractSkillsFromJob } from '../../normalization/services/skill-extraction.ts'

const PROVIDER_NAME = 'greenhouse'
const BASE_URL = 'https://boards-api.greenhouse.io/v1/boards'
const MAX_PAGES = 3 // Limit pages to avoid excessive requests

/**
 * Raw Greenhouse job response types.
 */
type GreenhouseJobRaw = {
  id: number
  title: string
  location: { name: string } | null
  offices: Array<{ name: string }>
  departments: Array<{ name: string }>
  content: string | null
  absolute_url: string
  created_at: string
  metadata: Array<{ name: string; value: string }> | null
}

type GreenhouseApiResponse = {
  jobs: GreenhouseJobRaw[]
  meta?: {
    total: number
    page: number
    per_page: number
  }
}

export class GreenhouseProvider extends ApiProvider {
  constructor() {
    super({
      name: PROVIDER_NAME,
      baseUrl: BASE_URL,
      pagination: {
        strategy: 'page',
        pageParam: 'page',
        limitParam: 'per_page',
        defaultLimit: 20,
        maxLimit: 50,
      },
    })
  }

  search(input: ValidatedSearchInput): Promise<NormalizedJob[]> {
    return this.executeWithInstrumentation(async () => {
      const query = input.q.toLowerCase()

      const results = await Promise.allSettled(
        GREENHOUSE_COMPANIES.map(async (company) => {
          const companyJobs = await this.fetchCompanyJobs(company.boardToken, query, MAX_PAGES)
          this.logInfo(`Fetched ${companyJobs.length} jobs from ${company.name} (${company.boardToken})`)
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

      this.logInfo(`Total jobs fetched: ${allJobs.length}`)
      return allJobs
    }, input)
  }

  /**
   * Fetch jobs for a specific company board with pagination.
   */
  private async fetchCompanyJobs(
    boardToken: string,
    query: string,
    maxPages: number
  ): Promise<NormalizedJob[]> {
    const jobs: NormalizedJob[] = []
    let page = 1
    let hasMore = true

    while (hasMore && page <= maxPages) {
      try {
        const response = await withRetry(
          PROVIDER_NAME,
          `fetch-${boardToken}-page-${page}`,
          async () => {
            const params = this.buildPaginationParams(page, 20)
            const res = await this.get<GreenhouseApiResponse>(
              `/${boardToken}/jobs`,
              { params: { ...params, content: true } }
            )

            // Handle rate limiting
            const retryAfter = this.handleRateLimit(res)
            if (retryAfter > 0) {
              // Rate limited — wait and retry is handled by withRetry
              throw new Error(`Rate limited, retry after ${retryAfter}ms`)
            }

            return res
          }
        )

        const rawJobs = response.data.jobs

        if (!rawJobs || rawJobs.length === 0) {
          hasMore = false
          break
        }

        for (const raw of rawJobs) {
          const mapped = this.mapJob(raw, boardToken)

          // Apply optional query filter
          if (query && !mapped.title.toLowerCase().includes(query) &&
              !mapped.description.toLowerCase().includes(query)) {
            continue
          }

          jobs.push(mapped)
        }

        // Check if there are more pages
        const meta = response.data.meta
        if (meta && meta.page * meta.per_page >= meta.total) {
          hasMore = false
        }

        page++

        // Small delay between pages
        await new Promise((resolve) => setTimeout(resolve, 200))

      } catch (error) {
        this.logWarn(`Error fetching page ${page} for ${boardToken}`,
          error instanceof Error ? error.message : 'Unknown'
        )
        hasMore = false
      }
    }

    return jobs
  }

  /**
   * Map a Greenhouse raw job to NormalizedJob.
   */
  private mapJob(raw: GreenhouseJobRaw, boardToken: string): NormalizedJob {
    const externalId = `greenhouse-${boardToken}-${raw.id}`

    // Parse location from offices
    const location = raw.offices?.[0]?.name ?? raw.location?.name ?? ''

    // Parse industry from departments
    const industry = raw.departments?.[0]?.name ?? undefined

    // Parse description and extract skills
    const description = raw.content ? cleanHtml(raw.content) : ''
    const skills = raw.content ? extractSkillsFromJob(raw.title, raw.content) : []

    // Construct proper apply URL
    const url = raw.absolute_url ?? `https://boards.greenhouse.io/${boardToken}/jobs/${raw.id}`

    // Parse postedAt
    const postedAt = raw.created_at ? new Date(raw.created_at).toISOString() : undefined

    // Get company name from config
    const company = GREENHOUSE_COMPANIES.find((c) => c.boardToken === boardToken)
    const companyName = company?.name ?? boardToken

    return normalizeJob(PROVIDER_NAME, externalId, {
      title: raw.title,
      description,
      company: companyName,
      url,
      postedAt,
      location,
      industry,
      skills,
      seniority: inferSeniority(raw.title),
      remoteMode: location.toLowerCase().includes('remote') ? 'remote' : undefined,
    })
  }

  protected hasMorePages(response: unknown, _currentPage: number): boolean {
    const resp = response as GreenhouseApiResponse
    if (resp.meta) {
      return resp.meta.page * resp.meta.per_page < resp.meta.total
    }
    // Fallback: assume more if we got a full page
    return (resp.jobs?.length ?? 0) >= 20
  }
}

/**
 * Create a Greenhouse provider instance.
 */
export async function createGreenhouseProvider(): Promise<GreenhouseProvider> {
  return new GreenhouseProvider()
}
