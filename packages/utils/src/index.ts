/**
 * Shared utilities for JobFindr.
 * Generic helper functions used across the backend.
 */

/**
 * Creates a unique job ID from source provider and external ID.
 */
export function createJobId(source: string, externalId: string): string {
  return `${source}:${externalId}`
}

/**
 * Safely parse JSON without throwing.
 */
export function safeJsonParse<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text) as T
  } catch {
    return fallback
  }
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Sleep for a given duration (ms).
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Simple hash function for strings (djb2).
 */
export function hashString(str: string): string {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xffffffff
  }
  return hash.toString(36)
}

/**
 * Truncate a string to a max length, appending ellipsis if needed.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}

/**
 * Remove duplicate items from an array (simple primitive version).
 */
export function unique<T>(items: T[]): T[] {
  return [...new Set(items)]
}

/**
 * Parse a comma-separated string into a trimmed array.
 */
export function parseCommaList(value: string | undefined): string[] {
  if (!value || value.trim().length === 0) return []
  return value
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0)
}

/**
 * Current timestamp in ISO-8601 format.
 */
export function nowISO(): string {
  return new Date().toISOString()
}
