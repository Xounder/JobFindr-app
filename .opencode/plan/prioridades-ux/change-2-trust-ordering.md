# Mudança 2: Ordenação Padrão — Trust Score → Matching %

## Arquitetura Atual

Jobs são ordenados no `ranking-engine.ts` por **composite score** ponderado:

| Fator | Peso | Fonte |
|-------|------|-------|
| matchScore | 0.35 | `job.matchScore` (matchmaking) |
| trustScore | 0.25 | `job.trustScore` (trust engine) |
| companyPriority | 0.15 | Tamanho da empresa |
| salary | 0.15 | Score salarial |
| recency | 0.10 | Idade da vaga |

Ordenação atual: composite score descendente — **um único valor misturado**.

## O Problema

O sistema atual **não garante** que trust score venha primeiro. Um job com trustScore=9, matchScore=30, salário alto pode ficar na frente de um com trustScore=7, matchScore=85. O requisito é: trust score primeiro, depois matching %.

## Abordagem Recomendada: Multi-Key Sort

Alterar o sort para:

1. **Primário:** `trustScore` descending
2. **Secundário:** `matchScore` descending
3. **Terciário:** `compositeScore` descending (desempate)

```typescript
sortedJobs.sort((a, b) => {
  const trustA = a.trustScore ?? 5
  const trustB = b.trustScore ?? 5
  if (trustB !== trustA) return trustB - trustA

  const matchA = a.matchScore ?? 50
  const matchB = b.matchScore ?? 50
  if (matchB !== matchA) return matchB - matchA

  return (rankings.get(b.id)?.compositeScore ?? 0) - (rankings.get(a.id)?.compositeScore ?? 0)
})
```

## Arquivos Afetados

| Ação | Arquivo |
|------|---------|
| MODIFICAR | `apps/backend/src/modules/ranking/services/ranking-engine.ts` |
| MODIFICAR | `apps/backend/src/modules/ranking/services/ranking-engine.test.ts` |
| NENHUMA | `composite-score.ts`, `match-score-weight.ts`, `trust-score-weight.ts` |

## Riscos

- Testes existentes falham (alta probabilidade) — atualizar asserts
- Usuários notam ordem diferente — intencional, comunicar em release notes
- `trustScore`/`matchScore` undefined em alguns jobs — usar defaults (5 e 50)
- Cache com ordenação antiga — cache regenera após deploy
