export interface CreateContractDto {
  orderNo: string;
  projectNo: string;
  projectName: string;
  contractAmount: number;
  url: string;
  members: { name: string; role: string }[];
} 