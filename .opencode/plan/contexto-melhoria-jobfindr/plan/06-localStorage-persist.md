# 06 — Persistência de Filtros no localStorage

## Problema

O estado dos filtros é perdido ao recarregar a página. Não há uso de `localStorage` ou `sessionStorage`.

## Solução

Adicionar middleware `persist` do Zustand para salvar filtros no `localStorage`.

### Arquivo

**`apps/frontend/src/store/searchStore.ts`**

### Mudanças

1. Importar `persist` do `zustand/middleware`
2. Envolver o store creator com `persist()`
3. Configurar:
   - `name`: `"jobfindr-search-filters"`
   - `partialize`: persistir apenas os campos de filtro (excluir `page` e `pageSize`)
   - `version`: 1 (para migrações futuras)

```typescript
import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { FiltersState } from "@/types"

const initialState: FiltersState = {
  query: "",
  skills: [],
  seniority: "",
  companies: [],
  excludeCompanies: [],
  trustMin: 0,
}

export const useSearchStore = create<SearchStore>()(
  persist(
    (set) => ({
      ...initialState,
      page: 1,
      pageSize: 20,
      // ... setters ...
      resetFilters: () => set({ ...initialState, page: 1 }),
    }),
    {
      name: "jobfindr-search-filters",
      partialize: (state) => ({
        query: state.query,
        skills: state.skills,
        seniority: state.seniority,
        companies: state.companies,
        excludeCompanies: state.excludeCompanies,
        trustMin: state.trustMin,
        // NOTA: page NÃO é persistido — sempre volta pra página 1
      }),
    },
  ),
)
```

### Comportamento

| Ação | Resultado |
|------|-----------|
| Preencher filtros, recarregar página | Filtros restaurados, página = 1 |
| Resetar filtros | Limpa localStorage + estado |
| Múltiplas abas | Cada aba tem seu próprio estado (ou sincronizado via storage event) |

### Observação

O Zustand persist usa `JSON.parse/stringify`, seguro para os tipos usados (string, string[], number).

### Testes

- Verificar que filtros persistem após F5
- Verificar que página sempre volta pra 1 no refresh
- Verificar que `resetFilters` limpa localStorage
