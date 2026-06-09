# TASK-06-resilience-layer: Add Cross-Cutting Resilience Layer (Circuit Breaker, Quotas, Backoff)

## Depends on
- [TASK-05-migrate-providers-to-registry](./TASK-05-migrate-providers-to-registry.md) — requires providers migrated to registry (so resilience wraps the final provider architecture)

## Agent
Senior Backend

## Description
Add a cross-cutting resilience layer to protect JobFindr from cascading provider failures. This includes a circuit breaker per provider, per-provider request quotas (token bucket for rate limiting), and configurable exponential backoff.

Per the recommendations, this resilience should be integrated at the provider base class level (`BaseProvider`), not per-provider, ensuring all providers automatically benefit.

## Technical Details

### Files to create

- `apps/backend/src/modules/providers/services/resilience/circuit-breaker.ts` — Circuit breaker implementation
- `apps/backend/src/modules/providers/services/resilience/quota-manager.ts` — Token bucket quota manager
- `apps/backend/src/modules/providers/services/resilience/backoff-config.ts` — Exponential backoff configuration
- `apps/backend/src/modules/providers/services/resilience/circuit-breaker.test.ts` — Circuit breaker unit tests
- `apps/backend/src/modules/providers/services/resilience/quota-manager.test.ts` — Quota manager unit tests

### Files to modify

- `apps/backend/src/modules/providers/domain/base-provider.ts` — Integrate circuit breaker into `executeWithInstrumentation()`
- `apps/backend/src/modules/providers/services/provider-engine.ts` — Check quotas before executing providers
- `apps/backend/src/config/env.ts` — Add resilience configuration env vars
- `apps/backend/src/modules/providers/services/retry-system.ts` — Update retry with configurable exponential backoff

### 1. Circuit Breaker

**State machine**:
```
CLOSED (normal) → on failure threshold exceeded → OPEN (rejecting)
OPEN → after timeout → HALF_OPEN (trial) → on success → CLOSED
                                        → on failure → OPEN
```

```typescript
type CircuitState = 'closed' | 'open' | 'half-open'

class CircuitBreaker {
  constructor(private config: CircuitBreakerConfig)

  // Called before executing a request
  async allowRequest(): Promise<boolean>

  // Called after successful request
  onSuccess(): void

  // Called after failed request
  onFailure(): void

  // Get current state
  getState(): CircuitState

  // Get stats
  getStats(): { state: CircuitState; failureCount: number; successCount: number; lastFailureAt?: string }
}

type CircuitBreakerConfig = {
  name: string                    // Provider name
  failureThreshold: number        // Default: 5
  successThreshold: number        // Default: 2 (for half-open → closed)
  timeoutMs: number               // Default: 30000 (30s open → half-open)
  halfOpenMaxRequests: number     // Default: 1
}
```

**Integration with BaseProvider**:

Update `executeWithInstrumentation()` in `base-provider.ts`:
```typescript
protected async executeWithInstrumentation<T>(
  call: () => Promise<T>,
  input: ValidatedSearchInput
): Promise<T | []> {
  // 1. Check circuit breaker
  const allowed = await this.circuitBreaker.allowRequest()
  if (!allowed) {
    this.logWarn('Circuit breaker open, skipping request', { provider: this.name })
    return []  // fail open (graceful degradation)
  }

  // 2. Execute with retry
  try {
    const result = await call()
    this.circuitBreaker.onSuccess()
    return result
  } catch (error) {
    this.circuitBreaker.onFailure()
    throw error
  }
}
```

### 2. Per-Provider Quotas (Token Bucket)

```typescript
class QuotaManager {
  constructor(private configs: Record<string, QuotaConfig>)

  // Check if provider has available quota
  async tryAcquire(provider: string): Promise<boolean>

  // Get current quota state
  getQuotaState(provider: string): { available: number; maxPerMinute: number; concurrent: number }

  // Reset quota for a provider
  resetQuota(provider: string): void
}

type QuotaConfig = {
  maxPerMinute: number    // Default: 30
  maxConcurrent: number   // Default: 5
  refillRate: number      // Tokens per second
}
```

**Integration with ProviderEngine**:

In `provider-engine.ts`, before calling each provider's `search()`:
```typescript
// Check quota before executing
const hasQuota = await quotaManager.tryAcquire(provider.name)
if (!hasQuota) {
  logger.warn(`Provider ${provider.name} quota exceeded, skipping`)
  return { providerName: provider.name, error: 'QUOTA_EXCEEDED', jobs: [] }
}
```

### 3. Exponential Backoff Configuration

Update the existing `retry-system.ts` to use configurable parameters:

```typescript
type BackoffConfig = {
  baseDelayMs: number       // Default: 1000
  maxDelayMs: number        // Default: 30000
  maxRetries: number        // Default: 3
  jitter: boolean           // Default: true
  jitterFactor: number      // Default: 0.3 (30% jitter)
  multiplier: number        // Default: 2 (exponential factor)
}
```

**Per-provider overrides** via env.ts:
```typescript
RETRY_BASE_DELAY_MS: getEnvInt('RETRY_BASE_DELAY_MS', 1000),
RETRY_MAX_DELAY_MS: getEnvInt('RETRY_MAX_DELAY_MS', 30000),
RETRY_MAX_RETRIES: getEnvInt('RETRY_MAX_RETRIES', 3),
RETRY_JITTER_ENABLED: getEnv('RETRY_JITTER_ENABLED', 'true') === 'true',

GREENHOUSE_RETRY_MAX_RETRIES: getEnvInt('GREENHOUSE_RETRY_MAX_RETRIES', 3),
GUPY_RETRY_MAX_RETRIES: getEnvInt('GUPY_RETRY_MAX_RETRIES', 5),
```

### Env vars to add

```typescript
// Circuit Breaker defaults
CIRCUIT_BREAKER_FAILURE_THRESHOLD: getEnvInt('CIRCUIT_BREAKER_FAILURE_THRESHOLD', 5),
CIRCUIT_BREAKER_SUCCESS_THRESHOLD: getEnvInt('CIRCUIT_BREAKER_SUCCESS_THRESHOLD', 2),
CIRCUIT_BREAKER_TIMEOUT_MS: getEnvInt('CIRCUIT_BREAKER_TIMEOUT_MS', 30000),

// Per-provider circuit breaker overrides
GREENHOUSE_CIRCUIT_BREAKER_TIMEOUT_MS: getEnvInt('GREENHOUSE_CIRCUIT_BREAKER_TIMEOUT_MS', 60000),
ASHBY_CIRCUIT_BREAKER_TIMEOUT_MS: getEnvInt('ASHBY_CIRCUIT_BREAKER_TIMEOUT_MS', 30000),
LEVER_CIRCUIT_BREAKER_TIMEOUT_MS: getEnvInt('LEVER_CIRCUIT_BREAKER_TIMEOUT_MS', 30000),
WORKDAY_CIRCUIT_BREAKER_TIMEOUT_MS: getEnvInt('WORKDAY_CIRCUIT_BREAKER_TIMEOUT_MS', 45000),
GUPY_CIRCUIT_BREAKER_TIMEOUT_MS: getEnvInt('GUPY_CIRCUIT_BREAKER_TIMEOUT_MS', 30000),

// Per-provider quotas
GREENHOUSE_QUOTA_PER_MINUTE: getEnvInt('GREENHOUSE_QUOTA_PER_MINUTE', 30),
GREENHOUSE_QUOTA_CONCURRENT: getEnvInt('GREENHOUSE_QUOTA_CONCURRENT', 5),
GUPY_QUOTA_PER_MINUTE: getEnvInt('GUPY_QUOTA_PER_MINUTE', 30),
GUPY_QUOTA_CONCURRENT: getEnvInt('GUPY_QUOTA_CONCURRENT', 3),
WORKDAY_QUOTA_PER_MINUTE: getEnvInt('WORKDAY_QUOTA_PER_MINUTE', 20),
WORKDAY_QUOTA_CONCURRENT: getEnvInt('WORKDAY_QUOTA_CONCURRENT', 3),
```

## Acceptance Criteria

- [ ] Circuit breaker per provider with 3 states (closed/open/half-open)
- [ ] Configurable failure threshold, success threshold, timeout
- [ ] Token bucket quota manager with per-minute and concurrent limits
- [ ] Exponential backoff with configurable base/max/jitter/multiplier
- [ ] Circuit breaker integrated into `BaseProvider.executeWithInstrumentation()`
- [ ] Quota check integrated into `provider-engine.ts` before provider execution
- [ ] All resilience configs available via `env.ts` with per-provider overrides
- [ ] Graceful degradation when circuit breaker open (returns empty, doesn't crash)
- [ ] Graceful degradation when quota exceeded (skips provider, logs warning)
- [ ] Comprehensive unit tests

## Implementation Approach

1. **Implement CircuitBreaker class** — State machine with configurable thresholds and timeout
2. **Implement QuotaManager class** — Token bucket algorithm with concurrent request tracking
3. **Implement backoff config** — Update `retry-system.ts` to accept and use configurable BackoffConfig; add jitter to delay formula
4. **Integrate circuit breaker** — In `base-provider.ts`, add optional `CircuitBreaker` field. Update `executeWithInstrumentation()` to check before executing. The circuit breaker is injected via constructor or factory.
5. **Integrate quotas** — In `provider-engine.ts`, before running a provider, check `quotaManager.tryAcquire()`. If denied, return `QUOTA_EXCEEDED` result.
6. **Wire up in provider-loader** — Create `CircuitBreaker` and `QuotaManager` instances with per-provider configs, inject into providers
7. **Add env vars** — Add all resilience env vars to `env.ts`
8. **Write unit tests** — Test each component independently

## Testing

- **Circuit breaker tests** (`circuit-breaker.test.ts`):
  - Initial state is CLOSED
  - After failureThreshold failures → OPEN
  - OPEN state rejects requests (allowRequest returns false)
  - After timeoutMs → HALF_OPEN
  - HALF_OPEN + success → CLOSED
  - HALF_OPEN + failure → OPEN
  - Config override per instance
  - Stats tracking accuracy

- **Quota manager tests** (`quota-manager.test.ts`):
  - Token bucket refills over time
  - Max concurrent requests limit works
  - `tryAcquire` returns false when quota exhausted
  - Different configs per provider
  - Reset resets quota state

- **Integration tests**:
  - Provider with circuit breaker: open state returns empty gracefully
  - Provider with quota exhausted: engine skips provider
  - Retry with exponential backoff + jitter (verify delay grows)

## References

- [Strategic Plan - Phase 4](../index.md) (lines 40-45)
- [Strategic Plan - Resilience decisions](../index.md) (lines 86-90)
- [Recommendations - Resilience & Reliability](../recommendations.md) (lines 58-63)
- [Recommendations - Tech Lead Guidance](../recommendations.md) (lines 92-97, point 5)
- [Feasibility Analysis - Rate Limit Analysis](../feasibility.md) (lines 50-56)
- Code: `apps/backend/src/modules/providers/domain/base-provider.ts` — Add circuit breaker to `executeWithInstrumentation()`
- Code: `apps/backend/src/modules/providers/services/provider-engine.ts` — Add quota check
- Code: `apps/backend/src/modules/providers/services/retry-system.ts` — Update with configurable backoff
- Code: `apps/backend/src/config/env.ts` — Add all resilience env vars
