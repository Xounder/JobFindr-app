/**
 * Rate limiter middleware.
 * TASK-093: Create Rate Limiter
 */
import type { FastifyInstance } from 'fastify'
import { env } from '../../config/env.ts'

/**
 * Register rate limiting on the Fastify instance.
 * Uses @fastify/rate-limit when available.
 */
export async function registerRateLimiter(
  app: FastifyInstance
): Promise<void> {
  try {
    const rateLimitModule = await import('@fastify/rate-limit')
    await app.register(rateLimitModule.default ?? rateLimitModule, {
      max: env.RATE_LIMIT_MAX,
      timeWindow: env.RATE_LIMIT_WINDOW_MS,
      errorResponseBuilder: () => {
        return {
          success: false as const,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again later.',
          },
        }
      },
    })
  } catch {
    // Fallback: simple in-memory rate limiter
    const requestCounts = new Map<string, { count: number; resetAt: number }>()

    app.addHook('onRequest', async (request, reply) => {
      const ip = request.ip
      const now = Date.now()
      const entry = requestCounts.get(ip)

      if (!entry || now > entry.resetAt) {
        requestCounts.set(ip, { count: 1, resetAt: now + env.RATE_LIMIT_WINDOW_MS })
        return
      }

      entry.count++
      if (entry.count > env.RATE_LIMIT_MAX) {
        reply.status(429).send({
          success: false as const,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again later.',
          },
        })
        return
      }
    })

    // Periodic cleanup
    setInterval(() => {
      const now = Date.now()
      for (const [ip, entry] of requestCounts) {
        if (now > entry.resetAt) {
          requestCounts.delete(ip)
        }
      }
    }, 60_000).unref()
  }
}
