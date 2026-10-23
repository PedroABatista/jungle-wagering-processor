import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import config from './mikro-orm.config';
import { WalletEntity } from './infrastructure/database/entities/wallet.entity';
import { WalletLedgerEntity } from './infrastructure/database/entities/wallet-ledger.entity';
import { WagerTransactionEntity } from './infrastructure/database/entities/wager-transaction.entity';
import { OutboxEntity } from './infrastructure/database/entities/outbox.entity';
import { ProcessWagerUseCase } from './application/process-wager.use-case';
import { WagerController } from './application/wager.controller';
import { WalletController } from './application/wallet.controller';
import { OutboxWorker } from './application/outbox.worker';       // <-- NOVO
import { HealthController } from './application/health.controller'; // <-- NOVO

@Module({
  imports: [
    MikroOrmModule.forRoot(config),
    MikroOrmModule.forFeature([WalletEntity, WalletLedgerEntity, WagerTransactionEntity, OutboxEntity]),
  ],
  controllers: [WagerController, WalletController, HealthController], // <-- HealthController AQUI
  providers: [ProcessWagerUseCase, OutboxWorker],                   // <-- OutboxWorker AQUI
})
export class AppModule {}