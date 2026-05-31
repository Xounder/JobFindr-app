/**
 * Global error handler for Fastify.
 * TASK-095: Create Global Error Handler
 */
import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { logger } from '../logger/logger.ts'
import { errorMonitor } from '../metrics/error-monitoring.ts'
import { env } from '../../config/env.ts'

export type AppErrorCode =
  | 'VALIDATION_ERROR'
  | 'PROVIDER_TIMEOUT'
  | 'PROVIDER_ERROR'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_ERROR'
  | 'NOT_FOUND'
  | 'BAD_REQUEST'
  | 'SPAM_DETECTED'

export class AppError extends Error {
  readonly code: AppErrorCode
  readonly statusCode: number
  readonly context?: Record<string, unknown>

  constructor(code: AppErrorCode, message: string, statusCode: number = 500, context?: Record<string, unknown>) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.context = context
  }
}

export function createGlobalErrorHandler() {
  return function globalErrorHandler(
    error: FastifyError | AppError | Error,
    _request: FastifyRequest,
    reply: FastifyReply
  ): void {
    if (error instanceof AppError) {
      errorMonitor.recordError('global', error.code, error.message, error.context)

      reply.status(error.statusCode).send({
        success: false as const,
        error: {
          code: error.code,
          message: error.message,
        },
      })
      return
    }

    // Fastify validation errors
    if ('validation' in error && error.validation) {
      reply.status(400).send({
        success: false as const,
        error: {
          code: 'VALIDATION_ERROR' as AppErrorCode,
          message: error.message,
        },
      })
      return
    }

    // Rate limit errors
    if ('statusCode' in error && error.statusCode === 429) {
      reply.status(429).send({
        success: false as const,
        error: {
          code: 'RATE_LIMIT_EXCEEDED' as AppErrorCode,
          message: 'Too many requests. Please try again later.',
        },
      })
      return
    }

    // Unknown errors
    errorMonitor.recordError('global', 'INTERNAL_ERROR', error.message ?? 'Unknown error')

    logger.error('Unhandled error', {
      module: 'error-handler',
      error: error.message,
      data: env.isDev ? { stack: error.stack } : undefined,
    })

    reply.status(500).send({
      success: false as const,
      error: {
        code: 'INTERNAL_ERROR' as AppErrorCode,
        message: env.isDev ? error.message : 'An unexpected error occurred',
      },
    })
  }
}
