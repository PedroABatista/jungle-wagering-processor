import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { OptimisticLockError } from '@mikro-orm/core';
import { WalletEntity } from '../infrastructure/database/entities/wallet.entity';
import { WagerTransactionEntity } from '../infrastructure/database/entities/wager-transaction.entity';
import { WalletLedgerEntity } from '../infrastructure/database/entities/wallet-ledger.entity';
import { OutboxEntity } from '../infrastructure/database/entities/outbox.entity';
import { Money } from '../domain/money/money';
import { Wallet } from '../domain/wallet/wallet';
import { randomUUID } from 'crypto';

@Injectable()
export class ProcessWagerUseCase {
  constructor(private readonly em: EntityManager) {}

  async execute(dto: any) {
    const idempotencyKey = `${dto.providerId}:${dto.externalId}`;
    const transactionId = randomUUID();

    try {
      return await this.em.transactional(async (em) => {
        const tx = new WagerTransactionEntity();
        Object.assign(tx, {
          id: transactionId,
          providerId: dto.providerId,
          externalId: dto.externalId,
          idempotencyKey,
          walletId: dto.walletId,
          kind: dto.kind,
          amount: dto.amount,
          currency: dto.currency,
          status: 'PENDING'
        });

        em.persist(tx);
        await em.flush();

        const walletDb = await em.findOne(WalletEntity, { id: dto.walletId });
        if (!walletDb) throw new Error('Wallet not found');

        const wallet = Wallet.rehydrate(walletDb);
        const money = Money.from({ amount: dto.amount, currency: dto.currency });
        const balanceBefore = wallet.balance;

        try {
          if (dto.kind === 'BET') {
            wallet.debit(money);
          } else if (dto.kind === 'WIN') {
            wallet.credit(money);
          } else if (dto.kind === 'LOSS') {
            // Sem alteração de saldo
          }
        } catch (e: any) {
          tx.status = 'REJECTED';
          tx.failureReason = e.message;
          em.persist(tx);
          return { status: 'REJECTED', reason: e.message };
        }

        walletDb.balance = wallet.balance.toJSON().amount;

        const ledger = new WalletLedgerEntity();
        Object.assign(ledger, {
          id: randomUUID(),
          walletId: wallet.id,
          transactionId,
          direction: dto.kind === 'BET' ? 'DEBIT' : 'CREDIT',
          amount: dto.amount,
          balanceBefore: balanceBefore.toJSON().amount,
          balanceAfter: wallet.balance.toJSON().amount
        });
        em.persist(ledger);

        tx.status = 'PROCESSED';

        const outbox = new OutboxEntity();
        Object.assign(outbox, {
          id: randomUUID(),
          eventType: 'WalletBalanceChanged',
          payload: { walletId: wallet.id, newBalance: wallet.balance.toJSON().amount, version: wallet.version }
        });
        em.persist(outbox);

        return { status: 'PROCESSED', transactionId, balance: wallet.balance.toJSON() };
      });
    } catch (error: any) {
      // 1. Tratamento de Concorrência (Optimistic Lock)
      // Verifica se é instância da classe do MikroORM OU se a mensagem contém o texto
      if (error instanceof OptimisticLockError || (error.message && error.message.toLowerCase().includes('optimistic lock'))) {
        return { 
          status: 'REJECTED', 
          reason: 'Concurrent modification detected. Please try again.' 
        };
      }

      // 2. Tratamento de Idempotência (Unique Key)
      if (
        error.code === '23505' || 
        error.name === 'UniqueConstraintViolationException' || 
        (error.message && error.message.toLowerCase().includes('unique constraint'))
      ) {
        const fork = this.em.fork();
        const existingTx = await fork.findOne(WagerTransactionEntity, { idempotencyKey });
        if (existingTx) {
          return { status: existingTx.status, idempotentReplay: true };
        }
      }

      // Se for outro erro qualquer, repassa pro NestJS
      throw error;
    }
  }
}