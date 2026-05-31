# Plano de Melhorias — JobFindr

## Contexto

Este plano foi gerado a partir de uma análise do usuário sobre problemas de performance, UX e bugs no JobFindr. Cada melhoria está documentada em seu próprio arquivo.

## Problemas Identificados

| # | Problema | Prioridade | Status |
|---|----------|------------|--------|
| 01 | minTrustScore: slider frontend 0-100 vs backend 0-10 | Crítica | Pendente |
| 02 | Filtros remoteMode e seniority validados mas não aplicados no backend | Alta | Pendente |
| 03 | Sem filtro de remoteMode no frontend | Alta | Pendente |
| 04 | Sem filtro de país | Média | Pendente |
| 05 | Paginação server-side ineficiente (fetch tudo, pagina por último) | Alta | Pendente |
| 06 | Sem persistência de filtros (localStorage) | Média | Pendente |
| 07 | Sugestões de empresas incluem companies sem provider | Média | Pendente |
| 08 | Debounce apenas na query, não nos filtros | Baixa | Pendente |

## Ordem de Implementação Recomendada

1. **01-minTrustScore-fix.md** — sem dependências
2. **06-localStorage-persist.md** — sem dependências
3. **07-company-suggestions.md** — sem dependências
4. **08-debounce-filtros.md** — sem dependências
5. **02-filtros-server-side.md** — sem dependências (base para P3 e P4)
6. **03-remoteMode-filter.md** — depende de P2
7. **04-pais-filter.md** — depende de P2
8. **05-paginacao-cache.md** — depende de P2 (cache armazena resultado pós-processamento)

## Arquivos do Plano

| Arquivo | Descrição |
|---------|-----------|
| `index.md` | Visão geral |
| `01-minTrustScore-fix.md` | Corrigir slider 0-100 → 0-10 |
| `02-filtros-server-side.md` | Aplicar remoteMode, seniority, postedAfter no backend |
| `03-remoteMode-filter.md` | Adicionar filtro remoteMode no frontend |
| `04-pais-filter.md` | Adicionar filtro de país (inferência + manual) |
| `05-paginacao-cache.md` | Cache de resultado agregado + paginação eficiente |
| `06-localStorage-persist.md` | Persistir filtros no localStorage via Zustand persist |
| `07-company-suggestions.md` | Limitar sugestões às companies reais dos providers |
| `08-debounce-filtros.md` | Debounce nas mudanças de filtro |
