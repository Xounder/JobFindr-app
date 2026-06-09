export type BackoffConfig = {
  baseDelayMs: number
  maxDelayMs: number
  maxRetries: number
  jitter: boolean
  jitterFactor: number
  multiplier: number
}

export const defaultBackoffConfig: BackoffConfig = {
  baseDelayMs: 1000,
  maxDelayMs: 30_000,
  maxRetries: 3,
  jitter: true,
  jitterFactor: 0.3,
  multiplier: 2,
}
