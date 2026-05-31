# Impact Analysis

## Mudança 1: Your Skills no Header

| Camada | Impacto | Mudanças |
|--------|---------|----------|
| Frontend — Layout | Médio | Botão "Your Skills" + gerenciar estado do modal |
| Frontend — Components | Alto | Criar `UserSkillsModal`, modificar `FiltersPanel`, adaptar `UserSkillsInput` |
| Frontend — Pages | Baixo | `handleMoveToRequired` para suportar movimentação seletiva |
| Frontend — Store | Baixo | Sem novos estados (reusa `userSkills`, `userSeniority`, `setSkills`) |
| Backend | Nenhum | — |
| Types | Nenhum | — |
| Testes | Médio | Atualizar `UserSkillsInput.test`, criar `UserSkillsModal.test` |

## Mudança 2: Ordenação Trust-First

| Camada | Impacto | Mudanças |
|--------|---------|----------|
| Frontend | Nenhum | Apenas exibe dados pré-ordenados |
| Backend — Ranking | Médio | Sort comparator multi-key em `ranking-engine.ts` |
| Backend — Testes | Médio | Atualizar asserts de ordenação |
| Types | Nenhum | — |

## Mudança 3: Search Bar

| Camada | Impacto | Mudanças |
|--------|---------|----------|
| Frontend — SearchBar | Alto | Lógica de indicador visual + dropdown de sugestões |
| Frontend — Hooks | Baixo | Importar `useSuggestions` (já existe) |
| Frontend — Testes | Médio | Criar `SearchBar.test.tsx` |
| Backend | Nenhum | Endpoint `/jobs/suggestions` já existe |

## Mudança 4: Toggle Trust vs Match

| Camada | Impacto | Mudanças |
|--------|---------|----------|
| Types (shared) | Médio | Adicionar `'trust' | 'match'` ao `SearchSortOption` + `sortBy` no `RankingOptions` |
| Backend — Ranking | Médio | Aceitar `sortBy` no `rankJobs`, lógica condicional |
| Backend — Aggregation | Médio | Passar `sort` mapeado para `rankJobs` |
| Backend — Testes | Alto | Testes para `sortBy: 'trust'` e `sortBy: 'match'` |
| Frontend — Types | Baixo | Adicionar `sort` ao `SearchParams`/`FiltersState` |
| Frontend — Store | Baixo | Campo `sort` + setter, default `'trust'` |
| Frontend — API/Hook | Baixo | Serializar `sort` nos params |
| Frontend — UI | Médio | Criar `SortToggle.tsx` |
| Frontend — Testes | Médio | Testes do toggle + store |

## Total de Arquivos Afetados

| Mudança | Arquivos |
|---------|----------|
| 1: Your Skills header | ~6 |
| 2: Trust-first sort | ~2 |
| 3: Search bar | ~2 |
| 4: Sort toggle | ~11 |
| **Total** | **~21** |
