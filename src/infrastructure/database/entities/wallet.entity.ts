import { Entity, PrimaryKey, Property, Check } from '@mikro-orm/decorators/legacy';

@Entity({ tableName: 'wallets' })
@Check({ expression: 'balance >= 0' }) // Invariante de saldo no banco!
export class WalletEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'uuid', unique: true })
  playerId!: string;

  @Property({ type: 'varchar', length: 3 })
  currency!: string;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  balance!: string;

  @Property({ type: 'integer', default: 1 })
  version: number = 1;

  @Property({ type: 'timestamp' })
  createdAt: Date = new Date();

  @Property({ type: 'timestamp', onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}