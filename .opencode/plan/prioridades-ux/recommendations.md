# Recomendações

## Ordem de Implementação

### Fase 1: Fundação (ordering fixes)
1. **Change 2** — Trust-first default sorting (~1 dia)
2. **Change 4** — Sort preference toggle (~2-3 dias, depende do Change 2)

### Fase 2: Melhorias de UX
3. **Change 3** — Search bar improvements (~1-2 dias, independente)

### Fase 3: Esforço maior
4. **Change 1** — Your Skills in header (~2-3 dias, último)

### Rationale
- Change 2 é pré-requisito do Change 4 (mesmo arquivo, evitar merge conflicts)
- Changes 2+4 entregam a história completa de ordenação (default + controle do usuário)
- Change 3 é independente, pode ser feito em paralelo com Fase 2
- Change 1 é o maior esforço de UI, beneficia de infra estável

## Sugestões de Épicos

| Épico | Prioridade | Esforço | Dependências | Risco |
|-------|-----------|---------|-------------|-------|
| Trust-First Default Sorting | Alta (fundação) | Pequeno | Nenhuma | Médio |
| Sort Preference Toggle | Alta (controle) | Médio-Alto | Change 2 | Médio |
| Search Bar Enhancements | Média (UX) | Pequeno-Médio | Nenhuma | Baixo |
| Your Skills in Header | Média (UX) | Médio | Nenhuma (mas beneficia de base estável) | Baixo |

## O Que NÃO Construir (fora de escopo)

- Drag-and-drop de skills do usuário
- Categorias/grupos de skills
- Múltiplos perfis de skill
- Níveis de proficiência (além de senioridade)
- Histórico de buscas recentes
- Buscas salvas
- Ordenação client-side (deve ser server-side para paginação correta)
