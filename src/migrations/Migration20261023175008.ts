import { Migration } from '@mikro-orm/migrations';

export class Migration20261023175008 extends Migration {

  override name = 'Migration20261023175008';

  override up(): void | Promise<void> {
    this.addSql(`create table "wager_transactions" ("id" uuid not null, "provider_id" varchar(255) not null, "external_id" varchar(255) not null, "idempotency_key" varchar(255) not null, "wallet_id" uuid not null, "kind" varchar(255) not null, "amount" numeric(10,2) not null, "currency" varchar(3) not null, "status" varchar(255) not null, "failure_reason" varchar(255) null, primary key ("id"));`);
    this.addSql(`alter table "wager_transactions" add constraint "wager_transactions_idempotency_key_unique" unique ("idempotency_key");`);
    this.addSql(`create index "wager_transactions_wallet_id_index" on "wager_transactions" ("wallet_id");`);

    this.addSql(`create table "wallets" ("id" uuid not null, "player_id" uuid not null, "currency" varchar(3) not null, "balance" numeric(10,2) not null, "version" int not null default 1, "created_at" timestamptz not null, "updated_at" timestamptz not null, primary key ("id"));`);
    this.addSql(`alter table "wallets" add constraint "wallets_player_id_unique" unique ("player_id");`);
    this.addSql(`alter table "wallets" add constraint "wallets_check" check (balance >= 0);`);

    this.addSql(`create table "wallet_ledger_entries" ("id" uuid not null, "wallet_id" uuid not null, "transaction_id" uuid not null, "direction" varchar(255) not null, "amount" numeric(10,2) not null, "balance_before" numeric(10,2) not null, "balance_after" numeric(10,2) not null, "created_at" timestamptz not null, primary key ("id"));`);
    this.addSql(`create index "wallet_ledger_entries_wallet_id_index" on "wallet_ledger_entries" ("wallet_id");`);
  }

}
