import { defineConfig } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';
import { ReflectMetadataProvider } from '@mikro-orm/decorators/legacy';
import { WalletEntity } from './infrastructure/database/entities/wallet.entity';
import { WalletLedgerEntity } from './infrastructure/database/entities/wallet-ledger.entity';
import { WagerTransactionEntity } from './infrastructure/database/entities/wager-transaction.entity';
import { OutboxEntity } from './infrastructure/database/entities/outbox.entity';

export default defineConfig({
  host: '127.0.0.1',
  port: 5433,
  user: 'teste1',
  password: 'testado123',
  dbName: 'bancoTeste',
  
  // Força o MikroORM a usar exatamente estas classes
  entities: [WalletEntity, WalletLedgerEntity, WagerTransactionEntity, OutboxEntity],
  
  // Garante que os metadados dos decorators sejam lidos corretamente no runtime
  metadataProvider: ReflectMetadataProvider,
  
  migrations: {
    path: './dist/migrations',
    pathTs: './src/migrations',
  },
  extensions: [Migrator],
});