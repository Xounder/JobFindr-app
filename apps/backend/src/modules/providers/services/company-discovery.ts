import axios from 'axios'
import type { CompanyConfig } from '../config/company-registry.ts'
import { logger } from '../../../shared/logger/logger.ts'

type GreenhouseBoard = {
  name: string
  board_token: string
}

type GreenhouseBoardsResponse = {
  boards: GreenhouseBoard[]
  meta?: {
    page: number
    per_page: number
    total: number
  }
}

type GupyJobRaw = {
  careerPageName: string | null
  careerPageId: number
}

type GupyApiResponse = {
  data: GupyJobRaw[]
  total: number
}

const GREENHOUSE_BOARDS_URL = 'https://boards-api.greenhouse.io/v1/boards'
const GUPY_JOBS_URL = 'https://portal.api.gupy.io/api/v1/jobs'

const DEFAULT_GUPY_SEARCH_TERMS = [
  'engineer', 'developer', 'analyst', 'manager', 'designer',
  'marketing', 'sales', 'support', 'finance', 'operations',
  'software', 'data', 'product', 'estágio', 'júnior',
  'pleno', 'sênior', 'analista', 'desenvolvedor',
]

export class CompanyDiscovery {
  static async greenhouse(): Promise<Omit<CompanyConfig, 'id' | 'createdAt' | 'updatedAt'>[]> {
    const configs: Omit<CompanyConfig, 'id' | 'createdAt' | 'updatedAt'>[] = []
    let page = 1
    const perPage = 50
    let hasMore = true
    let totalPages = 5

    while (hasMore && page <= totalPages) {
      try {
        const response = await axios.get<GreenhouseBoardsResponse>(GREENHOUSE_BOARDS_URL, {
          params: { page, per_page: perPage },
          timeout: 10000,
        })

        const data = response.data
        if (!data.boards || data.boards.length === 0) {
          hasMore = false
          break
        }

        for (const board of data.boards) {
          if (!board.board_token || !board.name) continue
          configs.push({
            provider: 'greenhouse',
            name: board.name,
            enabled: true,
            priority: 10,
            config: { boardToken: board.board_token },
            metadata: { source: 'discovery', lastSyncedAt: new Date().toISOString() },
          })
        }

        if (data.meta) {
          totalPages = Math.ceil(data.meta.total / perPage)
          if (page * perPage >= data.meta.total) {
            hasMore = false
          }
        }

        page++
        await new Promise(resolve => setTimeout(resolve, 200))
      } catch (error) {
        logger.error('Greenhouse discovery failed', {
          module: 'company-discovery',
          error: error instanceof Error ? error.message : 'Unknown',
          data: { page },
        })
        hasMore = false
      }
    }

    logger.info('Greenhouse discovery completed', {
      module: 'company-discovery',
      data: { discoveredCount: configs.length },
    })

    return configs
  }

  static async gupy(options?: {
    terms?: string[]
    concurrency?: number
    delayMs?: number
    minJobsThreshold?: number
  }): Promise<Omit<CompanyConfig, 'id' | 'createdAt' | 'updatedAt'>[]> {
    const terms = options?.terms ?? DEFAULT_GUPY_SEARCH_TERMS
    const concurrency = options?.concurrency ?? 3
    const delayMs = options?.delayMs ?? 500
    const minJobsThreshold = options?.minJobsThreshold ?? 3

    const companyMap = new Map<number, { name: string; jobCount: number }>()

    async function searchTerm(term: string): Promise<void> {
      try {
        const response = await axios.get<GupyApiResponse>(GUPY_JOBS_URL, {
          params: { jobName: term, limit: 50, offset: 0 },
          timeout: 10000,
        })

        const jobs = response.data.data ?? []

        for (const job of jobs) {
          if (!job.careerPageId) continue

          const existing = companyMap.get(job.careerPageId)
          if (existing) {
            existing.jobCount++
          } else {
            companyMap.set(job.careerPageId, {
              name: job.careerPageName ?? `Company-${job.careerPageId}`,
              jobCount: 1,
            })
          }
        }
      } catch (error) {
        logger.warn(`Gupy search term '${term}' failed`, {
          module: 'company-discovery',
          error: error instanceof Error ? error.message : 'Unknown',
        })
      }
    }

    async function runBatched(): Promise<void> {
      for (let i = 0; i < terms.length; i += concurrency) {
        const batch = terms.slice(i, i + concurrency)
        await Promise.all(batch.map(searchTerm))
        if (i + concurrency < terms.length) {
          await new Promise(resolve => setTimeout(resolve, delayMs))
        }
      }
    }

    await runBatched()

    const configs: Omit<CompanyConfig, 'id' | 'createdAt' | 'updatedAt'>[] = []
    for (const [careerPageId, info] of companyMap) {
      if (info.jobCount < minJobsThreshold) continue
      configs.push({
        provider: 'gupy',
        name: info.name,
        enabled: true,
        priority: 10,
        config: { careerPageId, careerPageName: info.name },
        metadata: { source: 'discovery', lastSyncedAt: new Date().toISOString() },
      })
    }

    logger.info('Gupy discovery completed', {
      module: 'company-discovery',
      data: { discoveredCount: configs.length, totalUnique: companyMap.size },
    })

    return configs
  }
}
