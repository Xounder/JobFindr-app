/**
 * Centralized logger system.
 * TASK-098: Create Logger System
 *
 * For MVP, uses console with structured formatting.
 * No personal data is ever logged.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export type LogEntry = {
  level: LogLevel
  message: string
  timestamp: string
  module?: string
  data?: Record<string, unknown>
  error?: string
}

function formatLogEntry(entry: LogEntry): string {
  const parts: string[] = [
    `[${entry.timestamp}]`,
    `[${entry.level.toUpperCase()}]`,
  ]

  if (entry.module) {
    parts.push(`[${entry.module}]`)
  }

  parts.push(entry.message)

  if (entry.data && Object.keys(entry.data).length > 0) {
    parts.push(JSON.stringify(sanitizeData(entry.data)))
  }

  if (entry.error) {
    parts.push(`error=${entry.error}`)
  }

  return parts.join(' ')
}

/**
 * Strip any potentially personal data from log entries.
 */
function sanitizeData(data: Record<string, unknown>): Record<string, unknown> {
  const blockedKeys = ['resume', 'email', 'phone', 'address', 'name', 'user']
  const sanitized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    if (blockedKeys.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]'
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

function createEntry(
  level: LogLevel,
  message: string,
  options?: { module?: string; data?: Record<string, unknown>; error?: string }
): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    module: options?.module,
    data: options?.data,
    error: options?.error,
  }
}

export const logger = {
  debug(
    message: string,
    options?: { module?: string; data?: Record<string, unknown> }
  ): void {
    const entry = createEntry('debug', message, options)
    if (process.env.NODE_ENV !== 'production') {
      console.debug(formatLogEntry(entry))
    }
  },

  info(
    message: string,
    options?: { module?: string; data?: Record<string, unknown> }
  ): void {
    const entry = createEntry('info', message, options)
    console.info(formatLogEntry(entry))
  },

  warn(
    message: string,
    options?: { module?: string; data?: Record<string, unknown>; error?: string }
  ): void {
    const entry = createEntry('warn', message, options)
    console.warn(formatLogEntry(entry))
  },

  error(
    message: string,
    options?: { module?: string; data?: Record<string, unknown>; error?: string }
  ): void {
    const entry = createEntry('error', message, options)
    console.error(formatLogEntry(entry))
  },
}
