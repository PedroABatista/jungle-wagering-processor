import { Entity, PrimaryKey, Property, Check } from '@mikro-orm/decorators/legacy';

@Entity({ tableName: 'wallet_ledger_entries' })
export class WalletLedgerEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'uuid', index: true })
  walletId!: string;

  @Property({ type: 'uuid' })
  transactionId!: string;

  @Property({ type: 'varchar' })
  direction!: 'DEBIT' | 'CREDIT';

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  amount!: string;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  balanceBefore!: string;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  balanceAfter!: string;

  @Property({ type: 'timestamp' })
  createdAt: Date = new Date();
}