export interface PaymentDto {
  contractId: string;
  amount: number;
  percent: number;
  applicant: string;
  note?: string;
  date: string;
} 