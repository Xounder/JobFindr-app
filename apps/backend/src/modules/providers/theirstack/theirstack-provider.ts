import type { ValidatedSearchInput, NormalizedJob } from '@jobfindr/types'
import { ApiProvider } from '../domain/api-provider.ts'
import { normalizeJob, inferSeniority } from '../services/normalization-pipeline.ts'
import { withRetry } from '../services/retry-system.ts'
import { cleanHtml } from '../../normalization/services/html-cleaner.ts'
import { extractSkillsFromJob } from '../../normalization/services/skill-extraction.ts'
import { parseSalary } from '../../normalization/services/salary-parser.ts'
import { env } from '../../../config/env.ts'
import { logger } from '../../../shared/logger/logger.ts'

const PROVIDER_NAME = 'theirstack'
const BASE_URL = 'https://api.theirstack.com/v1'

const RATE_LIMIT_PER_SECOND = 4
const RATE_LIMIT_PER_MINUTE = 10
const SECOND_MS = 1000
const MINUTE_MS = 60000

type TheirStackJobRaw = {
  job_title: string
  company_name: string
  location: string
  salary?: string
  description: string
  technologies?: string[]
  posting_age?: number
  remote?: boolean
  job_url: string
  country?: string
}

type TheirStackApiResponse = {
  data: TheirStackJobRaw[]
  total?: number
  page?: number
}

export class TheirStackProvider extends ApiProvider {
  private apiKey: string
  private requestTimestamps: number[] = []

  constructor(apiKey: string) {
    super({
      name: PROVIDER_NAME,
      baseUrl: BASE_URL,
      defaultHeaders: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })
    this.apiKey = apiKey
  }

  search(input: ValidatedSearchInput): Promise<NormalizedJob[]> {
    return this.executeWithInstrumentation(async () => {
      if (!this.apiKey) {
        this.logWarn('TheirStack API key not configured, returning empty')
        return []
      }

      await this.throttle()

      const jobs: NormalizedJob[] = []
      const query = input.q.toLowerCase()
      const page = input.page ?? 1

      try {
        const response = await withRetry(
          PROVIDER_NAME,
          'fetch-jobs',
          async () => {
            const body: Record<string, unknown> = {
              page,
              limit: 20,
              country: 'br',
            }

            if (query) {
              body.job_title = query
            }

            const res = await this.post<TheirStackApiResponse>('/jobs/search', body)

            const retryAfter = this.handleRateLimit(res)
            if (retryAfter > 0) {
              throw new Error(`Rate limited, retry after ${retryAfter}ms`)
            }

            return res
          }
        )

        const rawJobs = response.data.data

        if (!rawJobs || rawJobs.length === 0) {
          this.logInfo('No jobs returned from TheirStack API')
          return jobs
        }

        for (const raw of rawJobs) {
          const mapped = this.mapJob(raw)

          if (query && !mapped.title.toLowerCase().includes(query) &&
              !mapped.description.toLowerCase().includes(query)) {
            continue
          }

          jobs.push(mapped)
        }

        this.logInfo(`Fetched ${jobs.length} jobs from TheirStack`)
      } catch (error) {
        this.logError('Failed to fetch jobs from TheirStack',
          error instanceof Error ? error.message : 'Unknown'
        )
      }

      return jobs
    }, input)
  }

  private async throttle(): Promise<void> {
    const now = Date.now()

    this.requestTimestamps = this.requestTimestamps.filter(
      (ts) => now - ts < MINUTE_MS
    )

    const lastSecondTimestamps = this.requestTimestamps.filter(
      (ts) => now - ts < SECOND_MS
    )

    if (lastSecondTimestamps.length >= RATE_LIMIT_PER_SECOND) {
      const oldestInWindow = lastSecondTimestamps[0] ?? now
      const waitMs = SECOND_MS - (now - oldestInWindow) + 50
      this.logWarn(`Rate limit per second reached, waiting ${waitMs}ms`)
      await new Promise((resolve) => setTimeout(resolve, waitMs))
    }

    if (this.requestTimestamps.length >= RATE_LIMIT_PER_MINUTE) {
      const oldestInWindow = this.requestTimestamps[0] ?? now
      const waitMs = MINUTE_MS - (now - oldestInWindow) + 50
      this.logWarn(`Rate limit per minute reached, waiting ${waitMs}ms`)
      await new Promise((resolve) => setTimeout(resolve, waitMs))
    }

    this.requestTimestamps.push(Date.now())
  }

  private mapJob(raw: TheirStackJobRaw): NormalizedJob {
    const externalId = raw.job_url

    const description = raw.description ? cleanHtml(raw.description) : ''

    const salary = raw.salary ? parseSalary(raw.salary) : undefined

    const technologies = raw.technologies ?? []
    const extracted = extractSkillsFromJob(raw.job_title, description)
    const skills = [...new Set([...technologies, ...extracted])]

    let postedAt: string | undefined
    if (raw.posting_age !== undefined) {
      const date = new Date()
      date.setDate(date.getDate() - raw.posting_age)
      postedAt = date.toISOString()
    }

    let remoteMode: 'remote' | 'hybrid' | 'on-site' | undefined
    if (raw.remote === true) {
      remoteMode = 'remote'
    }

    const locationParts: string[] = []
    if (raw.location) locationParts.push(raw.location)
    if (raw.country) locationParts.push(raw.country)
    const location = locationParts.join(', ')

    return normalizeJob(PROVIDER_NAME, externalId, {
      title: raw.job_title,
      description,
      company: raw.company_name ?? 'Unknown Company',
      url: raw.job_url,
      postedAt,
      location,
      salary,
      skills,
      seniority: inferSeniority(raw.job_title),
      remoteMode,
    })
  }

  protected hasMorePages(response: unknown, currentPage: number): boolean {
    const resp = response as TheirStackApiResponse
    if (!resp || !resp.total) return false
    return currentPage * 20 < resp.total
  }
}

export async function createTheirStackProvider(): Promise<TheirStackProvider> {
  const apiKey = env.THEIRSTACK_API_KEY
  if (!apiKey) {
    logger.warn('TheirStack API key not configured, provider will return empty', {
      module: 'theirstack-provider',
    })
    return new TheirStackProvider('')
  }
  return new TheirStackProvider(apiKey)
}
