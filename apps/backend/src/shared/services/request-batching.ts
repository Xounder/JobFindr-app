/**
 * Request batching for providers.
 * TASK-089: Create Request Batching
 *
 * Batches identical requests to the same provider within a time window.
 * For MVP, this is a simple deduplication layer.
 */

type BatchEntry<T> = {
  key: string
  resolve: (value: T) => void
  reject: (error: Error) => void
  timestamp: number
}

export class RequestBatcher<T = unknown> {
  private batches: Map<string, BatchEntry<T>[]> = new Map()
  private readonly windowMs: number

  constructor(windowMs: number = 200) {
    this.windowMs = windowMs
  }

  /**
   * Get or create a batch for the given key.
   * Returns a promise that resolves with the batch result.
   * The first caller triggers the execution; subsequent callers within the window join the batch.
   */
  async enqueue(
    key: string,
    executor: () => Promise<T>
  ): Promise<T> {
    const existing = this.batches.get(key)

    if (existing && existing.length > 0) {
      // Join existing batch
      return new Promise<T>((resolve, reject) => {
        existing.push({
          key,
          resolve,
          reject,
          timestamp: Date.now(),
        })
      })
    }

    // Create new batch
    const entries: BatchEntry<T>[] = []
    this.batches.set(key, entries)

    const promise = new Promise<T>((resolve, reject) => {
      entries.push({
        key,
        resolve,
        reject,
        timestamp: Date.now(),
      })
    })

    // Execute after a short delay to collect batch entries
    setTimeout(async () => {
      this.batches.delete(key)
      try {
        const result = await executor()
        for (const entry of entries) {
          entry.resolve(result)
        }
      } catch (error) {
        for (const entry of entries) {
          entry.reject(error instanceof Error ? error : new Error(String(error)))
        }
      }
    }, this.windowMs)

    return promise
  }

  clear(): void {
    this.batches.clear()
  }
}
