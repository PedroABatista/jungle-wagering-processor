import { Controller, Post, Body } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { WalletEntity } from '../infrastructure/database/entities/wallet.entity';
import { Money } from '../domain/money/money';
import { Wallet } from '../domain/wallet/wallet';
import { randomUUID } from 'crypto';

@Controller('wallets')
export class WalletController {
  constructor(private readonly em: EntityManager) {}

  @Post()
  async createWallet(@Body() body: { playerId: string, amount: string, currency: string }) {
    return await this.em.transactional(async (em) => {
      const money = Money.from({ amount: body.amount, currency: body.currency });
      const domainWallet = Wallet.open(randomUUID(), body.playerId, money);
      
      const dbWallet = new WalletEntity();
      Object.assign(dbWallet, {
        id: domainWallet.id,
        playerId: domainWallet.playerId,
        currency: domainWallet.currency,
        balance: domainWallet.balance.toJSON().amount,
        // version: domainWallet.version,  <-- APAGUE OU COMENTE ESTA LINHA
        createdAt: domainWallet.createdAt,
        updatedAt: domainWallet.updatedAt,
      });

      em.persist(dbWallet);
      return { id: domainWallet.id, balance: domainWallet.balance.toJSON() };
    });
  }
}