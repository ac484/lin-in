import { Injectable } from '@angular/core';
import { TreeNode } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class OrganizationalPresenterService {
  getOrgChartData(contract: any): TreeNode {
    const defaultLabel = '專案團隊';
    if (!contract) return this.getDefaultOrgChartData();
    const members = contract.members?.length ? contract.members : Array(3).fill({ name: '', role: '' });
    const children: TreeNode[] = members.map((m: {name?: string, role?: string}) => ({
      label: m.name || '—',
      type: 'person',
      expanded: true,
      data: { ...m }
    }));
    return {
      label: contract.projectName || defaultLabel,
      type: 'person',
      expanded: true,
      data: { name: contract.projectName, role: '' },
      children
    };
  }
  getDefaultOrgChartData(): TreeNode {
    return {
      label: '專案團隊',
      expanded: true,
      children: Array(3).fill(null).map(() => ({
        label: '—',
        type: 'person',
        expanded: true,
        data: { name: '', role: '' }
      }))
    };
  }
} 