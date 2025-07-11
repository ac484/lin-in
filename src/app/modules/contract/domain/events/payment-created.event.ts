import { PaymentDto } from '../../application/dto/payment.dto';

export class PaymentCreatedEvent {
  constructor(public readonly payment: PaymentDto) {}
} 