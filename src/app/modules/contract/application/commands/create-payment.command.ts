export interface CreatePaymentCommand {
  contractId: string;
  amount: number;
  percent: number;
  applicant: string;
  note?: string;
} 