/**
 * Configured Axios HTTP client for provider requests.
 * TASK-026: Configure Axios Client
 */
import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { env } from '../../../config/env.ts'
import { userAgentRotation } from '../services/user-agent-rotation.ts'

let defaultClient: AxiosInstance | null = null

/**
 * Create a configured Axios instance.
 */
export function createHttpClient(
  baseURL?: string,
  config?: Partial<AxiosRequestConfig>
): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: env.PROVIDER_TIMEOUT_MS,
    headers: {
      'Accept': 'application/json, text/html, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7',
      'Cache-Control': 'no-cache',
    },
    ...config,
  })

  // Add user-agent rotation interceptor
  client.interceptors.request.use((reqConfig) => {
    reqConfig.headers['User-Agent'] = userAgentRotation.getNext()
    return reqConfig
  })

  return client
}

/**
 * Get the default HTTP client (singleton).
 */
export function getDefaultHttpClient(): AxiosInstance {
  if (!defaultClient) {
    defaultClient = createHttpClient()
  }
  return defaultClient
}

/**
 * Reset the default client (useful for testing).
 */
export function resetDefaultHttpClient(): void {
  defaultClient = null
}
