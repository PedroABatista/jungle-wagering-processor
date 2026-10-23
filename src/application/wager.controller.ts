import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ProcessWagerUseCase } from './process-wager.use-case';

@Controller('wagering')
export class WagerController {
  constructor(private readonly processWager: ProcessWagerUseCase) {}

  @Post('transactions')
  async handleTransaction(@Body() dto: any) {
    try {
      return await this.processWager.execute(dto);
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }
}
