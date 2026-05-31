# Mudança 3: Search Bar — Indicador Visual + Sugestões

## Arquitetura Atual

`SearchBar.tsx` é um componente controlado com:
- Estado `value` local
- Props `initialQuery` e `onSearch`
- Ícone de busca (cinza), botão limpar (X), botão submit
- Sem sugestões/autocomplete

## Requisitos

### A: Indicador Visual Quando Há Valor

Mudar estilo condicional baseado em `value.length > 0`:
- Ícone: `text-gray-400` → `text-indigo-500`
- Borda: `border-gray-300` → `border-indigo-400 ring-1 ring-indigo-400`

### B: Sugestões de Busca / Autocomplete

Reusar hook `useSuggestions` (já existe, busca 50 skills + companies do endpoint `/jobs/suggestions`). Quando o input tem valor e está focado, mostrar dropdown com sugestões filtradas.

```typescript
const { data: suggestions } = useSuggestions()

const filteredSuggestions = useMemo(() => {
  if (!value.trim() || !suggestions) return []
  const lower = value.toLowerCase()
  const skills = (suggestions.skills ?? []).filter(s => s.toLowerCase().includes(lower))
  const companies = (suggestions.companies ?? []).filter(c => c.toLowerCase().includes(lower))
  return [
    ...skills.map(s => ({ type: 'skill' as const, text: s })),
    ...companies.map(c => ({ type: 'company' as const, text: c })),
  ].slice(0, 8)
}, [value, suggestions])
```

**Navegação por teclado:** ArrowDown/ArrowUp/Escape/Enter nos itens.

## Arquivos Afetados

| Ação | Arquivo |
|------|---------|
| MODIFICAR | `apps/frontend/src/components/SearchBar.tsx` |
| CRIAR | `apps/frontend/src/components/SearchBar.test.tsx` |

## Estados Visuais

| Estado | Ícone | Borda | Sugestões |
|--------|-------|-------|-----------|
| Vazio + idle | `text-gray-400` | `border-gray-300` | Oculta |
| Vazio + focado | `text-gray-400` | `border-indigo-500 ring-1` | Oculta |
| Com valor + focado | `text-indigo-500` | `border-indigo-500 ring-1` | Visível |
| Com valor + blur | `text-indigo-500` | `border-indigo-400` | Oculta |

## Riscos

- Dropdown sobrepõe outros elementos — usar `z-50`
- Latência da API de sugestões — `useSuggestions` tem 300s staleTime, cacheado
- Navegação por teclado conflita com submit — prevenir Enter quando sugestão destacada
- Performance — `useMemo` filtra ~100 itens, instantâneo
