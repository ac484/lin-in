// 本檔案依據 Firebase Console 專案設定，使用 Firebase Client SDK 操作 Cloud Firestore。
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizationChartModule } from 'primeng/organizationchart';
import type { Contract } from '../../contract.component';

@Component({
  selector: 'app-organizational',
  standalone: true,
  imports: [CommonModule, OrganizationChartModule],
  templateUrl: './organizational.component.html',
  styleUrls: ['./organizational.component.scss']
})
export class OrganizationalComponent {
  @Input() contract: Contract | null = null;
  @Input() defaultLabel: string = '專案團隊';

  getOrgChartData(contract: Contract | null): any {
    if (!contract) return this.getDefaultOrgChartData();
    return {
      label: contract.projectName || this.defaultLabel,
      expanded: true,
      children: (contract.members && contract.members.length > 0
        ? contract.members
        : [
            { name: '', role: '' },
            { name: '', role: '' },
            { name: '', role: '' }
          ]
      ).map(m => ({
        label: m.role || '角色',
        type: 'person',
        data: m
      }))
    };
  }

  getDefaultOrgChartData(): any {
    return {
      label: this.defaultLabel,
      expanded: true,
      children: [
        { label: '角色', type: 'person', data: { name: '', role: '' }, expanded: true },
        { label: '角色', type: 'person', data: { name: '', role: '' }, expanded: true },
        { label: '角色', type: 'person', data: { name: '', role: '' }, expanded: true }
      ]
    };
  }
}
