/**
 * Lever Jobs Provider.
 * TASK-122: Implement Lever Provider
 *
 * Uses the Lever public Posting API:
 * GET https://api.lever.co/v0/postings/{company}?mode=json
 *
 * Maps categories.location, categories.team, description, applyUrl.
 */
import type { ValidatedSearchInput, NormalizedJob } from '@jobfindr/types'
import { ApiProvider } from '../domain/api-provider.ts'
import { normalizeJob, inferSeniority } from '../services/normalization-pipeline.ts'
import { withRetry } from '../services/retry-system.ts'
import { LEVER_COMPANIES } from '../config/companies.ts'
import { cleanHtml } from '../../normalization/services/html-cleaner.ts'
import { extractSkillsFromJob } from '../../normalization/services/skill-extraction.ts'

const PROVIDER_NAME = 'lever'
const BASE_URL = 'https://api.lever.co/v0/postings'

/**
 * Raw Lever job response types.
 */
type LeverJobRaw = {
  id: string
  text: string
  description: string
  descriptionText: string
  categories: {
    location?: string
    team?: string
    commitment?: string
    department?: string
    allLocations?: string[]
  }
  workplaceType?: string
  lists: Array<{ text: string; content: string }>
  additionalPlain: string | null
  additional: string | null
  applyUrl: string
  createdAt: number
  publishedAt: number
  hostedUrl: string
}

type LeverApiResponse = LeverJobRaw[]

export class LeverProvider extends ApiProvider {
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
        LEVER_COMPANIES.map(async (company) => {
          const companyJobs = await this.fetchCompanyJobs(company.slug, query)
          this.logInfo(`Fetched ${companyJobs.length} jobs from ${company.name} (${company.slug})`)
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
   * Fetch jobs for a specific company.
   */
  private async fetchCompanyJobs(
    slug: string,
    query: string
  ): Promise<NormalizedJob[]> {
    const jobs: NormalizedJob[] = []

    try {
      const response = await withRetry(
        PROVIDER_NAME,
        `fetch-${slug}`,
        async () => {
          const res = await this.get<LeverApiResponse>(
            `/${slug}`,
            { params: { mode: 'json' } }
          )

          const retryAfter = this.handleRateLimit(res)
          if (retryAfter > 0) {
            throw new Error(`Rate limited, retry after ${retryAfter}ms`)
          }

          return res
        }
      )

      const rawJobs = response.data
      if (!rawJobs || rawJobs.length === 0) return jobs

      for (const raw of rawJobs) {
        const mapped = this.mapJob(raw, slug)

        // Apply optional query filter
        if (query && !mapped.title.toLowerCase().includes(query) &&
            !mapped.description.toLowerCase().includes(query)) {
          continue
        }

        jobs.push(mapped)
      }
    } catch (error) {
      this.logWarn(`Error fetching jobs for ${slug}`,
        error instanceof Error ? error.message : 'Unknown'
      )
    }

    return jobs
  }

  /**
   * Map a Lever raw job to NormalizedJob.
   */
  private mapJob(raw: LeverJobRaw, slug: string): NormalizedJob {
    const externalId = `lever-${slug}-${raw.id}`

    // Parse location
    const location = raw.categories?.location ?? raw.categories?.allLocations?.[0] ?? ''

    // Parse industry from team/department
    const industry = raw.categories?.team ?? raw.categories?.department ?? undefined

    // Parse description — Lever provides both HTML description and plain text
    const description = raw.description ? cleanHtml(raw.description) : (raw.descriptionText ?? '')
    const skills = extractSkillsFromJob(raw.text, description)

    // Use apply URL
    const url = raw.applyUrl ?? raw.hostedUrl ?? ''

    // Parse postedAt — Lever uses Unix timestamps in seconds
    const postedAtTs = raw.publishedAt ?? raw.createdAt
    const postedAt = postedAtTs ? new Date(postedAtTs * 1000).toISOString() : undefined

    // Detect remote from workplaceType
    let remoteMode: 'remote' | 'hybrid' | 'on-site' | undefined
    const wp = raw.workplaceType?.toLowerCase() ?? ''
    if (wp.includes('remote')) remoteMode = 'remote'
    else if (wp.includes('hybrid')) remoteMode = 'hybrid'
    else if (wp.includes('on-site') || wp.includes('office')) remoteMode = 'on-site'
    else if (location.toLowerCase().includes('remote')) remoteMode = 'remote'

    // Get company name
    const company = LEVER_COMPANIES.find((c) => c.slug === slug)
    const companyName = company?.name ?? slug

    return normalizeJob(PROVIDER_NAME, externalId, {
      title: raw.text,
      description,
      company: companyName,
      url,
      postedAt,
      location,
      industry,
      skills,
      seniority: inferSeniority(raw.text),
      remoteMode,
    })
  }

  protected hasMorePages(_response: unknown, _currentPage: number): boolean {
    // Lever returns all postings in a single response
    return false
  }
}

/**
 * Create a Lever provider instance.
 */
export async function createLeverProvider(): Promise<LeverProvider> {
  return new LeverProvider()
}
