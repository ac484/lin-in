import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { TreeNode } from 'primeng/api';
import { OrganizationalPresenterService } from '../../services/organizational-presenter.service';

@Component({
  selector: 'app-organizational',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, OrganizationChartModule],
  templateUrl: './organizational.component.html',
  styleUrls: ['./organizational.component.scss']
})
export class OrganizationalComponent implements OnChanges {
  @Input() contract: any = null;
  chartData: TreeNode[] = [];
  presenter = inject(OrganizationalPresenterService);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['contract']) {
      this.chartData = [this.presenter.getOrgChartData(this.contract)];
    }
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