import { Injectable } from '@angular/core';
import { PaymentDto } from '../../../application/dto/payment.dto';

@Injectable({ providedIn: 'root' })
export class PaymentRepository {
  private payments: PaymentDto[] = [];

  async add(dto: PaymentDto): Promise<void> {
    this.payments.push(dto);
  }
} 