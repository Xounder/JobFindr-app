/**
 * API response and error types.
 */

export type ApiResponse<T> = {
  success: boolean
  data: T
  meta?: PaginationMeta
}

export type ApiErrorResponse = {
  success: false
  error: {
    code: string
    message: string
  }
}

export type PaginationMeta = {
  page: number
  pageSize: number
  totalResults: number
  totalPages: number
}

/**
 * Partial response metadata (some providers may fail).
 */
export type PartialResponseMeta = {
  totalProviders: number
  succeededProviders: number
  failedProviders: number
  providerResults: Array<{
    name: string
    success: boolean
    jobCount: number
    error: string | null
    latencyMs: number
  }>
}
