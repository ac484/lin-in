export class AuthFailedException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthFailedException';
  }
} 