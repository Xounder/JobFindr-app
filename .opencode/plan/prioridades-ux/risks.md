# Riscos

## Mudança 1: Your Skills no Header

| Risco | Prob. | Impacto | Mitigação |
|-------|-------|---------|-----------|
| Estado modal fora de sincronia | Baixa | Baixo | `useState` local no Layout, fechar no clique fora |
| UX seletiva confusa | Média | Médio | Checkboxes claras + contador + tooltip |
| Remove All acidental | Média | Baixo | Diálogo de confirmação |
| Layout inchado | Média | Baixo | Delegar lógica para o modal |
| Localizações duplicadas (sidebar + header) | Média | Médio | Remover UserSkillsInput da sidebar, só indicador |

## Mudança 2: Trust-First Sort

| Risco | Prob. | Impacto | Mitigação |
|-------|-------|---------|-----------|
| Testes existentes falham | Alta | Médio | Atualizar asserts |
| Usuários notam ordem diferente | Média | Médio | Comunicar em release notes |
| trustScore/matchScore undefined | Média | Baixo | Default: trust ?? 5, match ?? 50 |
| Cache com ordenação antiga | Baixa | Baixo | Cache regenera após deploy |

## Mudança 3: Search Bar

| Risco | Prob. | Impacto | Mitigação |
|-------|-------|---------|-----------|
| Dropdown sobrepõe elementos | Média | Baixo | `z-50`, container `relative` |
| API de sugestões lenta | Baixa | Baixo | 300s staleTime, cacheado |
| Navegação teclado conflita | Média | Baixo | Prevenir Enter se sugestão destacada |
| Performance | Baixa | Baixo | `useMemo`, ~100 itens |

## Mudança 4: Toggle Trust vs Match

| Risco | Prob. | Impacto | Mitigação |
|-------|-------|---------|-----------|
| Colisão com valores sort existentes | Alta | Médio | `trust`/`match` são aditivos, sem quebra |
| Cache obsoleto ao mudar preferência | Média | Baixo | QueryKey inclui sort → refetch automático |
| Confusão sobre "Trust" vs "Match" | Média | Baixo | Tooltip explicativo |
| Conflito com Change 2 (mesmo arquivo) | Alta | Médio | Change 2 primeiro, depois Change 4 |
| Store schema migration | Média | Baixo | Zustand persist mergeia novo campo com default |
