import { Entity, PrimaryKey, Property, Check } from '@mikro-orm/decorators/legacy';

@Entity({ tableName: 'wallets' })
@Check({ expression: 'balance >= 0' })
export class WalletEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'uuid' })
  playerId!: string;

  @Property({ type: 'varchar', length: 3 })
  currency!: string;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  balance!: string;

  @Property({ version: true })
  version!: number;

  @Property({ type: 'timestamp' })
  createdAt: Date = new Date();

  @Property({ type: 'timestamp', onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}