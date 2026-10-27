import { Migration } from '@mikro-orm/migrations';

export class Migration20261027161911 extends Migration {

  override name = 'Migration20261027161911';

  override up(): void | Promise<void> {
    this.addSql(`alter table "wallets" drop constraint "wallets_player_id_unique";`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "wallets" add constraint "wallets_player_id_unique" unique ("player_id");`);
  }

}
