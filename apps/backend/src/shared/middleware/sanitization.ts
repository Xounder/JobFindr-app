/**
 * Input sanitization layer.
 * TASK-092: Create Sanitization Layer
 */
import type { FastifyInstance } from 'fastify'

/**
 * Sanitize a string by removing dangerous characters.
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets (XSS prevention)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '') // Remove control chars
    .trim()
    .slice(0, 500) // Max length
}

/**
 * Sanitize query parameters object.
 */
export function sanitizeQueryParams(
  params: Record<string, unknown>
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value)
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((v) =>
        typeof v === 'string' ? sanitizeString(v) : v
      )
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

/**
 * Registers a sanitization hook for all incoming requests.
 */
export function registerSanitizationMiddleware(app: FastifyInstance): void {
  app.addHook('preValidation', async (request, _reply) => {
    if (request.query) {
      request.query = sanitizeQueryParams(
        request.query as Record<string, unknown>
      ) as typeof request.query
    }
  })
}
