import { Migration } from '@mikro-orm/migrations';

export class Migration20261023184113 extends Migration {

  override name = 'Migration20261023184113';

  override up(): void | Promise<void> {
    this.addSql(`create table "outbox_messages" ("id" uuid not null, "event_type" varchar(255) not null, "payload" jsonb not null, "created_at" timestamptz not null, "published_at" timestamptz null, primary key ("id"));`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "outbox_messages" cascade;`);
  }

}
