# 05 — Paginação com Cache de Resultado Agregado

## Problema

A paginação atual é ineficiente: todos os providers são consultados, todos os resultados são processados (matchmaking, trust, ranking), e só então os 20 itens da página são extraídos. Cada mudança de página refaz o processo inteiro.

## Causa

A arquitetura stateless (sem DB) impede paginação real por offset nos providers, porque o ranking cross-provider requer todos os candidatos para ordenar corretamente.

## Solução

Implementar um **cache de resultado agregado** que armazena o resultado completo pós-processamento. A primeira busca com uma combinação de query+filtros popula o cache; mudanças de página servem do cache sem re-fetch dos providers.

### Arquivos

**Novo: `apps/backend/src/cache/aggregated-cache.ts`**

```typescript
import { InMemoryCache } from './in-memory-cache.ts'
import type { NormalizedJob } from '@jobfindr/types'

type CacheKey = string

// Cache key: hash dos parâmetros de busca (excluindo page/pageSize)
function buildCacheKey(input: {
  q: string
  skills: string[]
  seniority: string[]
  remoteMode: string[]
  companies: string[]
  excludedCompanies: string[]
  sources: string[]
  minTrustScore: number
  includeHidden: boolean
  sort: string
  postedAfter: string | undefined
  countries: string[]
}): string {
  return JSON.stringify(input)
}

export class AggregatedCache {
  private cache = new InMemoryCache<NormalizedJob[]>({
    ttlMs: 120_000, // 2 minutos
    maxEntries: 50,
  })

  get(searchInput: Parameters<typeof buildCacheKey>[0]): NormalizedJob[] | undefined {
    return this.cache.get(buildCacheKey(searchInput))
  }

  set(searchInput: Parameters<typeof buildCacheKey>[0], jobs: NormalizedJob[]): void {
    this.cache.set(buildCacheKey(searchInput), jobs)
  }

  invalidate(searchInput: Parameters<typeof buildCacheKey>[0]): void {
    this.cache.delete(buildCacheKey(searchInput))
  }
}
```

**`apps/backend/src/modules/search/services/aggregation-service.ts`**

### Fluxo modificado

```
Agregador:
  1. Construir chave de cache AGGREGATED (query + filtros, sem page)
  2. Se cache hit → retornar jobs do cache, aplicar paginateJobs()
  3. Se cache miss:
     a. Fetch de todos providers (com cache de providers existente)
     b. Aplicar company filters
     c. Aplicar remoteMode/seniority/postedAfter filters (P2)
     d. Aplicar matchmaking
     e. Aplicar trust
     f. Aplicar ranking
     g. Salvar resultado completo no AggregatedCache
     h. Aplicar paginateJobs()
     i. Retornar
```

### Cache de providers existente

O `ProviderCacheLayer` (TTL 5min) continua como primeira camada. Quando o cache agregado expira (2min), os providers individuais podem ainda estar em cache.

### TTLs

| Cache | TTL | Finalidade |
|-------|-----|------------|
| ProviderCacheLayer | 5 min | Evita refetch dos mesmos providers |
| AggregatedCache | 2 min | Evita reprocessamento ao mudar de página |
| TrustCacheLayer | 24h | Trust scores por company |

### Testes

- Testar que mudar de página não chama providers (apenas cache hit)
- Testar que mudar filtro invalida cache e refaz busca
- Testar expiração do cache
- Testar concorrência (múltiplas páginas simultâneas)
