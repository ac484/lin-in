import { Routes } from '@angular/router';
import { HomeComponent } from './components/home.component';
import { DashboardComponent } from './components/dashboard.component';
import { AboutComponent } from './components/about.component';
import { PassportComponent } from './components/layout/passport/passport.component';
import { RegisterComponent } from './components/layout/register/register.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'about', component: AboutComponent },
  { path: 'passport', component: PassportComponent },
  { path: 'register', component: RegisterComponent }
];
