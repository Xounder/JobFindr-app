import type { ValidatedSearchInput, NormalizedJob, SalaryInfo } from '@jobfindr/types'
import { ApiProvider } from '../domain/api-provider.ts'
import { normalizeJob, inferSeniority } from '../services/normalization-pipeline.ts'
import { withRetry } from '../services/retry-system.ts'
import { cleanHtml } from '../../normalization/services/html-cleaner.ts'
import { extractSkillsFromJob } from '../../normalization/services/skill-extraction.ts'
import { env } from '../../../config/env.ts'
import { logger } from '../../../shared/logger/logger.ts'

const PROVIDER_NAME = 'adzuna'
const BASE_URL = 'https://api.adzuna.com/v1/api'
const COUNTRY = 'br'
const RESULTS_PER_PAGE = 50

type AdzunaJobRaw = {
  id: string
  title: string
  company: { display_name: string }
  location: { display_name: string }
  salary_min?: number
  salary_max?: number
  description: string
  category?: { label: string }
  contract_type?: string
  created: string
  redirect_url: string
}

type AdzunaApiResponse = {
  results: AdzunaJobRaw[]
  count: number
  __CLASS__: string
}

export class AdzunaProvider extends ApiProvider {
  private appId: string
  private appKey: string

  constructor(appId: string, appKey: string) {
    super({
      name: PROVIDER_NAME,
      baseUrl: BASE_URL,
      defaultHeaders: {
        'Accept': 'application/json',
      },
    })
    this.appId = appId
    this.appKey = appKey
  }

  search(input: ValidatedSearchInput): Promise<NormalizedJob[]> {
    return this.executeWithInstrumentation(async () => {
      if (!this.appId || !this.appKey) {
        this.logWarn('Adzuna credentials not configured, returning empty')
        return []
      }

      const jobs: NormalizedJob[] = []
      const query = input.q.toLowerCase()
      const page = input.page ?? 1

      try {
        const response = await withRetry(
          PROVIDER_NAME,
          'fetch-jobs',
          async () => {
            const params: Record<string, string | number> = {
              app_id: this.appId,
              app_key: this.appKey,
              results_per_page: RESULTS_PER_PAGE,
            }

            if (query) {
              params.what = query
            }

            const res = await this.get<AdzunaApiResponse>(`/jobs/${COUNTRY}/search/${page}`, { params })

            const retryAfter = this.handleRateLimit(res)
            if (retryAfter > 0) {
              throw new Error(`Rate limited, retry after ${retryAfter}ms`)
            }

            return res
          }
        )

        const rawJobs = response.data.results

        if (!rawJobs || rawJobs.length === 0) {
          this.logInfo('No jobs returned from Adzuna API')
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

        this.logInfo(`Fetched ${jobs.length} jobs from Adzuna`)
      } catch (error) {
        this.logError('Failed to fetch jobs from Adzuna',
          error instanceof Error ? error.message : 'Unknown'
        )
      }

      return jobs
    }, input)
  }

  private mapJob(raw: AdzunaJobRaw): NormalizedJob {
    const externalId = `adzuna-${raw.id}`

    const description = raw.description ? cleanHtml(raw.description) : ''

    const salary: SalaryInfo | undefined =
      raw.salary_min !== undefined && raw.salary_max !== undefined
        ? {
            min: raw.salary_min,
            max: raw.salary_max,
            currency: 'BRL',
            period: 'yearly',
          }
        : undefined

    const location = raw.location?.display_name ?? ''
    const company = raw.company?.display_name ?? 'Unknown Company'

    const skills = extractSkillsFromJob(raw.title, description)

    let remoteMode: 'remote' | 'hybrid' | 'on-site' | undefined
    const ct = raw.contract_type?.toLowerCase() ?? ''
    if (ct.includes('remoto') || ct.includes('remote')) {
      remoteMode = 'remote'
    } else if (ct.includes('hibrido') || ct.includes('hybrid')) {
      remoteMode = 'hybrid'
    } else if (ct.includes('presencial') || ct.includes('on-site')) {
      remoteMode = 'on-site'
    }

    const postedAt = raw.created ? new Date(raw.created).toISOString() : undefined

    return normalizeJob(PROVIDER_NAME, externalId, {
      title: raw.title,
      description,
      company,
      url: raw.redirect_url,
      postedAt,
      location,
      industry: raw.category?.label ?? undefined,
      salary,
      skills,
      seniority: inferSeniority(raw.title),
      remoteMode,
    })
  }

  protected hasMorePages(response: unknown, currentPage: number): boolean {
    const resp = response as AdzunaApiResponse
    if (!resp || !resp.count) return false
    return currentPage * RESULTS_PER_PAGE < resp.count
  }
}

export async function createAdzunaProvider(): Promise<AdzunaProvider> {
  const appId = env.ADZUNA_APP_ID
  const appKey = env.ADZUNA_APP_KEY
  if (!appId || !appKey) {
    logger.warn('Adzuna credentials not configured, provider will return empty', {
      module: 'adzuna-provider',
    })
    return new AdzunaProvider('', '')
  }
  return new AdzunaProvider(appId, appKey)
}
