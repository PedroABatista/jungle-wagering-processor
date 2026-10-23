import { Entity, PrimaryKey, Property, Check } from '@mikro-orm/decorators/legacy';

@Entity({ tableName: 'wager_transactions' })
export class WagerTransactionEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'varchar' })
  providerId!: string;

  @Property({ type: 'varchar' })
  externalId!: string;

  @Property({ type: 'varchar', unique: true }) // A famosa Idempotência!
  idempotencyKey!: string;

  @Property({ type: 'uuid', index: true })
  walletId!: string;

  @Property({ type: 'varchar' })
  kind!: 'BET' | 'WIN' | 'LOSS';

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  amount!: string;

  @Property({ type: 'varchar', length: 3 })
  currency!: string;

  @Property({ type: 'varchar' })
  status!: 'PENDING' | 'PROCESSED' | 'REJECTED';

  @Property({ type: 'varchar', nullable: true })
  failureReason?: string;
}