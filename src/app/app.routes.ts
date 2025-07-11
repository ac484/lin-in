import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PassportComponent } from './shared/components/passport/passport.component';
import { RegisterComponent } from './shared/components/register/register.component';
import { ContractComponent } from './components/contract/contract.component';
import { WorkspaceComponent } from './components/workspace/workspace.component';
import { authGuard } from './shared/services/auth/auth.guard';

export const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'passport', component: PassportComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'contract', component: ContractComponent, canActivate: [authGuard] },
  { path: 'workspace', component: WorkspaceComponent, canActivate: [authGuard] }

];