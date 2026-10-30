# Distributed Wagering Processor

Backend distribuído para processamento de transações financeiras de apostas (iGaming), desenvolvido como parte de um desafio técnico.

O projeto foi construído com foco em **integridade financeira, consistência de dados e segurança no processamento de transações**, aplicando conceitos importantes de sistemas distribuídos, como idempotência, controle de concorrência e arquitetura orientada a eventos.

## Tecnologias Utilizadas

| Categoria | Tecnologias |
|---|---|
| Runtime | Bun |
| Framework | NestJS |
| Linguagem | TypeScript |
| Banco de Dados | PostgreSQL |
| ORM | MikroORM |
| Mensageria | LocalStack (AWS SQS) |
| Infraestrutura | Docker / Docker Compose |

## Funcionalidades

- **Gerenciamento de carteiras:** criação de carteiras com saldo e moeda definidos.
- **Processamento de apostas:** processamento de transações financeiras vinculadas às carteiras dos jogadores.
- **Idempotência:** prevenção de processamento duplicado de transações por meio de chaves únicas.
- **Controle de concorrência:** utilização de Optimistic Locking para proteger atualizações simultâneas de saldo.
- **Transactional Outbox:** persistência de eventos no banco de dados para garantir maior confiabilidade na publicação de eventos.
- **Precisão monetária:** implementação de um objeto de domínio `Money` para evitar problemas de precisão em operações financeiras.

## Como Executar

### Pré-requisitos

- [Docker](https://www.docker.com/)
- [Bun](https://bun.sh/)

### 1. Clone o repositório

```bash
git clone https://github.com/PedroABatista/jungle-wagering-processor.git

cd jungle-wagering-processor
```

### 2. Inicie a infraestrutura

Suba o PostgreSQL e o LocalStack utilizando Docker Compose:

```bash
docker compose up -d
```

### 3. Instale as dependências

```bash
bun install
```

### 4. Execute as migrations

Crie as tabelas necessárias no banco de dados:

```bash
bunx -b mikro-orm migration:up
```

### 5. Inicie a aplicação

```bash
bun run start
```

## Endpoints Principais

### Criar Carteira

`POST /wallets`

Exemplo de payload:

```json
{
  "playerId": "uuid",
  "amount": "100.00",
  "currency": "BRL"
}
```

### Processar Transação (Aposta)

`POST /wagering/transactions`

Exemplo de payload:

```json
{
  "providerId": "provider-a",
  "externalId": "tx-123",
  "walletId": "uuid",
  "kind": "BET",
  "amount": "80.00",
  "currency": "BRL"
}
```

## Arquitetura e Decisões Técnicas

O projeto adota estratégias para lidar com desafios comuns em sistemas financeiros distribuídos.

As principais decisões de engenharia, seus objetivos e justificativas estão documentados em:

📄 **[ARCHITECTURE.md](./ARCHITECTURE.md)**

Entre os conceitos abordados:

- **Optimistic Locking:** prevenção de inconsistências em atualizações concorrentes.
- **Idempotência:** garantia de que uma mesma transação não seja processada mais de uma vez.
- **Transactional Outbox:** persistência de eventos junto à transação de negócio, reduzindo o risco de perda de eventos.

## Testes

O projeto possui testes unitários para o domínio `Money`, validando regras de precisão e operações monetárias.

Também inclui um script de teste de concorrência real (`teste-concorrencia.ts`), utilizado para verificar o comportamento do Optimistic Locking diante de atualizações simultâneas.

Para executar os testes unitários:

```bash
bun test
```

## Limitações Conhecidas

Algumas funcionalidades foram delimitadas pelo escopo e pelo prazo do desafio técnico:

- **Publicação no SQS:** o envio efetivo de mensagens para a fila não foi implementado. O Worker simula a publicação por meio de logs no console, permitindo demonstrar o fluxo da Outbox.
- **Mensagens fora de ordem:** cenários como um `REFUND` recebido antes da respectiva `BET` foram considerados na modelagem, mas ainda não possuem implementação.

---

**Desenvolvido por Pedro Henrique Alves Batista**

[GitHub](https://github.com/PedroABatista) • [LinkedIn](https://www.linkedin.com/in/pedrohabatista/)