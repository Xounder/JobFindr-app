/**
 * Request queue for managing concurrent provider requests.
 * TASK-032: Create Request Queue
 *
 * Ensures we don't exceed concurrency limits per provider.
 */

type QueueTask<T> = {
  execute: () => Promise<T>
  resolve: (value: T) => void
  reject: (error: Error) => void
}

export class RequestQueue {
  private queue: QueueTask<unknown>[] = []
  private activeCount = 0
  private readonly maxConcurrency: number

  constructor(maxConcurrency: number = 2) {
    this.maxConcurrency = maxConcurrency
  }

  /**
   * Add a task to the queue.
   */
  async enqueue<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        execute: fn as () => Promise<unknown>,
        resolve: resolve as (value: unknown) => void,
        reject,
      })
      this.processNext()
    })
  }

  /**
   * Process the next task in the queue if concurrency allows.
   */
  private processNext(): void {
    if (this.activeCount >= this.maxConcurrency) return
    if (this.queue.length === 0) return

    const task = this.queue.shift()
    if (!task) return

    this.activeCount++

    task
      .execute()
      .then((result) => {
        task.resolve(result)
      })
      .catch((error) => {
        task.reject(error instanceof Error ? error : new Error(String(error)))
      })
      .finally(() => {
        this.activeCount--
        this.processNext()
      })
  }

  get pendingCount(): number {
    return this.queue.length
  }

  get activeRequests(): number {
    return this.activeCount
  }

  clear(): void {
    this.queue = []
  }
}

/**
 * Per-provider request queues.
 */
export const providerQueues: Record<string, RequestQueue> = {
  gupy: new RequestQueue(2),
  greenhouse: new RequestQueue(3),
  ashby: new RequestQueue(2),
  lever: new RequestQueue(2),
  workday: new RequestQueue(1),
}
