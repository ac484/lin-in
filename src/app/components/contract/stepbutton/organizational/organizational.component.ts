// 本檔案依據 Firebase Console 專案設定，使用 Firebase Client SDK 操作 Cloud Firestore。
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { OrganizationChartModule } from 'primeng/organizationchart';
import type { Contract } from '../../contract.component';
import { TreeNode } from 'primeng/api';

@Component({
  selector: 'app-organizational',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, OrganizationChartModule],
  templateUrl: './organizational.component.html',
  styleUrls: ['./organizational.component.scss']
})
export class OrganizationalComponent implements OnChanges {
  @Input() contract: Contract | null = null;
  chartData: TreeNode[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['contract']) {
      this.chartData = [this.getOrgChartData(this.contract)];
    }
  }

  getOrgChartData(contract: Contract | null): TreeNode {
    const defaultLabel = '專案團隊';
    if (!contract) return this.getDefaultOrgChartData();
    const members = contract.members?.length ? contract.members : Array(3).fill({ name: '', role: '' });
    const children: TreeNode[] = members.map(m => ({
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

  startEdit(node: TreeNode): void {
    node.data._backup = { ...node.data };
    node.data.editing = true;
  }

  saveEdit(node: TreeNode): void {
    delete node.data._backup;
    node.data.editing = false;
  }

  cancelEdit(node: TreeNode): void {
    Object.assign(node.data, node.data._backup);
    delete node.data._backup;
    node.data.editing = false;
  }
}
