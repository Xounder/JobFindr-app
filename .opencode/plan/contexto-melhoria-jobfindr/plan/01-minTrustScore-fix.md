# 01 — minTrustScore Fix

## Problema

O slider `TrustFilters.tsx` tem range 0-100 com step 5, mas o backend valida que `minTrustScore` deve estar entre **0 e 10**. Qualquer valor >10 causa erro `"minTrustScore must be between 0 and 10"`.

## Causa

- Frontend: `min={0} max={100} step={5}` em `TrustFilters.tsx:24-25`
- Backend: `parseFloatParam(minTrustScoreRaw, 0)` em `search-validation.ts:88`, validação `minTrustScore < 0 || minTrustScore > 10` na linha 89
- O tipo `ValidatedSearchInput.minTrustScore` e `SearchJobsInput.minTrustScore` já documentam 0-10

## Solução

Apenas ajustar o frontend para usar range 0-10:

### Arquivos

**`apps/frontend/src/components/TrustFilters.tsx`**
- `max={100}` → `max={10}`
- `step={5}` → `step={0.5}` (permite valores como 6.5, consistente com o trust engine)
- Ajustar labels: `"0 (Any)"` e `"10 (Highest)"`

### Testes

- Verificar que o slider envia valores entre 0 e 10
- Verificar que a requisição não retorna erro de validação
- Verificar que valores decimais (ex: 6.5) funcionam
