# Mudança 4: Toggle de Preferência — Ordenar por Trust vs Match

## Arquitetura Atual

- **Backend**: `ranking-engine.ts` não tem parâmetro de sort — sempre ordena por composite score
- **Aggregation-service**: ignora `input.sort` (mesmo sendo validado dos query params)
- **Types**: `@jobfindr/types` tem `SearchSortOption` com `'relevance' | 'date' | 'salary_high' | 'salary_low'` — sem trust/match
- **Frontend**: zero infraestrutura de sort (types, store, API, UI)

## O Gap

| Camada | `sort` existe? | Detalhes |
|--------|---------------|----------|
| Types (`SearchSortOption`) | Parcial | Tem `relevance, date, salary_high, salary_low` — falta `trust, match` |
| Validação backend | Parcial | Parseia `sort` do query, default `relevance`, valida — mas ignorado |
| Aggregation service | Não | `input.sort` é ignorado, não passa para `rankJobs` |
| Ranking engine | Não | Sem parâmetro `sortBy`; sempre composite score |
| Frontend types/store/API | Não | Nenhum campo de sort |

## Requisito

- Usuário pode escolher entre ordenar por **trust score** (default) ou **matching %**
- Default (sem preferência) = trust-first → match-second (Change 2)
- Quando "match" selecionado → matchScore desc → trustScore desc → compositeScore desc
- Toggle/selector no painel de filtros (sidebar) ou próximo à barra de busca

## Abordagem Recomendada: Full Stack End-to-End

### Backend

1. **`@jobfindr/types`** — Adicionar ao `SearchSortOption`:
```typescript
export type SearchSortOption =
  | 'relevance' | 'date' | 'salary_high' | 'salary_low'
  | 'trust' | 'match'   // NOVOS
```

2. **`ranking-engine.ts`** — Aceitar `sortBy: 'trust' | 'match'` no `RankingOptions`:
```typescript
export type RankingOptions = {
  weights?: Partial<RankingWeights>
  userSkills?: string[]
  sortBy?: 'trust' | 'match'   // default 'trust'
}
```

3. **`aggregation-service.ts`** — Passar `input.sort` para `rankJobs`:
```typescript
const sortBy = input.sort === 'match' ? 'match' : 'trust'
const { jobs: rankedJobs } = rankJobs(allJobs, {
  userSkills: userSkills?.normalized,
  sortBy,
})
```

### Frontend

4. **Types (`SearchParams`, `FiltersState`)** — Adicionar `sort: 'trust' | 'match'`
5. **Store (Zustand)** — Adicionar `sort` + setter, default `'trust'`, persistido
6. **API client** — Incluir `sort` nos query params
7. **Hook `useJobSearch`** — Passar `sort` da store nos params
8. **UI (`SortToggle.tsx`)** — Segmented control ou dropdown com "Trust Score" / "Match %"

## Comportamento

| Parâmetro | Ordenação |
|-----------|-----------|
| `sort=trust` (default) | trustScore desc → matchScore desc → composite desc |
| `sort=match` | matchScore desc → trustScore desc → composite desc |
| `sort=relevance` | Composite score (preservado para backward compat) |

## Arquivos Afetados

| Ação | Arquivo |
|------|---------|
| MODIFICAR | `packages/types/src/search-dto.ts` |
| MODIFICAR | `packages/types/src/ranking.ts` |
| MODIFICAR | `apps/backend/src/modules/ranking/services/ranking-engine.ts` |
| MODIFICAR | `apps/backend/src/modules/search/services/aggregation-service.ts` |
| MODIFICAR | `apps/frontend/src/types/index.ts` |
| MODIFICAR | `apps/frontend/src/store/searchStore.ts` |
| MODIFICAR | `apps/frontend/src/services/api.ts` |
| MODIFICAR | `apps/frontend/src/hooks/useJobSearch.ts` |
| CRIAR | `apps/frontend/src/components/SortToggle.tsx` |
| CRIAR | `apps/frontend/src/components/SortToggle.test.tsx` |
| MODIFICAR | `apps/backend/.../ranking-engine.test.ts` |

## Riscos

- Colisão com valores `sort` existentes (`date`, `salary_high`) — `trust`/`match` são aditivos, sem conflito
- Cache obsoleto ao mudar preferência — TanStack Query key inclui `sort`, refetch automático
- Usuários confusos sobre o que "Trust" vs "Match" significa — adicionar tooltip explicativo
- Conflito com Change 2 (mesmo arquivo) — implementar Change 2 primeiro, depois Change 4
- Store schema migration (novo campo `sort` no localStorage) — Zustand persist aplica default automaticamente
