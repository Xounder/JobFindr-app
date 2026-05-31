/**
 * Secure headers middleware for Fastify.
 * TASK-094: Create Secure Headers Middleware
 *
 * Adds security-related HTTP headers to all responses.
 * Uses @fastify/helmet if available, otherwise manual headers.
 */
import type { FastifyInstance } from 'fastify'

/**
 * Register secure headers on the Fastify instance.
 * Uses @fastify/helmet when available, falls back to manual headers.
 */
export async function registerSecureHeaders(
  app: FastifyInstance
): Promise<void> {
  try {
    // Try to use @fastify/helmet
    const helmetModule = await import('@fastify/helmet')
    await app.register(helmetModule.default ?? helmetModule, {
      contentSecurityPolicy: false, // Disabled for MVP - API only
      crossOriginResourcePolicy: { policy: 'same-origin' },
      xXssProtection: true,
      xFrameOptions: { action: 'deny' },
      xContentTypeOptions: true,
      referrerPolicy: { policy: 'no-referrer' },
      hidePoweredBy: true,
    })
  } catch {
    // Fallback: manual secure headers via onSend hook
    app.addHook('onSend', async (_request, reply) => {
      void reply
        .header('X-Content-Type-Options', 'nosniff')
        .header('X-Frame-Options', 'DENY')
        .header('Referrer-Policy', 'no-referrer')
        .header('X-XSS-Protection', '1; mode=block')
        .header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
        .header('X-Powered-By', '')
    })
  }
}
