/**
 * Pagination utilities.
 * TASK-015: Implement Pagination (max 20)
 */
import type { NormalizedJob, PaginationMeta } from '@jobfindr/types'
import { env } from '../../../config/env.ts'

export type PaginatedResult = {
  jobs: NormalizedJob[]
  meta: PaginationMeta
}

/**
 * Apply pagination to a list of jobs.
 * Ensures pageSize never exceeds MAX_PAGE_SIZE.
 */
export function paginateJobs(
  jobs: NormalizedJob[],
  page: number,
  pageSize: number
): PaginatedResult {
  const safePageSize = Math.min(pageSize, env.MAX_PAGE_SIZE)
  const safePage = Math.max(1, page)

  const totalResults = jobs.length
  const totalPages = Math.ceil(totalResults / safePageSize) || 1

  const startIndex = (safePage - 1) * safePageSize
  const paginatedJobs = jobs.slice(startIndex, startIndex + safePageSize)

  return {
    jobs: paginatedJobs,
    meta: {
      page: safePage,
      pageSize: safePageSize,
      totalResults,
      totalPages,
    },
  }
}
