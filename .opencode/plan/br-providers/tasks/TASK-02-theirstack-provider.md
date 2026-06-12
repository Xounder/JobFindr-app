# TASK-02: Implementar Provedor TheirStack

## Depends on
Nenhuma — tarefa independente.

## Descrição
Implementar o provedor de vagas para a API da TheirStack (theirstack.com). A TheirStack agrega 199M vagas de 333k fontes em 195 países, com foco em vagas de tecnologia. O provedor deve estender `ApiProvider`, implementar o método `search()` com autenticação via Bearer token, mapear os campos da resposta para `NormalizedJob`, adicionar tratamento de rate limit, criar a factory function e os testes unitários.

## Detalhes Técnicos

### API TheirStack
- **Base URL**: `https://api.theirstack.com/v1`
- **Auth**: Bearer token via header `Authorization: Bearer <token>`
- **Search endpoint**: `POST /jobs/search`
- **Key response fields**: `job_title`, `company_name`, `location`, `salary`, `description`, `technologies`, `posting_age`, `remote`, `job_url`, `country`
- **Rate limit (free tier)**: 4/s, 10/min, 50/hr, 400/day
- **Timeout padrão**: 10000ms (configurável via `THEIRSTACK_TIMEOUT_MS`)

### Campos da Resposta → NormalizedJob
| Campo API | Campo NormalizedJob | Observação |
|-----------|-------------------|------------|
| `job_title` | `title` | Direto |
| `company_name` | `company` | Nome da empresa |
| `location` | `location` | Localização (cidade, estado, país) |
| `salary` | `salary` | Mapear string de salário usando `parseSalary()` |
| `description` | `description` | Limpar HTML |
| `technologies` | `skills` | Array de tecnologias (mapear para skills) |
| `posting_age` | Usar para calcular `postedAt` | Converter idade (em dias) para data |
| `remote` | `remoteMode` | Booleano → 'remote' ou undefined |
| `job_url` | `url` | URL de candidatura |
| `country` | Incluir em `location` | País da vaga |

### Rate Limit Handling
- A TheirStack tem limites rigorosos: 4/s, 10/min, 50/hr, 400/day
- Implementar throttle local antes de cada requisição:
  - Controlar requisições por segundo (máx 4)
  - Controlar requisições por minuto (máx 10)
  - Se aproximando do limite horário/diário, reduzir taxa
- Usar `handleRateLimit()` do `ApiProvider` para respeitar `Retry-After`
- Logar warnings quando se aproximar dos limites

### Arquivos a modificar/criar
1. **CRIAR**: `apps/backend/src/modules/providers/theirstack/theirstack-provider.ts`
2. **CRIAR**: `apps/backend/src/modules/providers/theirstack/theirstack-provider.test.ts`
3. **MODIFICAR**: `apps/backend/src/config/env.ts` — adicionar `THEIRSTACK_API_KEY`, `THEIRSTACK_TIMEOUT_MS`
4. **MODIFICAR**: `apps/backend/.env.example` — adicionar entradas de exemplo
5. **MODIFICAR**: `apps/backend/.env` — adicionar valores padrão

### Estrutura da Classe

```typescript
// apps/backend/src/modules/providers/theirstack/theirstack-provider.ts

// Tipos raw da API TheirStack
type TheirStackJobRaw = {
  job_title: string
  company_name: string
  location: string
  salary?: string
  description: string
  technologies?: string[]
  posting_age?: number
  remote?: boolean
  job_url: string
  country?: string
  // ...
}

type TheirStackApiResponse = {
  data: TheirStackJobRaw[]
  total?: number
  page?: number
  // ...
}

export class TheirStackProvider extends ApiProvider {
  private apiKey: string
  private requestTimestamps: number[] = [] // Para controle de rate limit

  constructor(apiKey: string) {
    super({
      name: 'theirstack',
      baseUrl: 'https://api.theirstack.com/v1',
      defaultHeaders: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })
    this.apiKey = apiKey
  }

  search(input: ValidatedSearchInput): Promise<NormalizedJob[]> {
    return this.executeWithInstrumentation(async () => {
      // 1. Aplicar throttle (respeitar rate limits antes da chamada)
      // 2. Construir body da requisição POST com filtros
      // 3. Fazer requisição POST para /jobs/search com retry
      // 4. Mapear cada resultado com mapJob()
      // 5. Aplicar filtro opcional por query (client-side)
      // 6. Retornar array de NormalizedJob
    }, input)
  }

  private async throttle(): Promise<void> {
    // Implementar controle de taxa:
    // - Verificar timestamps de requisições no último segundo
    // - Verificar timestamps no último minuto
    // - Se exceder limite, aguardar tempo necessário
  }

  private mapJob(raw: TheirStackJobRaw): NormalizedJob {
    // Mapear campos conforme tabela acima
    // Calcular postedAt a partir de posting_age (dias atrás)
    // Usar normalizeJob() do normalization-pipeline
  }

  protected hasMorePages(response: unknown, currentPage: number): boolean {
    // Verificar paginação baseada em total vs. página atual
  }
}

export async function createTheirStackProvider(): Promise<TheirStackProvider> {
  const apiKey = env.THEIRSTACK_API_KEY
  if (!apiKey) {
    logger.warn('TheirStack API key not configured, provider will return empty')
    // Retornar instância que sempre retorna array vazio
  }
  return new TheirStackProvider(apiKey)
}
```

### Variáveis de Ambiente
Adicionar em `apps/backend/src/config/env.ts`:
```typescript
// Provider TheirStack
THEIRSTACK_API_KEY: getEnv('THEIRSTACK_API_KEY', ''),
THEIRSTACK_TIMEOUT_MS: getEnvInt('THEIRSTACK_TIMEOUT_MS', 10000),
```

Adicionar em `.env.example` e `.env`:
```
THEIRSTACK_API_KEY=
THEIRSTACK_TIMEOUT_MS=10000
```

### Tratamento de Erros e Edge Cases
- Se `THEIRSTACK_API_KEY` não estiver configurada, retornar array vazio com log de aviso
- Usar `withRetry()` para chamadas à API (transient errors)
- Implementar throttle local para respeitar limites de taxa (4/s, 10/min)
- Se a API retornar 429 (Too Many Requests), usar `handleRateLimit()` e registrar delay
- Campos ausentes devem ter defaults seguros
- `posting_age` em dias → converter para `postedAt` subtraindo dias da data atual
- `technologies` array → mapear diretamente para `skills`
- `remote` booleano → mapear para `remoteMode: 'remote' | undefined`

## Abordagem de Implementação

1. Criar diretório `apps/backend/src/modules/providers/theirstack/`
2. Criar `theirstack-provider.ts` com:
   - Tipos raw `TheirStackJobRaw` e `TheirStackApiResponse`
   - Classe `TheirStackProvider extends ApiProvider`
   - Construtor que recebe `apiKey` e configura headers de autenticação
   - Sistema de throttle para rate limiting local
   - Método `search()` com `executeWithInstrumentation`
   - Método privado `mapJob()` usando `normalizeJob()` + `cleanHtml()`
   - Método `hasMorePages()` baseado em total retornado
   - Factory function `createTheirStackProvider()` lendo de `env.ts`
3. Adicionar env vars em `env.ts`, `.env.example` e `.env`
4. Criar `theirstack-provider.test.ts` com testes mockando o HTTP client

## Testes

- **Testes unitários** (`theirstack-provider.test.ts`):
  - Verificar metadados do provider (name, providerType, version)
  - Retornar array vazio quando API key não configurada
  - Mapear resposta completa corretamente para `NormalizedJob`
  - Mapear resposta com campos ausentes (defaults seguros)
  - Aplicar filtro por query no título/descrição
  - Retornar array vazio em caso de falha na API
  -Converter `posting_age` (dias) para `postedAt` corretamente
  - Mapear `technologies` array para `skills`
  - Mapear `remote: true` para `remoteMode: 'remote'`
  - Mapear `salary` string usando parser de salário
  - Aplicar throttle antes de requisições consecutivas
  - Respeitar rate limit de 4 requisições por segundo
  - Construir body da requisição POST corretamente com filtros de busca
  - Incluir filtro de país (`br`) nas requisições

## Referências

- `.opencode/plan/br-providers/epics/EPIC-02-theirstack-provider.md`
- `apps/backend/src/modules/providers/domain/api-provider.ts` — classe base ApiProvider
- `apps/backend/src/modules/providers/domain/base-provider.ts` — classe base BaseProvider
- `apps/backend/src/modules/providers/ashby/ashby-provider.ts` — exemplo de provedor ApiProvider
- `apps/backend/src/modules/providers/services/normalization-pipeline.ts` — normalizeJob, parseCompensation
- `apps/backend/src/modules/providers/services/normalization-pipeline.ts` — parseSalary
- `apps/backend/src/modules/providers/services/retry-system.ts` — withRetry
- `apps/backend/src/config/env.ts` — variáveis de ambiente
- `apps/backend/.env.example` — template de env
- `apps/backend/src/modules/providers/ashby/ashby-provider.test.ts` — padrão de testes com mock
