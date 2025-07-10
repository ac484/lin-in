import { Component, inject } from '@angular/core';
import { StatsWidget } from './statswidget';
import { SalesTrendWidget } from './salestrendwidget';
import { RecentActivityWidget } from './recentactivitywidget';
import { ProductOverviewWidget } from './productoverviewwidget';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [StatsWidget, SalesTrendWidget, RecentActivityWidget, ProductOverviewWidget],
  template: `
    <stats-widget [totalOrders]="contractsCount" [totalRevenue]="contractsTotalAmount" />
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <sales-trend-widget />
      <recent-activity-widget />
    </div>
    <product-overview-widget />
  `
})
export class DashboardComponent {
  contractsCount = 0;
  contractsTotalAmount = 0;
  private firestore = inject(Firestore);
  constructor() {
    const contractsCol = collection(this.firestore, 'contracts');
    collectionData(contractsCol).subscribe((contracts: any[]) => {
      this.contractsCount = contracts.length;
      this.contractsTotalAmount = contracts.reduce((sum, c) => sum + (c.contractAmount || 0), 0);
    });
  }
} 