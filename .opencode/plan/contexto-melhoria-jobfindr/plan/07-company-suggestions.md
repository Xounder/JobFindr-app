# 07 — Sugestões de Empresas Apenas com Provider

## Problema

O endpoint `/jobs/suggestions` retorna 40 empresas hardcoded, mas apenas ~23 têm provider real. Usuários podem selecionar Google, Amazon, Meta, Nubank etc. e obter 0 resultados.

## Solução

Substituir a lista hardcoded pelas empresas reais extraídas dos arquivos de configuração dos providers.

### Arquivos

**`apps/backend/src/modules/providers/config/companies.ts`**

Adicionar export function que retorna todas as empresas disponíveis:

```typescript
export function getAllCompanies(): string[] {
  const companies = new Set<string>()

  for (const c of GREENHOUSE_COMPANIES) companies.add(c.name)
  for (const c of ASHBY_COMPANIES) companies.add(c.name)
  for (const c of LEVER_COMPANIES) companies.add(c.name)
  for (const c of WORKDAY_COMPANIES) companies.add(c.name)

  return [...companies].sort()
}
```

**`apps/backend/src/modules/suggestions/suggestions-controller.ts`**

- Importar `getAllCompanies` de `companies.ts`
- Substituir `SUGGESTED_COMPANIES` por `getAllCompanies()`

### Resultado

Antes: 40 empresas (muitas sem provider).  
Depois: ~23 empresas reais:

Greenhouse: Stripe, Airbnb, Coinbase, Dropbox, Square, Twilio, Slack, Pinterest, Robinhood, Palantir, GitHub, Shopify, Canva  
Ashby: Notion, Linear, Loom, Vercel, Rippling, Figma  
Lever: Netflix, Uber, Asana, Buffer, Walmart, TripActions  
Workday: Target, Salesforce, Walmart, Starbucks

### Bônus: Gupy

O Gupy não tem empresas fixas (é um portal global), então não adicionamos ao `getAllCompanies()`. Se desejar incluir algumas empresas brasileiras do Gupy, podemos adicionar manualmente depois.

### Testes

- Verificar que `getAllCompanies()` retorna lista correta
- Verificar que endpoint `/jobs/suggestions` retorna apenas empresas válidas
- Verificar que frontend autocomplete mostra apenas empresas com provider
