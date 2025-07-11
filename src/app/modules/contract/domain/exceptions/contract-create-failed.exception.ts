export class ContractCreateFailedException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContractCreateFailedException';
  }
} 