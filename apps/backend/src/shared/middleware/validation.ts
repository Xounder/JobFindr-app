/**
 * Request validation middleware.
 * TASK-091: Create Validation Middleware
 */
import type { FastifyInstance } from 'fastify'
import { AppError } from './error-handler.ts'

/**
 * Registers a pre-validation hook that checks for required headers/content types.
 */
export function registerValidationMiddleware(app: FastifyInstance): void {
  app.addHook('onRequest', async (request, _reply) => {
    // Only validate non-GET requests
    if (request.method === 'GET') return

    const contentType = request.headers['content-type']
    if (
      request.body &&
      contentType &&
      !contentType.includes('application/json')
    ) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Content-Type must be application/json',
        415
      )
    }
  })
}
