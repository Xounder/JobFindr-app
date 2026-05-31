# Mudança 1: Mover "Your Skills" para o Header

## Arquitetura Atual

- `UserSkillsInput.tsx` renderiza dentro de `FiltersPanel.tsx` na sidebar
- Lê/escreve `userSkills` e `userSeniority` do Zustand `searchStore` (persistido em localStorage)
- Botão "Move all to Required Skills" chama `handleMoveToRequired` no `HomePage.tsx` que move **todas** as skills e limpa `userSkills`
- `SkillsTagsInput.tsx` gerencia o filtro "Required Skills" na sidebar

## Requisitos

| Requisito | Atual | Alvo |
|-----------|-------|------|
| Localização | Sidebar (FiltersPanel) | Header (Layout) |
| Apresentação | Componente inline completo | Botão "Your Skills" |
| Interação | Sempre visível | Botão → abre modal |
| Gerenciamento | Autocomplete + tags | Mesmo, dentro do modal |
| Mover para Required | Move TODAS as skills | Usuário seleciona quais mover |
| Remover todas | Não disponível | Botão "Remove All" |

## Abordagem Recomendada: Modal Component + Header Button

**Descrição:** Criar `UserSkillsModal.tsx`, adicionar botão "Your Skills" no `Layout.tsx`, modificar `FiltersPanel.tsx` para mostrar apenas indicador simplificado.

**Seleção seletiva:** Cada skill no modal ganha um checkbox. Botão "Move Selected to Required" move apenas as marcadas. O modal lê/escreve a store diretamente (sem prop drilling).

**Remove All:** Botão com confirmação: `onClick={() => setUserSkills([])}`.

## Arquivos Afetados

| Ação | Arquivo |
|------|---------|
| CRIAR | `apps/frontend/src/components/UserSkillsModal.tsx` |
| MODIFICAR | `apps/frontend/src/components/Layout.tsx` |
| MODIFICAR | `apps/frontend/src/components/FiltersPanel.tsx` |
| MODIFICAR | `apps/frontend/src/pages/HomePage.tsx` |
| MODIFICAR | `apps/frontend/src/components/UserSkillsInput.test.tsx` |
| CRIAR | `apps/frontend/src/components/UserSkillsModal.test.tsx` |

## Riscos

- Estado do modal (aberto/fechado) fora de sincronia — Baixo
- UX de seleção seletiva confusa — Médio (mitigação: checkboxes claros + contador)
- Usuário remove skills acidentalmente — Médio (mitigação: diálogo de confirmação)
- Layout fica inchado com lógica de estado — Baixo (delegar para o modal)
