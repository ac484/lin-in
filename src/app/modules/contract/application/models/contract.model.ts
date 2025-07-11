export interface PaymentRecord {
  round: number;
  status?: '初始' | '申請中' | '審核中' | '開票中' | '放款中' | '完成' | '已拒絕';
  percent: number;
  amount: number;
  applicant: string;
  date: string;
  note?: string;
}

export interface ChangeRecord {
  type: '追加' | '追減';
  amount: number;
  note?: string;
  date: string;
  user: string;
}

export interface Contract {
  status: string;
  code: string;
  orderNo: string;
  orderDate: string;
  projectNo: string;
  projectName: string;
  contractAmount: number;
  pendingPercent: number;
  invoicedAmount: number;
  paymentRound: number;
  paymentPercent: number;
  paymentStatus: string;
  invoiceStatus: string;
  note: string;
  url: string;
  payments?: PaymentRecord[];
  changes?: ChangeRecord[];
  members?: { name: string; role: string }[];
  tags?: string[];
} 