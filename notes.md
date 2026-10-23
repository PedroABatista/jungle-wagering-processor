# Engineering Log & Notes (Development Journey)

Este documento registra os desafios técnicos enfrentados durante o desenvolvimento, os bugs encontrados e as soluções adotadas.

## 1. Desafios de Infraestrutura e Ambiente

- **Conflito de Porta no PostgreSQL (Windows):**
  - **Problema:** O Docker e um PostgreSQL nativo do Windows estavam tentando usar a porta 5432 ao mesmo tempo, causando erro de autenticação (`28P01`) na aplicação.
  - **Solução:** Mudei o mapeamento de porta no `docker-compose.yml` para `5433:5432` e atualizei o host/porta no MikroORM.
  
- **Licença do LocalStack:**
  - **Problema:** A imagem `localstack/localstack:latest` passou a exigir um `LOCALSTACK_AUTH_TOKEN` e quebrava com exit code 55.
  - **Solução:** Fixei a versão em `localstack/localstack:4.14.0` (última comunidade).

- **Node vs Bun (ERR_REQUIRE_CYCLE_MODULE):**
  - **Problema:** O comando `nest start` usava o shebang do Node 22, que quebrava no `@angular-devkit/schematics`.
  - **Solução:** Alterei o script no `package.json` para `bunx --bun nest start`, forçando o runtime do Bun a executar o CLI.

## 2. Desafios de Tipagem e ORM

- **TypeScript 7 (tsgo) vs NestJS:**
  - **Problema:** O TS 7 causava falhas na compilação de decorators (`@Module`, `@Injectable`).
  - **Solução:** Downgrade para `typescript@5` (versão oficialmente suportada pelo NestJS).

- **MikroORM "Not Discovered Entity":**
  - **Problema:** O ORM reclamava que a `WalletEntity` não era a mesma instância carregada, causado pela mistura de arquivos `.ts` e `.js` entre as pastas `src` e `dist`.
  - **Solução:** Configurei explicitamente as entidades no `mikro-orm.config.ts` e garanti a limpeza do build (`dist`).
  
- **MikroORM Global Context no Worker:**
  - **Problema:** O `OutboxWorker` (que roda em background) não podia usar o `EntityManager` global da requisição HTTP.
  - **Solução:** Usei `this.em.fork()` dentro do Worker para criar um contexto isolado.

## 3. Decisões de Domínio (Value Objects)

- **Validação de Dinheiro (`Money.from`):**
  - **Decisão:** Usar `.trim() === ""` e validar com Regex antes de instanciar o `Decimal.js`.
  - **Motivo:** O `new Decimal("")` lança exceção e quebra o fluxo. A validação prévia garante mensagens de erro amigáveis para o cliente.
  
- **Normalização de Moeda:**
  - **Decisão:** Salvar sempre a moeda com `.trim().toUpperCase()`.
  - **Motivo:** Evitar bugs onde `"BRL" !== " brl "`, o que causaria erros falsos no `assertSameCurrency`.

## 4. Próximos Passos (Se houvesse mais tempo)
- Integrar o AWS SDK real no `OutboxWorker` (conectar ao LocalStack).
- Implementar testes de carga (50 apostas simultâneas) para validar o Optimistic Lock em ambiente de estresse.
- Implementar o fluxo de `REFUND` e `ROLLBACK`.