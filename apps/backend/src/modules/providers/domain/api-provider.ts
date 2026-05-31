/**
 * API Provider - base class for REST API-based providers.
 * TASK-116: Create ProviderType Classification System
 *
 * Provides HTTP client, pagination helpers (cursor/page/offset),
 * and rate-limit awareness for API-based providers.
 */
import { BaseProvider, type BaseProviderOptions } from './base-provider.ts'
import { createHttpClient } from '../../scraping/http/axios-client.ts'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

export type PaginationStrategy = 'page' | 'cursor' | 'offset'

export type ApiPaginationConfig = {
  strategy: PaginationStrategy
  pageParam?: string
  limitParam?: string
  cursorParam?: string
  offsetParam?: string
  defaultLimit?: number
  maxLimit?: number
}

export type ApiProviderOptions = BaseProviderOptions & {
  baseUrl?: string
  defaultHeaders?: Record<string, string>
  pagination?: ApiPaginationConfig
}

/**
 * Abstract base class for REST API-based job providers.
 * Handles HTTP communication, pagination, and rate limiting.
 */
export abstract class ApiProvider extends BaseProvider {
  protected readonly httpClient: AxiosInstance
  protected readonly baseUrl?: string
  protected readonly pagination?: ApiPaginationConfig

  constructor(options: ApiProviderOptions) {
    super({ ...options, providerType: 'api' })
    this.baseUrl = options.baseUrl
    this.pagination = options.pagination
    this.httpClient = createHttpClient(options.baseUrl, {
      headers: {
        'Accept': 'application/json',
        ...options.defaultHeaders,
      },
    })
  }

  /**
   * Make a GET request with rate-limit awareness.
   */
  protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.httpClient.get<T>(url, config)
  }

  /**
   * Make a POST request with rate-limit awareness.
   */
  protected async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.httpClient.post<T>(url, data, config)
  }

  /**
   * Build pagination params based on configured strategy.
   */
  protected buildPaginationParams(page: number, limit?: number): Record<string, string | number> {
    const cfg = this.pagination
    if (!cfg) return {}

    const pageSize = Math.min(limit ?? cfg.defaultLimit ?? 20, cfg.maxLimit ?? 50)

    switch (cfg.strategy) {
      case 'page':
        return {
          [cfg.pageParam ?? 'page']: page,
          [cfg.limitParam ?? 'per_page']: pageSize,
        }
      case 'offset':
        return {
          [cfg.offsetParam ?? 'offset']: (page - 1) * pageSize,
          [cfg.limitParam ?? 'limit']: pageSize,
        }
      default:
        return {}
    }
  }

  /**
   * Check if the response has more pages based on the strategy.
   * Override in subclass for custom logic.
   */
  protected abstract hasMorePages(response: unknown, currentPage: number): boolean

  /**
   * Get the next page cursor from response.
   * Override in subclass for cursor-based pagination.
   */
  protected getNextCursor(_response: unknown): string | null {
    return null
  }

  /**
   * Handle rate-limit response by respecting Retry-After header.
   */
  protected handleRateLimit(response: AxiosResponse): number {
    const retryAfter = response.headers['retry-after']
    if (retryAfter) {
      const seconds = Number.parseInt(String(retryAfter), 10)
      if (!isNaN(seconds) && seconds > 0) {
        this.logWarn(`Rate limited, waiting ${seconds}s`, undefined, { retryAfter: seconds })
        return seconds * 1000
      }
    }
    return 0
  }
}
