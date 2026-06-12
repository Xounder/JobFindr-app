# TASK-01: Implementar Provedor Adzuna

## Depends on
Nenhuma — tarefa independente.

## Descrição
Implementar o provedor de vagas para a API da Adzuna (developer.adzuna.com). A Adzuna agrega vagas de múltiplas fontes e oferece uma API REST com autenticação via `app_id` + `app_key`. O provedor deve estender `ApiProvider`, implementar o método `search()`, mapear os campos da resposta para `NormalizedJob`, adicionar as variáveis de ambiente necessárias, criar a factory function e os testes unitários.

## Detalhes Técnicos

### API Adzuna
- **Base URL**: `https://api.adzuna.com/v1/api`
- **Auth**: `app_id` e `app_key` como query parameters em todas as requisições
- **País**: `br` (Brasil)
- **Search endpoint**: `GET /jobs/br/search/{page}` — paginação baseada em página
- **Categories endpoint**: `GET /jobs/br/categories` (para referência futura)
- **Rate limit**: 1000 req/hora no plano gratuito
- **Timeout padrão**: 10000ms (configurável via `ADZUNA_TIMEOUT_MS`)

### Campos da Resposta → NormalizedJob
| Campo API | Campo NormalizedJob | Observação |
|-----------|-------------------|------------|
| `title` | `title` | Direto |
| `company.display_name` | `company` | Nome da empresa |
| `location.display_name` | `location` | Localização formatada |
| `salary_min` / `salary_max` | `salary` | Mapear para `SalaryInfo { min, max, currency: 'BRL', period: 'yearly' }` |
| `description` | `description` | Limpar HTML |
| `category.label` | `industry` | Categoria da vaga |
| `contract_type` | Usar para inferir senioridade/remoto | Mapear tipos comuns (CLT, PJ, etc.) |
| `created` | `postedAt` | Converter para ISO string |
| `redirect_url` | `url` | URL de candidatura |

### Arquivos a modificar/criar
1. **CRIAR**: `apps/backend/src/modules/providers/adzuna/adzuna-provider.ts`
2. **CRIAR**: `apps/backend/src/modules/providers/adzuna/adzuna-provider.test.ts`
3. **MODIFICAR**: `apps/backend/src/config/env.ts` — adicionar `ADZUNA_APP_ID`, `ADZUNA_APP_KEY`, `ADZUNA_TIMEOUT_MS`
4. **MODIFICAR**: `apps/backend/.env.example` — adicionar entradas de exemplo
5. **MODIFICAR**: `apps/backend/.env` — adicionar valores padrão

### Estrutura da Classe

```typescript
// apps/backend/src/modules/providers/adzuna/adzuna-provider.ts

// Tipos raw da API Adzuna
type AdzunaJobRaw = {
  id: string
  title: string
  company: { display_name: string }
  location: { display_name: string }
  salary_min?: number
  salary_max?: number
  description: string
  category?: { label: string }
  contract_type?: string
  created: string
  redirect_url: string
}

type AdzunaApiResponse = {
  results: AdzunaJobRaw[]
  count: number
  // ...
}

export class AdzunaProvider extends ApiProvider {
  constructor(appId: string, appKey: string) {
    super({
      name: 'adzuna',
      baseUrl: 'https://api.adzuna.com/v1/api',
      defaultHeaders: { 'Accept': 'application/json' },
    })
    // Armazenar appId e appKey como propriedades privadas
  }

  search(input: ValidatedSearchInput): Promise<NormalizedJob[]> {
    return this.executeWithInstrumentation(async () => {
      // 1. Construir query params com app_id, app_key, o quê, onde, etc.
      // 2. Fazer requisição GET para /jobs/br/search/{page} com retry
      // 3. Mapear cada resultado com mapJob()
      // 4. Aplicar filtro opcional por query (client-side)
      // 5. Retornar array de NormalizedJob
    }, input)
  }

  private mapJob(raw: AdzunaJobRaw): NormalizedJob {
    // Mapear campos conforme tabela acima
    // Usar normalizeJob() do normalization-pipeline
  }

  protected hasMorePages(response: unknown, currentPage: number): boolean {
    // Verificar se há mais páginas baseado na contagem total vs. página atual
  }
}

export async function createAdzunaProvider(): Promise<AdzunaProvider> {
  const appId = env.ADZUNA_APP_ID
  const appKey = env.ADZUNA_APP_KEY
  if (!appId || !appKey) {
    logger.warn('Adzuna credentials not configured, provider will return empty')
    return new AdzunaProvider('', '')
  }
  return new AdzunaProvider(appId, appKey)
}
```

### Variáveis de Ambiente
Adicionar em `apps/backend/src/config/env.ts`:
```typescript
// Provider Adzuna
ADZUNA_APP_ID: getEnv('ADZUNA_APP_ID', ''),
ADZUNA_APP_KEY: getEnv('ADZUNA_APP_KEY', ''),
ADZUNA_TIMEOUT_MS: getEnvInt('ADZUNA_TIMEOUT_MS', 10000),
```

Adicionar em `.env.example` e `.env`:
```
ADZUNA_APP_ID=
ADZUNA_APP_KEY=
ADZUNA_TIMEOUT_MS=10000
```

### Tratamento de Erros e Edge Cases
- Se `ADZUNA_APP_ID` ou `ADZUNA_APP_KEY` não estiverem configurados, retornar array vazio com log de aviso
-Usar `withRetry()` para chamadas à API (transient errors: timeout, 5xx)
- Respeitar rate limit (1000 req/h) — usar o `handleRateLimit()` do `ApiProvider` se a API retornar `Retry-After`
- Se a API retornar erro (4xx não-transiente), logar e retornar array vazio (provider isolation)
- Campos ausentes devem ter defaults seguros (título vira "Unknown Position", empresa vira "Unknown Company")

## Abordagem de Implementação

1. Criar diretório `apps/backend/src/modules/providers/adzuna/`
2. Criar `adzuna-provider.ts` com:
   - Tipos raw `AdzunaJobRaw` e `AdzunaApiResponse`
   - Classe `AdzunaProvider extends ApiProvider`
   - Construtor que recebe `appId` e `appKey` e passa para query params
   - Método `search()` com `executeWithInstrumentation`
   - Método privado `mapJob()` usando `normalizeJob()` + `cleanHtml()` + `extractSkillsFromJob()`
   - Método `hasMorePages()` baseado em `count` vs. resultados por página
   - Factory function `createAdzunaProvider()` lendo de `env.ts`
3. Adicionar env vars em `env.ts`, `.env.example` e `.env`
4. Criar `adzuna-provider.test.ts` com testes mockando o HTTP client

## Testes

- **Testes unitários** (`adzuna-provider.test.ts`):
  - Verificar metadados do provider (name, providerType, version)
  - Retornar array vazio quando credenciais não configuradas
  - Mapear resposta completa corretamente para `NormalizedJob`
  - Mapear resposta com campos ausentes (defaults seguros)
  - Aplicar filtro por query no título/descrição
  - Retornar array vazio em caso de falha na API
  - Calcular paginação corretamente com `hasMorePages()`
  - Construir query params corretamente (app_id, app_key, what, where)
  - Mapear salary_min/salary_max para SalaryInfo
  - Converter `created` para ISO string em `postedAt`
  - Limpar HTML da descrição

## Referências

- `.opencode/plan/br-providers/epics/EPIC-01-adzuna-provider.md`
- `apps/backend/src/modules/providers/domain/api-provider.ts` — classe base ApiProvider
- `apps/backend/src/modules/providers/domain/base-provider.ts` — classe base BaseProvider
- `apps/backend/src/modules/providers/ashby/ashby-provider.ts` — exemplo de provedor ApiProvider
- `apps/backend/src/modules/providers/gupy/gupy-provider.ts` — exemplo de padrão de fábrica
- `apps/backend/src/modules/providers/services/normalization-pipeline.ts` — normalizeJob, parseCompensation
- `apps/backend/src/modules/providers/services/retry-system.ts` — withRetry
- `apps/backend/src/config/env.ts` — variáveis de ambiente
- `apps/backend/.env.example` — template de env
- `apps/backend/src/modules/providers/ashby/ashby-provider.test.ts` — padrão de testes com mock
