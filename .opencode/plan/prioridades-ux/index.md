# Prioridades UX — Análise de 4 Mudanças

**Data:** 2026-05-30
**Status:** Draft

## Objetivo

Analisar quatro mudanças propostas no JobFindr cobrindo viabilidade, impacto, riscos e abordagem de implementação.

## As 4 Mudanças

| # | Mudança | Camada Principal | Camada Secundária |
|---|---------|-----------------|-------------------|
| 1 | Mover "Your Skills" para o header (botão + modal) | Frontend (Layout, Modal, Store) | Frontend (FiltersPanel, HomePage) |
| 2 | Ordenação padrão: trust score → matching % | Backend (Ranking Engine) | Frontend (exibição, sem lógica) |
| 3 | SearchBar: indicador visual + sugestões | Frontend (SearchBar) | Backend (endpoint suggestions, já existe) |
| 4 | Toggle de preferência: ordenar por Trust vs Match | Frontend + Backend (full stack) | Types (shared), Store, API client |

## Sumário

| Mudança | Viabilidade | Esforço | Risco |
|---------|------------|--------|-------|
| 1: Your Skills no header | ✅ Viável | Médio | Baixo |
| 2: Ordenação trust-first | ✅ Viável | Pequeno | Médio |
| 3: SearchBar melhorias | ✅ Viável | Pequeno-Médio | Baixo |
| 4: Toggle Trust vs Match | ✅ Viável | Médio-Alto | Médio |

## Documentos

| Arquivo | Descrição |
|---------|-----------|
| `change-1-user-skills-header.md` | Mover "Your Skills" para o header como botão + modal |
| `change-2-trust-ordering.md` | Ordenação padrão: trust score → matching % |
| `change-3-search-bar.md` | SearchBar: indicador visual + sugestões |
| `change-4-sort-toggle.md` | Toggle de preferência: ordenar por Trust vs Match |
| `impact-analysis.md` | Impacto por camada, arquivos afetados |
| `risks.md` | Riscos, probabilidade, mitigações |
| `recommendations.md` | Ordem de implementação, fases, sugestões de épicos |
