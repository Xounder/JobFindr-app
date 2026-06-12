# TASK-03: Registrar Provedores Adzuna e TheirStack no Provider Loader

## Depends on
- TASK-01: Implementar Provedor Adzuna
- TASK-02: Implementar Provedor TheirStack

## Descrição
Registrar os dois novos provedores (Adzuna e TheirStack) no `provider-loader.ts` para que sejam carregados e inicializados corretamente na inicialização do servidor. Isso inclui adicionar entries em `loadAll()` e `loadByName()` com o padrão consistente usado pelos demais provedores (Greenhouse, Gupy, Ashby, Lever, Workday).

## Detalhes Técnicos

### Arquivo a modificar
- **MODIFICAR**: `apps/backend/src/modules/providers/services/provider-loader.ts`

### O que implementar

#### 1. Em `loadAll()` — adicionar dois novos blocos `try/catch`:

**Adzuna:**
```typescript
try {
  const { createAdzunaProvider } = await import('../adzuna/adzuna-provider.ts')
  loaders.push({ name: 'adzuna', load: () => createAdzunaProvider() })
} catch (error) {
  logger.warn('Failed to load Adzuna provider', {
    module: 'provider-loader',
    error: error instanceof Error ? error.message : 'Unknown',
  })
}
```

**TheirStack:**
```typescript
try {
  const { createTheirStackProvider } = await import('../theirstack/theirstack-provider.ts')
  loaders.push({ name: 'theirstack', load: () => createTheirStackProvider() })
} catch (error) {
  logger.warn('Failed to load TheirStack provider', {
    module: 'provider-loader',
    error: error instanceof Error ? error.message : 'Unknown',
  })
}
```

#### 2. Em `loadByName()` — adicionar entries no `providerMap`:

```typescript
adzuna: async () => {
  const m = await import('../adzuna/adzuna-provider.ts')
  return m.createAdzunaProvider()
},
theirstack: async () => {
  const m = await import('../theirstack/theirstack-provider.ts')
  return m.createTheirStackProvider()
},
```

### Padrão de Implementação

Os provedores Adzuna e TheirStack são diferentes dos provedores atuais porque:
- **Não precisam de company registry** — são APIs públicas que buscam vagas globalmente
- **Não recebem configuração de empresas** — diferente de Greenhouse/Gupy/Ashby/Lever/Workday
- São provedores autônomos que usam apenas env vars para configuração

Portanto, o bloco de importação é mais simples que os demais — não há mapeamento de config ou companies.

### Verificação de Inicialização

Após o registro, verificar:
1. O provider loader não lança exceções ao importar os módulos
2. Os providers são registrados no `providerRegistry` com metadados corretos
3. Os nomes aparecem em `providerRegistry.getNames()`

## Abordagem de Implementação

1. Abrir `apps/backend/src/modules/providers/services/provider-loader.ts`
2. Adicionar blocos `try/catch` para Adzuna e TheirStack em `loadAll()`, posicionados após o bloco existente do Workday (mantendo ordem alfabética ou agrupando por tipo)
3. Adicionar entries no `providerMap` em `loadByName()`
4. Verificar se os imports estão corretos com `pnpm --filter backend build`

## Testes

- **Verificação manual**:
  - Executar `pnpm --filter backend build` para garantir que os imports compilam
  - Verificar se `providerRegistry.getNames()` inclui 'adzuna' e 'theirstack'
- **Não há testes unitários específicos** para esta tarefa — o provider-loader já é testado indiretamente pelos testes de integração existentes.

## Referências

- `.opencode/plan/br-providers/epics/EPIC-03-provider-registration.md`
- `apps/backend/src/modules/providers/services/provider-loader.ts` — arquivo a ser modificado
- `apps/backend/src/modules/providers/adzuna/adzuna-provider.ts` — módulo a importar (criado na TASK-01)
- `apps/backend/src/modules/providers/theirstack/theirstack-provider.ts` — módulo a importar (criado na TASK-02)
- `apps/backend/src/modules/providers/domain/provider-registry.ts` — registry onde os providers são registrados
