# 08 — Debounce nos Filtros

## Problema

Atualmente apenas a query de busca tem debounce (`useDebounce(localQuery, 400)` em `HomePage.tsx:34`). Os outros filtros (skills, seniority, companies, trustMin) disparam requisição imediatamente ao serem alterados, o que pode causar múltiplas requisições consecutivas quando o usuário interage rapidamente.

## Solução

Aplicar debounce nas mudanças de filtro antes de sincronizar com o Zustand store.

### Abordagem

Em vez de debounce individual em cada filtro, usar um **debounce genérico no trigger de refetch** — ou seja, atrasar a sincronização de qualquer filtro para o store.

### Arquivo

**`apps/frontend/src/pages/HomePage.tsx`**

Criar um estado local temporário para os filtros e sincronizar com debounce:

```typescript
// Estado local temporário para debounce
const [localFilters, setLocalFilters] = useState({
  skills, seniority, companies, excludeCompanies, trustMin,
})

const debouncedFilters = useDebounce(localFilters, 300)

// Sincronizar com store quando debounce estabilizar
useEffect(() => {
  setSkills(debouncedFilters.skills)
  setSeniority(debouncedFilters.seniority)
  setCompanies(debouncedFilters.companies)
  setExcludeCompanies(debouncedFilters.excludeCompanies)
  setTrustMin(debouncedFilters.trustMin)
}, [debouncedFilters])
```

**Alternativa mais simples**: Debounce de 200ms no `FiltersPanel` inteiro, ou usar `useDeferredValue` do React 19.

### Comportamento

| Ação | Requisições |
|------|-------------|
| Clicar 3 checkboxes rapidamente | 1 requisição (após 300ms) |
| Digitar + ajustar slider rapidamente | 1 requisição |
| Mudar filtro e parar | 1 requisição após debounce |

### Testes

- Contar requisições de rede ao interagir com múltiplos filtros rapidamente
- Verificar que estado final está correto após debounce
