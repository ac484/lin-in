import { Component } from '@angular/core';
import { StatsWidget } from './dashboard/statswidget';
import { SalesTrendWidget } from './dashboard/salestrendwidget';
import { RecentActivityWidget } from './dashboard/recentactivitywidget';
import { ProductOverviewWidget } from './dashboard/productoverviewwidget';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [StatsWidget, SalesTrendWidget, RecentActivityWidget, ProductOverviewWidget],
  template: `
    <stats-widget />
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <sales-trend-widget />
      <recent-activity-widget />
    </div>
    <product-overview-widget />
  `
})
export class DashboardComponent {} 