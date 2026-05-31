/**
 * Provider type classification.
 * TASK-116: Create ProviderType Classification System
 *
 * Defines the types of job providers based on how they fetch data.
 */
import type { ProviderType } from '@jobfindr/types'

export type { ProviderType }

/**
 * Check if a provider type supports HTTP methods.
 */
export function isHttpBased(type: ProviderType): boolean {
  return type === 'api' || type === 'json'
}

/**
 * Get display label for a provider type.
 */
export function getProviderTypeLabel(type: ProviderType): string {
  switch (type) {
    case 'api':
      return 'REST API'
    case 'json':
      return 'JSON Endpoint'
    case 'html':
      return 'HTML Scraping'
    case 'browser':
      return 'Browser Automation'
  }
}
