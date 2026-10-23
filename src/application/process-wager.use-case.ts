import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
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
    return await this.em.transactional(async (em) => {
      const walletDb = await em.findOne(WalletEntity, { id: dto.walletId });
      if (!walletDb) throw new Error('Wallet not found');

      const transactionId = randomUUID();
            const idempotencyKey = `${dto.providerId}:${dto.externalId}`;
      
      const existingTx = await em.findOne(WagerTransactionEntity, { idempotencyKey });
      if (existingTx) {
        return { status: existingTx.status, idempotentReplay: true };
      }

      const wallet = Wallet.rehydrate(walletDb);
      const money = Money.from({ amount: dto.amount, currency: dto.currency });
      const balanceBefore = wallet.balance;
      
      try {
        if (dto.kind === 'BET') {
          wallet.debit(money);
        } else if (dto.kind === 'WIN') {
          wallet.credit(money);
        }
      } catch (e: any) {
        const rejectedTx = new WagerTransactionEntity();
        Object.assign(rejectedTx, {
           id: transactionId, providerId: dto.providerId, externalId: dto.externalId,
           idempotencyKey, walletId: dto.walletId, kind: dto.kind,
           amount: dto.amount, currency: dto.currency, status: 'REJECTED', failureReason: e.message
        });
        em.persist(rejectedTx);
        return { status: 'REJECTED', reason: e.message };
      }

      walletDb.balance = wallet.balance.toJSON().amount;
      walletDb.version = wallet.version;

      const ledger = new WalletLedgerEntity();
      Object.assign(ledger, {
        id: randomUUID(), walletId: wallet.id, transactionId,
        direction: dto.kind === 'BET' ? 'DEBIT' : 'CREDIT',
        amount: dto.amount, balanceBefore: balanceBefore.toJSON().amount,
        balanceAfter: wallet.balance.toJSON().amount
      });
      em.persist(ledger);

      const tx = new WagerTransactionEntity();
      Object.assign(tx, {
         id: transactionId, providerId: dto.providerId, externalId: dto.externalId,
         idempotencyKey, walletId: dto.walletId, kind: dto.kind,
         amount: dto.amount, currency: dto.currency, status: 'PROCESSED'
      });
      em.persist(tx);

      const outbox = new OutboxEntity();
      Object.assign(outbox, {
        id: randomUUID(),
        eventType: 'WalletBalanceChanged',
        payload: { walletId: wallet.id, newBalance: wallet.balance.toJSON().amount, version: wallet.version }
      });
      em.persist(outbox);

      return { status: 'PROCESSED', transactionId, balance: wallet.balance.toJSON() };
    });
  }
}
