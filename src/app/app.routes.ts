import { Routes } from '@angular/router';
import { HomeComponent } from './components/home.component';
import { DashboardComponent } from './components/dashboard.component';
import { AboutComponent } from './components/about.component';
import { PassportComponent } from './shared/components/passport/passport.component';
import { RegisterComponent } from './shared/components/register/register.component';
import { ContractComponent } from './components/contract.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'about', component: AboutComponent },
  { path: 'passport', component: PassportComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'contract', component: ContractComponent }
];
