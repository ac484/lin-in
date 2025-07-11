import { Injectable } from '@angular/core';
import { CreatePaymentCommand } from '../commands/create-payment.command';
import { PaymentDto } from '../dto/payment.dto';
import { PaymentRepository } from '../../infrastructure/persistence/payment.repository';
import { PaymentCreatedEvent } from '../../domain/events/payment-created.event';

@Injectable({ providedIn: 'root' })
export class PaymentApplicationService {
  constructor(private repo: PaymentRepository) {}

  async create(command: CreatePaymentCommand): Promise<void> {
    const dto: PaymentDto = { ...command, date: new Date().toISOString() };
    await this.repo.add(dto);
    new PaymentCreatedEvent(dto);
  }
} 