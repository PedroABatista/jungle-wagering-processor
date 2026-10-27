import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { OutboxEntity } from '../infrastructure/database/entities/outbox.entity';

@Injectable()
export class OutboxWorker implements OnModuleInit {
  private readonly logger = new Logger(OutboxWorker.name);

  constructor(private readonly em: EntityManager) {}

  onModuleInit() {
    setInterval(() => this.processOutbox(), 5000);
  }

  async processOutbox() {
    const em = this.em.fork();
    try {
      const messages = await em.find(OutboxEntity, { publishedAt: null });
      
      for (const msg of messages) {
        try {
          this.logger.log(`[SQS SIMULADO] Enviando evento: ${msg.eventType} - ${JSON.stringify(msg.payload)}`);
          msg.publishedAt = new Date();
          em.persist(msg);
        } catch (sendError: any) {
          this.logger.error(`Falha ao enviar evento ${msg.id}. Vai tentar novamente.`);
        }
      }
      
      await em.flush();
    } catch (e: any) {
      this.logger.error('Erro no worker da outbox', e);
    }
  }
}