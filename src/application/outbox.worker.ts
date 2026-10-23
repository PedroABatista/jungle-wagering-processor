import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { OutboxEntity } from '../infrastructure/database/entities/outbox.entity';

@Injectable()
export class OutboxWorker implements OnModuleInit {
  private readonly logger = new Logger(OutboxWorker.name);

  constructor(private readonly em: EntityManager) {}

  onModuleInit() {
    // Roda a cada 5 segundos
    setInterval(() => this.processOutbox(), 5000);
  }

  async processOutbox() {
    // Cria um EntityManager isolado pra este job em background
    const em = this.em.fork(); 
    
    try {
      const messages = await em.find(OutboxEntity, { publishedAt: null });
      
      for (const msg of messages) {
        this.logger.log(`[SQS SIMULADO] Publicando evento: ${msg.eventType} - ${JSON.stringify(msg.payload)}`);
        msg.publishedAt = new Date();
        em.persist(msg);
      }
      
      if (messages.length > 0) {
        await em.flush();
      }
    } catch (e) {
      this.logger.error('Erro ao processar outbox', e);
    }
  }
}