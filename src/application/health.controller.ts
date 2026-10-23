import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get('live')
  live() {
    return { status: 'ok', message: 'Process is alive' };
  }

  @Get('ready')
  ready() {
    // Num cenário real, checaria o Postgres e SQS aqui
    return { status: 'ok', message: 'Ready to accept connections' };
  }
}