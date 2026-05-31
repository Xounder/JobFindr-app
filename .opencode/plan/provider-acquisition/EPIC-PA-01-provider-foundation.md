# EPIC-PA-01 — Provider Foundation

**Corresponds to:** PROVIDER_ACQUISITION_PLAN Phase 1
**Layer:** Backend
**MVP:** ✅ Yes

## Objective

Create the core infrastructure that allows providers to be added, replaced
and maintained independently. This is the foundation upon which all
providers are built.

## Deliverables

- Provider interface/contract (`JobProvider`)
- Provider registry (discoverable list of all providers)
- Provider execution engine (runs providers in parallel)
- Provider timeout manager (prevents slow providers from blocking)
- Retry system (transient failure recovery)
- Provider health monitoring (tracks success/failure rates)
- Result normalization pipeline

## Tasks

### Provider interface
- [ ] Define `JobProvider` interface with `search(params): Promise<NormalizedJob[]>`
- [ ] Define provider metadata types (name, version, rate limit info)
- [ ] Create `ProviderResult` type (jobs + errors + metadata)
- [ ] Document interface contract in code

### Provider registry
- [ ] Create `ProviderRegistry` class
- [ ] Implement `register(provider)`, `getAll()`, `getByName(name)`
- [ ] Support dynamic enable/disable of providers
- [ ] Create registry initialization on server startup

### Execution engine
- [ ] Create `ProviderEngine` that runs all providers in parallel
- [ ] Implement per-provider timeout (configurable, default 10s)
- [ ] Implement result aggregation (collect successes + errors)
- [ ] Ensure one provider failure never stops others
- [ ] Add execution metrics (per-provider duration, success/fail)

### Retry system
- [ ] Create retry wrapper with configurable attempts (default 2)
- [ ] Implement exponential backoff
- [ ] Only retry on transient errors (timeout, 5xx)
- [ ] Log retry attempts

### Health monitoring
- [ ] Track per-provider: success count, failure count, avg latency
- [ ] Expose health endpoint per provider
- [ ] Create provider status summary

### Normalization pipeline
- [ ] Create `Normalizer` function type: `(raw: unknown) => NormalizedJob`
- [ ] Implement field mapping system
- [ ] Handle missing fields gracefully
- [ ] Validate output against `NormalizedJob` schema

## Acceptance Criteria

- [ ] New provider can be added in < 50 lines of code (just implement interface + register)
- [ ] All providers execute in parallel
- [ ] One failing provider never blocks others
- [ ] Timeout kills slow providers after configured limit
- [ ] Retry recovers from transient failures
- [ ] Health monitoring exposes per-provider stats
- [ ] All jobs returned are valid `NormalizedJob` objects
- [ ] Tests cover: parallel execution, timeout, retry, single failure isolation
