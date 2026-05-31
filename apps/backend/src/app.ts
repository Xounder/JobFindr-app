/**
 * Fastify application setup.
 * TASK-003: Setup Backend Application
 */
import Fastify from 'fastify'
import cors from '@fastify/cors'
import { env } from './config/env.ts'
import { logger } from './shared/logger/logger.ts'
import { errorMonitor } from './shared/metrics/error-monitoring.ts'
import { createGlobalErrorHandler } from './shared/middleware/error-handler.ts'
import { registerSecureHeaders } from './shared/middleware/secure-headers.ts'
import { registerRateLimiter } from './shared/middleware/rate-limiter.ts'
import { registerValidationMiddleware } from './shared/middleware/validation.ts'
import { registerSanitizationMiddleware } from './shared/middleware/sanitization.ts'
import { registerAntiSpamMiddleware } from './shared/middleware/anti-spam.ts'
import { registerSearchRoute } from './modules/search/controllers/search-controller.ts'
import { ProviderLoader } from './modules/providers/services/provider-loader.ts'

export async function buildApp() {
  const app = Fastify({
    logger: false, // We use our own logger
    bodyLimit: 1024, // 1KB max body (we're stateless, don't need large bodies)
  })

  // ─── Error Handler ──────────────────────────────────────
  app.setErrorHandler(createGlobalErrorHandler())

  // ─── CORS ───────────────────────────────────────────────
  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    methods: ['GET'],
    allowedHeaders: [],
  })

  // ─── Security Headers ───────────────────────────────────
  await registerSecureHeaders(app)

  // ─── Rate Limiting ──────────────────────────────────────
  await registerRateLimiter(app)

  // ─── Validation & Sanitization ──────────────────────────
  registerValidationMiddleware(app)
  registerSanitizationMiddleware(app)
  registerAntiSpamMiddleware(app)

  // ─── Load Providers ─────────────────────────────────────
  try {
    const loader = new ProviderLoader()
    await loader.loadAll()
    logger.info(`Loaded ${loader.constructor.name}`, {
      module: 'app',
    })
  } catch (error) {
    errorMonitor.recordError('startup', 'PROVIDER_LOAD_FAILURE', 'Failed to load providers')
    logger.error('Failed to load providers', {
      module: 'app',
      error: error instanceof Error ? error.message : 'Unknown',
    })
  }

  // ─── Routes ─────────────────────────────────────────────
  // Health check (TASK-100)
  app.get('/health', async (_request, _reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime(),
      providers: {
        // Provider stats would go here
        count: 0,
      },
    }
  })

  // Job search endpoint
  registerSearchRoute(app)

  // Provider status endpoint
  const { registerProviderStatusRoute } = await import('./modules/providers/services/provider-status-route.ts')
  registerProviderStatusRoute(app)

  // Job suggestions endpoint
  const { registerSuggestionsRoute } = await import('./modules/suggestions/suggestions-controller.ts')
  registerSuggestionsRoute(app)

  // 404 handler
  app.setNotFoundHandler((_request, reply) => {
    reply.status(404).send({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Route not found',
      },
    })
  })

  return app
}

export async function startServer() {
  try {
    const app = await buildApp()
    const address = await app.listen({
      port: env.PORT,
      host: env.HOST,
    })
    logger.info(`Server started`, {
      module: 'app',
      data: { address, environment: env.NODE_ENV },
    })
    return app
  } catch (error) {
    errorMonitor.recordError('startup', 'STARTUP_FAILURE', 'Failed to start server')
    logger.error('Failed to start server', {
      module: 'app',
      error: error instanceof Error ? error.message : 'Unknown',
    })
    process.exit(1)
  }
}
