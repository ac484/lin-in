import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';

interface ContractSummary {
  code: string;
  projectName: string;
  contractAmount: number;
  status: string;
}

@Component({
  selector: 'product-overview-widget',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TableModule,
    TagModule,
  ],
  template: `
    <div class="bg-surface-0 dark:bg-surface-900 p-6 rounded-xl border border-surface-200 dark:border-surface-700 flex flex-col gap-4">
      <span class="font-medium text-base mb-4">訂單（合約）概覽</span>
      <p-table [value]="contracts" [rows]="5" [paginator]="true" [responsiveLayout]="'scroll'">
        <ng-template pTemplate="header">
          <tr>
            <th>編號</th>
            <th>專案名稱</th>
            <th>金額</th>
            <th>狀態</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-contract>
          <tr>
            <td>{{ contract.code }}</td>
            <td>{{ contract.projectName }}</td>
            <td>{{ contract.contractAmount | number:'1.0-0' }}</td>
            <td>
              <p-tag [value]="contract.status"></p-tag>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `
})
export class ProductOverviewWidget {
  contracts: ContractSummary[] = [];
  private firestore = inject(Firestore);
  constructor() {
    const contractsCol = collection(this.firestore, 'contracts');
    collectionData(contractsCol).subscribe((contracts: any[]) => {
      this.contracts = contracts.map(c => ({
        code: c.code,
        projectName: c.projectName,
        contractAmount: c.contractAmount,
        status: c.status
      }));
    });
  }
}
