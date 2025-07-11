import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PassportComponent } from './shared/components/passport/passport.component';
import { RegisterComponent } from './shared/components/register/register.component';
import { ContractListPage } from './modules/contract/interface/pages/contract-list/contract-list.page';

export const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'passport', component: PassportComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'contracts', component: ContractListPage, data: { title: '合約列表', titleI18n: 'app.contract.list' } },
];
