import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Contract } from '../../../application/models/contract.model';

@Injectable({ providedIn: 'root' })
export class ContractRepository {
  getAll(): Observable<Contract[]> {
    // 這裡用 mock 資料，實際可串接 Firestore
    return of([
      {
        status: '新建',
        code: 'C-001',
        orderNo: 'O-001',
        orderDate: '2024-06-01',
        projectNo: 'P-001',
        projectName: '專案A',
        contractAmount: 100000,
        pendingPercent: 100,
        invoicedAmount: 0,
        paymentRound: 1,
        paymentPercent: 0,
        paymentStatus: '未請款',
        invoiceStatus: '未開立',
        note: '',
        url: '',
        payments: [],
        changes: [],
        members: [],
        tags: []
      }
    ]);
  }

  async create(dto: any): Promise<void> {
    // TODO: 實際串接 Firestore/Firebase
    // 這裡僅模擬儲存
    console.log('合約已儲存', dto);
  }
} 