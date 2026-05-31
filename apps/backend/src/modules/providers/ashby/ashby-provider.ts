/**
 * Ashby Jobs Provider.
 * TASK-121: Implement Ashby Provider
 *
 * Uses the Ashby public Job Board API:
 * GET https://api.ashbyhq.com/posting-api/job-board/{board}?includeCompensation=true
 *
 * Maps compensation data to SalaryInfo.
 */
import type { ValidatedSearchInput, NormalizedJob } from '@jobfindr/types'
import { ApiProvider } from '../domain/api-provider.ts'
import { normalizeJob, locationToString, parseCompensation, inferSeniority } from '../services/normalization-pipeline.ts'
import { withRetry } from '../services/retry-system.ts'
import { ASHBY_COMPANIES } from '../config/companies.ts'
import { cleanHtml } from '../../normalization/services/html-cleaner.ts'
import { extractSkillsFromJob } from '../../normalization/services/skill-extraction.ts'

const PROVIDER_NAME = 'ashby'
const BASE_URL = 'https://api.ashbyhq.com/posting-api'

/**
 * Raw Ashby job response types.
 */
type AshbyJobRaw = {
  id: string
  title: string
  location: {
    city?: string
    state?: string
    country?: string
    remote?: boolean
  } | null
  compensation?: {
    min?: number
    max?: number
    currency?: string
    interval?: string
  } | null
  descriptionHtml: string | null
  applyUrl: string
  publishedAt: string
  department?: string
  team?: string
}

type AshbyApiResponse = {
  success: boolean
  listings: AshbyJobRaw[]
}

export class AshbyProvider extends ApiProvider {
  constructor() {
    super({
      name: PROVIDER_NAME,
      baseUrl: BASE_URL,
    })
  }

  search(input: ValidatedSearchInput): Promise<NormalizedJob[]> {
    return this.executeWithInstrumentation(async () => {
      const query = input.q.toLowerCase()

      const results = await Promise.allSettled(
        ASHBY_COMPANIES.map(async (company) => {
          const companyJobs = await this.fetchCompanyJobs(company.board, query)
          this.logInfo(`Fetched ${companyJobs.length} jobs from ${company.name} (${company.board})`)
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
   * Fetch jobs for a specific company board.
   */
  private async fetchCompanyJobs(
    board: string,
    query: string
  ): Promise<NormalizedJob[]> {
    const jobs: NormalizedJob[] = []

    try {
      const response = await withRetry(
        PROVIDER_NAME,
        `fetch-${board}`,
        async () => {
          const res = await this.get<AshbyApiResponse>(
            `/job-board/${board}`,
            { params: { includeCompensation: true } }
          )

          const retryAfter = this.handleRateLimit(res)
          if (retryAfter > 0) {
            throw new Error(`Rate limited, retry after ${retryAfter}ms`)
          }

          return res
        }
      )

      const rawJobs = response.data.listings
      if (!rawJobs || rawJobs.length === 0) return jobs

      for (const raw of rawJobs) {
        const mapped = this.mapJob(raw, board)

        // Apply optional query filter
        if (query && !mapped.title.toLowerCase().includes(query) &&
            !mapped.description.toLowerCase().includes(query)) {
          continue
        }

        jobs.push(mapped)
      }
    } catch (error) {
      this.logWarn(`Error fetching jobs for board ${board}`,
        error instanceof Error ? error.message : 'Unknown'
      )
    }

    return jobs
  }

  /**
   * Map an Ashby raw job to NormalizedJob.
   */
  private mapJob(raw: AshbyJobRaw, board: string): NormalizedJob {
    const externalId = `ashby-${board}-${raw.id}`

    // Parse location
    const location = locationToString(raw.location as Record<string, string> | null ?? null)

    // Parse compensation
    const salary = raw.compensation
      ? parseCompensation(raw.compensation as Record<string, unknown>)
      : undefined

    // Parse description and extract skills
    const description = raw.descriptionHtml ? cleanHtml(raw.descriptionHtml) : ''
    const skills = raw.descriptionHtml ? extractSkillsFromJob(raw.title, raw.descriptionHtml) : []

    // Determine industry from department/team
    const industry = raw.department ?? raw.team ?? undefined

    // Parse postedAt
    const postedAt = raw.publishedAt ? new Date(raw.publishedAt).toISOString() : undefined

    // Get company name
    const company = ASHBY_COMPANIES.find((c) => c.board === board)
    const companyName = company?.name ?? board

    // Detect remote from location
    const remoteMode = location.toLowerCase().includes('remote') ? 'remote' as const : undefined

    return normalizeJob(PROVIDER_NAME, externalId, {
      title: raw.title,
      description,
      company: companyName,
      url: raw.applyUrl,
      postedAt,
      location,
      industry,
      salary,
      skills,
      seniority: inferSeniority(raw.title),
      remoteMode,
    })
  }

  protected hasMorePages(_response: unknown, _currentPage: number): boolean {
    // Ashby returns all jobs in a single response
    return false
  }
}

/**
 * Create an Ashby provider instance.
 */
export async function createAshbyProvider(): Promise<AshbyProvider> {
  return new AshbyProvider()
}
