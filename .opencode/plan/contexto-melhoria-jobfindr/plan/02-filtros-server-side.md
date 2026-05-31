# 02 — Filtros Server-Side (remoteMode, seniority, postedAfter)

## Problema

O backend valida os parâmetros `remoteMode`, `seniority` e `postedAfter` em `search-validation.ts`, mas **nunca os aplica como filtro** na aggregation. Eles são apenas passados como hint para os providers, que podem ou não usá-los.

O `NormalizedJob` já possui os campos `remoteMode`, `seniority`, `postedAt` — os filtros podem ser aplicados pós-agregação em memória.

## Solução

Inserir filtros em `aggregation-service.ts` após os company filters e antes do matchmaking.

### Arquivo

**`apps/backend/src/modules/search/services/aggregation-service.ts`**

Após os company filters (após linha 144), adicionar:

### 1. Filtro de remoteMode

```typescript
if (input.remoteMode.length > 0) {
  allJobs = allJobs.filter((j) => {
    if (!j.remoteMode) return false // unknown não corresponde a nenhum modo selecionado
    return input.remoteMode.includes(j.remoteMode)
  })
}
```

### 2. Filtro de seniority

```typescript
if (input.seniority.length > 0) {
  allJobs = allJobs.filter((j) => {
    if (!j.seniority) return false
    return input.seniority.includes(j.seniority)
  })
}
```

### 3. Filtro de postedAfter

```typescript
if (input.postedAfter) {
  const afterDate = new Date(input.postedAfter).getTime()
  allJobs = allJobs.filter((j) => {
    if (!j.postedAt) return false
    return new Date(j.postedAt).getTime() >= afterDate
  })
}
```

### Testes

- Criar testes unitários para cada filtro com jobs mockados
- Testar comportamento com arrays vazios (nenhum filtro aplicado)
- Testar jobs sem o campo (excluded quando filtro ativo)
- Testar datas inválidas no postedAfter
