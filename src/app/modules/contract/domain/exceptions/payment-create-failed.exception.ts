export class PaymentCreateFailedException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaymentCreateFailedException';
  }
} 