# 04 — Filtro de País

## Problema

Não há filtro de país/location. O `NormalizedJob` já possui o campo `location` (ex: "São Paulo, Brazil", "San Francisco, CA").

## Solução

Adicionar filtro de país com seleção manual + inferência automática via browser.

### Frontend

**`apps/frontend/src/store/searchStore.ts`**
- Adicionar `countries: string[]` ao state (inicial `[]`)
- Adicionar `setCountries: (countries: string[]) => void`
- Adicionar ao `resetFilters`

**`apps/frontend/src/types/index.ts`**
- Adicionar `countries: string[]` ao `FiltersState` e `SearchParams`

**`apps/frontend/src/services/api.ts`**
- Mapear `params.countries` → `queryParams.countries` (join `,`), se `length > 0`

**Novo: `apps/frontend/src/components/CountryFilter.tsx`**

- Dropdown multiselect com países predefinidos
- Inferir país inicial via `Intl.DateTimeFormat().resolvedOptions().timeZone`
  - Mapear timezone → país (ex: `America/Sao_Paulo` → `Brazil`, `America/New_York` → `USA`)
  - Fallback: vazio (sem filtro)
- Países sugeridos:
  - Brazil, USA, Canada, United Kingdom, Germany, France, Spain, Portugal, Australia, India, Japan, Netherlands, Ireland, Switzerland, Sweden

### Backend

**`apps/backend/src/modules/search/validation/search-validation.ts`**
- Adicionar parsing de `countries` (comma-separated, lowercase)

**`apps/backend/src/modules/search/services/aggregation-service.ts`**
- Filtrar por país usando `job.location`:
  ```typescript
  if (input.countries.length > 0) {
    const countryLower = input.countries.map((c) => c.toLowerCase())
    allJobs = allJobs.filter((j) => {
      if (!j.location) return false
      const loc = j.location.toLowerCase()
      return countryLower.some((c) => loc.includes(c))
    })
  }
  ```

### Testes

- Testar inferência de timezone → país
- Testar filtro com "brazil" correspondendo a "São Paulo, Brazil"
- Testar sem localização (excluído quando filtro ativo)
