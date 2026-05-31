# 03 — Filtro RemoteMode no Frontend

## Problema

O frontend não possui filtro para remote/hybrid/on-site, apesar do backend já validar o parâmetro `remoteMode`.

## Solução

Adicionar checkbox group no FiltersPanel e conectar ao Zustand store.

### Arquivos

**`apps/frontend/src/store/searchStore.ts`**
- Adicionar `remoteMode: string[]` ao state (inicial `[]`)
- Adicionar `setRemoteMode: (modes: string[]) => void` ao setter
- Adicionar ao `resetFilters`

**`apps/frontend/src/types/index.ts`**
- Adicionar `remoteMode: string[]` ao `FiltersState`
- Adicionar `remoteMode: string[]` ao `SearchParams`

**`apps/frontend/src/services/api.ts`**
- Mapear `params.remoteMode` → `queryParams.remoteMode` (join por `,`), apenas se `length > 0`

**Novo: `apps/frontend/src/components/RemoteModeFilter.tsx`**

```tsx
interface RemoteModeFilterProps {
  value: string[]
  onChange: (modes: string[]) => void
}
```

Checkbox group com 3 opções:
- Remoto (`remote`)
- Híbrido (`hybrid`)
- Presencial (`on-site`)

Comportamento: se nenhum selecionado, não envia parâmetro. Se um ou mais selecionados, envia como comma-separated.

**`apps/frontend/src/components/FiltersPanel.tsx`**
- Importar `RemoteModeFilter`
- Adicionar na árvore de filtros (após SkillsTagsInput)
- Passar `filters.remoteMode` e `onRemoteModeChange`

**`apps/frontend/src/pages/HomePage.tsx`**
- Extrair `remoteMode` e `setRemoteMode` do store
- Passar para `FiltersPanel`

### Comportamento

| Estado do filtro | Parâmetro enviado | Resultado no backend |
|---|---|---|
| Nenhum selecionado | Não envia | Sem filtro, todos passam |
| `["remote"]` | `?remoteMode=remote` | Apenas jobs remotos |
| `["remote", "hybrid"]` | `?remoteMode=remote,hybrid` | Remotos ou híbridos |
