/**
 * JSON Provider - base class for JSON endpoint-based providers.
 * TASK-116: Create ProviderType Classification System
 *
 * Providers that fetch jobs from JSON endpoints (not necessarily RESTful APIs).
 * Includes endpoint discovery and JSON path extraction utilities.
 */
import { BaseProvider, type BaseProviderOptions } from './base-provider.ts'
import { createHttpClient } from '../../scraping/http/axios-client.ts'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

export type JsonProviderOptions = BaseProviderOptions & {
  baseUrl?: string
  defaultHeaders?: Record<string, string>
}

/**
 * Abstract base class for JSON endpoint-based job providers.
 * These typically fetch from non-RESTful JSON endpoints.
 */
export abstract class JsonProvider extends BaseProvider {
  protected readonly httpClient: AxiosInstance
  protected readonly baseUrl?: string

  constructor(options: JsonProviderOptions) {
    super({ ...options, providerType: 'json' })
    this.baseUrl = options.baseUrl
    this.httpClient = createHttpClient(options.baseUrl, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.defaultHeaders,
      },
    })
  }

  /**
   * Make a GET request.
   */
  protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.httpClient.get<T>(url, config)
  }

  /**
   * Make a POST request.
   */
  protected async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.httpClient.post<T>(url, data, config)
  }

  /**
   * Safely extract a value from nested JSON using a dot-separated path.
   * Returns undefined if the path doesn't exist.
   */
  protected extractFromPath<T = unknown>(obj: Record<string, unknown>, path: string): T | undefined {
    const keys = path.split('.')
    let current: unknown = obj

    for (const key of keys) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return undefined
      }
      current = (current as Record<string, unknown>)[key]
    }

    return current as T
  }

  /**
   * Extract an array from a JSON path, returning empty array if not found.
   */
  protected extractArrayFromPath(obj: Record<string, unknown>, path: string): unknown[] {
    const result = this.extractFromPath<unknown[]>(obj, path)
    return Array.isArray(result) ? result : []
  }

  /**
   * Extract a string from a JSON path, returning default if not found.
   */
  protected extractStringFromPath(obj: Record<string, unknown>, path: string, defaultValue: string = ''): string {
    const result = this.extractFromPath<string>(obj, path)
    return typeof result === 'string' ? result : defaultValue
  }

  /**
   * Extract a number from a JSON path, returning default if not found.
   */
  protected extractNumberFromPath(obj: Record<string, unknown>, path: string, defaultValue: number = 0): number {
    const result = this.extractFromPath<number>(obj, path)
    return typeof result === 'number' ? result : defaultValue
  }
}
