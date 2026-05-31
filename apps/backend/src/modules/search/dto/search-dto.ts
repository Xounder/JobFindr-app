/**
 * Search Request/Response DTOs.
 * TASK-010: Create Search DTO
 */
import type { NormalizedJob, PaginationMeta, PartialResponseMeta } from '@jobfindr/types'

export type SearchRequestQuery = {
  q?: string
  skills?: string
  page?: string
  pageSize?: string
  seniority?: string
  remoteMode?: string
  companies?: string
  excludedCompanies?: string
  excludeCompanies?: string // alias
  sources?: string
  minTrustScore?: string
  trustMin?: string // alias
  includeHidden?: string
  sort?: string
  postedAfter?: string
  countries?: string
}

export type SearchSuccessResponse = {
  success: true
  data: NormalizedJob[]
  meta: PaginationMeta
  partial?: PartialResponseMeta
}

export type SearchErrorResponse = {
  success: false
  error: {
    code: string
    message: string
  }
}
