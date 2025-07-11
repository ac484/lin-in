import { Injectable } from '@angular/core';
import { CreatePaymentCommand } from '../../application/commands/create-payment.command';
import { PaymentApplicationService } from '../../application/services/payment-application.service';

@Injectable({ providedIn: 'root' })
export class RequestPresenterService {
  constructor(private app: PaymentApplicationService) {}

  async createPayment(command: CreatePaymentCommand): Promise<void> {
    await this.app.create(command);
  }
} 