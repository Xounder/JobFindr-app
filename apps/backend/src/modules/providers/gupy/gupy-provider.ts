/**
 * Gupy Jobs Provider (Real Implementation).
 * TASK-124: Refactor Gupy Provider (Real)
 *
 * Uses Gupy public API:
 * GET https://portal.api.gupy.io/api/v1/jobs
 *
 * Maps fields to NormalizedJob and integrates with trust engine for filtering.
 */
import type { ValidatedSearchInput, NormalizedJob } from '@jobfindr/types'
import { JsonProvider } from '../domain/json-provider.ts'
import { normalizeJob, inferSeniority } from '../services/normalization-pipeline.ts'
import { withRetry } from '../services/retry-system.ts'
import { extractSkillsFromJob } from '../../normalization/services/skill-extraction.ts'
import type { GupyConfig } from '../config/company-registry.ts'

const PROVIDER_NAME = 'gupy'
const BASE_URL = 'https://portal.api.gupy.io/api/v1'

/**
 * Raw Gupy job response types.
 */
type GupyJobRaw = {
  id: number
  name: string
  careerPageName: string | null
  careerPageId: number
  publishedDate: string
  type: string
  modality: string | null
  city: string | null
  state: string | null
  country: string | null
  remote: boolean | null
  coverUrl: string | null
  url: string
}

type GupyApiResponse = {
  data: GupyJobRaw[]
  total: number
  limit: number
  offset: number
}

export class GupyProvider extends JsonProvider {
  private companyCareerPageIds: Set<number>

  constructor(companies?: GupyConfig[]) {
    super({
      name: PROVIDER_NAME,
      baseUrl: BASE_URL,
      defaultHeaders: {
        'Accept': 'application/json',
      },
    })
    this.companyCareerPageIds = new Set(companies?.map(c => c.careerPageId) ?? [])
  }

  search(input: ValidatedSearchInput): Promise<NormalizedJob[]> {
    return this.executeWithInstrumentation(async () => {
      const jobs: NormalizedJob[] = []
      const query = input.q.toLowerCase()

      try {
        const response = await withRetry(
          PROVIDER_NAME,
          'fetch-jobs',
          async () => {
            const res = await this.get<GupyApiResponse>('/jobs', {
              params: {
                name: query || undefined,
                limit: 50,
                offset: 0,
              },
            })

            return res
          }
        )

        const rawJobs = response.data.data

        if (!rawJobs || rawJobs.length === 0) {
          this.logInfo('No jobs returned from Gupy API')
          return jobs
        }

        for (const raw of rawJobs) {
          if (this.companyCareerPageIds.size > 0 && !this.companyCareerPageIds.has(raw.careerPageId)) {
            continue
          }

          const mapped = this.mapJob(raw)

          // Apply optional query filter (additional client-side filter)
          if (query && !mapped.title.toLowerCase().includes(query) &&
              !mapped.description.toLowerCase().includes(query)) {
            continue
          }

          jobs.push(mapped)
        }

        this.logInfo(`Fetched ${jobs.length} jobs from Gupy`)

        // Check for more pages
        const total = response.data.total
        if (total > 50) {
          this.logInfo(`Gupy has ${total} total jobs, only fetched first 50`)
        }

      } catch (error) {
        this.logError('Failed to fetch jobs from Gupy',
          error instanceof Error ? error.message : 'Unknown'
        )
      }

      return jobs
    }, input)
  }

  /**
   * Map a Gupy raw job to NormalizedJob.
   */
  private mapJob(raw: GupyJobRaw): NormalizedJob {
    const externalId = `gupy-${raw.id}`

    // Build location from city/state/country
    const locationParts: string[] = []
    if (raw.city) locationParts.push(raw.city)
    if (raw.state) locationParts.push(raw.state)
    if (raw.country) locationParts.push(raw.country)
    const location = locationParts.join(', ')

    // Determine remote mode
    let remoteMode: 'remote' | 'hybrid' | 'on-site' | undefined
    if (raw.remote === true || raw.modality?.toLowerCase() === 'remoto') {
      remoteMode = 'remote'
    } else if (raw.modality?.toLowerCase() === 'hibrido' || raw.modality?.toLowerCase() === 'hybrid') {
      remoteMode = 'hybrid'
    } else if (raw.modality) {
      remoteMode = 'on-site'
    }

    const description = `Vaga de ${raw.name}${location ? ` em ${location}` : ''}${raw.type ? ` - ${raw.type}` : ''}`

    return normalizeJob(PROVIDER_NAME, externalId, {
      title: raw.name,
      description,
      company: raw.careerPageName ?? 'Empresa Gupy',
      url: raw.url,
      postedAt: raw.publishedDate ? new Date(raw.publishedDate).toISOString() : undefined,
      location,
      skills: extractSkillsFromJob(raw.name, description),
      seniority: inferSeniority(raw.name),
      remoteMode,
    })
  }
}

/**
 * Create a Gupy provider instance.
 */
export async function createGupyProvider(companies?: GupyConfig[]): Promise<GupyProvider> {
  return new GupyProvider(companies)
}
