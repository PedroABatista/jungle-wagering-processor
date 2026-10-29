# Architecture Decisions (ADR)

## 1. Visão Geral
O projeto aplica princípios de DDD (Domain-Driven Design) e Event-Driven Architecture. O objetivo central é garantir a integridade financeira (sem saldo negativo e sem débito duplicado) em um ambiente onde múltiplas instâncias da aplicação podem processar transações concorrentes.

## 2. Modelagem de Dinheiro (Correção Financeira)
- **Decisão:** Representação via `string` decimal no banco e `decimal.js` no domínio.
- **Justificativa:** O uso de `number` ou `float` é proibido (falha eliminatória) por causar perda de precisão. O Value Object `Money` garante imutabilidade e normalização para 2 casas decimais. A factory `from()` rejeita notação científica, valores negativos e valores com mais de 2 casas.

## 3. Concorrência Segura (Optimistic Locking)
- **Decisão:** Uso da coluna `version` na entidade `Wallet`.
- **Justificativa:** Em um cassino online, o throughput é importante. O Optimistic Lock evita o bloqueio de linha (Pessimistic Lock) e permite que o banco faça `UPDATE ... WHERE version = X`. Se duas apostas disputarem o mesmo saldo, a primeira atualiza a versão; a segunda sofre rollback (evitando o *Lost Update* e saldo negativo).
- **Validação:** Um script de teste real (`teste-concorrencia.ts`) dispara duas requisições simultâneas para comprovar a eficácia do lock.

## 4. Idempotência Persistente
- **Decisão:** Constraint `UNIQUE` na coluna `idempotencyKey` (`providerId:externalId`) da tabela `wager_transactions`.
- **Justificativa:** Não confiamos em checagem em memória (falha em ambiente multi-instância). A aplicação tenta inserir a transação direto no banco. Se ocorrer violação de unicidade (código 23505), o código captura a exceção e retorna o *replay* (`idempotentReplay: true`) sem debitar novamente. Se o payload for divergente, retorna HTTP 409 Conflict.

## 5. Arquitetura Orientada a Eventos (Transactional Outbox)
- **Problema Evitado:** Dual Write Problem (salvar no banco e falhar ao publicar no SQS).
- **Solução:** O evento `WalletBalanceChanged` é salvo na tabela `outbox_messages` **na mesma transação SQL** que altera o saldo da carteira. Um `OutboxWorker` roda em background (usando `em.fork()`) e publica as mensagens, garantindo *at-least-once delivery*. O Worker só marca a mensagem como publicada (`publishedAt`) após confirmar o sucesso do envio.
- **Observação:** O envio real para o SQS pelo Worker foi simulado via log no console para cumprir o prazo do desafio.

## 6. Trade-offs e Limitações (Transparência)
- **Autenticação:** Omitida conforme permitido pela Seção 2 do edital. O foco foi 100% na lógica de negócio e concorrência.
- **REFUND/ROLLBACK:** Devido ao prazo de 3 dias, o fluxo foi priorizado para `BET`, `WIN` e `LOSS`. A modelagem de reversão foi desenhada, mas não codificada.