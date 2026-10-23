# Jungle Gaming - Distributed Wagering Processor

Este projeto é um serviço financeiro distribuído para processamento de apostas, construído com foco em precisão monetária, idempotência e concorrência.

## Stack
- **Runtime:** Bun
- **Framework:** NestJS
- **Banco de Dados:** PostgreSQL
- **ORM:** MikroORM (v7)
- **Mensageria:** LocalStack (SQS)

## Como Executar o Projeto

1. **Suba a infraestrutura (Banco e SQS):**
   ```bash
   docker compose up -d
Instale as dependências:

bash
bun install
Rode as migrations para criar as tabelas:

bash
bunx -b mikro-orm migration:up
Inicie a aplicação:

bash
bun run start
Endpoints Principais
Criar Carteira
POST /wallets

Payload:

json
{ "playerId": "uuid-do-jogador", "amount": "100.00", "currency": "BRL" }
Processar Transação (Aposta)
POST /wagering/transactions

Payload:

json
{
  "providerId": "provider-a",
  "externalId": "tx-123",
  "walletId": "uuid-da-wallet",
  "kind": "BET",
  "amount": "80.00",
  "currency": "BRL"
}
Health Checks
GET /health/live (Processo vivo)

GET /health/ready (Pronto para receber conexões)

Testes Unitários
Para rodar os testes de domínio do Value Object de dinheiro:

bash
bun test
text

---

### 🏛️ 2. ARCHITECTURE.md (O Diário de Decisões)
Cria o `ARCHITECTURE.md` na raiz. Este documento é o que você vai ler em voz alta no seu treino com o seu amigo:

```markdown
# Architecture Decisions (ADR)

## 1. Visão Geral
O projeto aplica princípios de DDD (Domain-Driven Design) e Event-Driven Architecture. O objetivo central é garantir a integridade financeira (sem saldo negativo e sem débito duplicado) em um ambiente onde múltiplas instâncias da aplicação podem processar transações concorrentes.

## 2. Modelagem de Dinheiro (Correção Financeira)
- **Decisão:** Representação via `string` decimal no banco e `decimal.js` no domínio.
- **Justificativa:** O uso de `number` ou `float` é proibido (falha eliminatória) por causar perda de precisão. O Value Object `Money` garante imutabilidade e normalização para 2 casas decimais. A factory `from()` rejeita notação científica e valores com mais de 2 casas.

## 3. Concorrência Segura (Optimistic Locking)
- **Decisão:** Uso da coluna `version` na entidade `Wallet`.
- **Justificativa:** Em um cassino online, o throughput é importante. O Optimistic Lock evita o bloqueio de linha (Pessimistic Lock) e permite que o banco faça `UPDATE ... WHERE version = X`. Se duas apostas disputarem o mesmo saldo, a primeira atualiza a versão; a segunda sofre rollback automaticamente (evitando o *Lost Update* e saldo negativo).

## 4. Idempotência Persistente
- **Decisão:** Constraint `UNIQUE` na coluna `idempotencyKey` (`providerId:externalId`) da tabela `wager_transactions`.
- **Justificativa:** Não confiamos em checagem em memória (falha em ambiente multi-instância). A aplicação tenta inserir a transação direto no banco. Se ocorrer violação de unicidade, o código captura a exceção e retorna o *replay* (`idempotentReplay: true`) sem debitar novamente.

## 5. Arquitetura Orientada a Eventos (Transactional Outbox)
- **Problema Evitado:** Dual Write Problem (salvar no banco e falhar ao publicar no SQS).
- **Solução:** O evento `WalletBalanceChanged` é salvo na tabela `outbox_messages` **na mesma transação SQL** que altera o saldo da carteira. Um `OutboxWorker` roda em background (usando `em.fork()`) e publica as mensagens, garantindo *at-least-once delivery*.
- **Observação:** O envio para o SQS pelo Worker foi simulado via log no console para cumprir o prazo do desafio. O LocalStack está de pé no Docker e o código está pronto para receber o AWS SDK.

## 6. Trade-offs e Limitações (Transparência)
- **Autenticação:** Omitida conforme permitido pela Seção 2 do edital. O foco foi 100% na lógica de negócio e concorrência.
- **REFUND/ROLLBACK:** Devido ao prazo de 3 dias, o fluxo foi priorizado para `BET`, `WIN` e `LOSS`. A modelagem de reversão foi desenhada, mas não codificada.
- **Node vs Bun:** O comando `nest start` via shebang do Node causava `ERR_REQUIRE_CYCLE_MODULE`. A solução foi usar `bunx --bun nest start` para forçar o runtime.