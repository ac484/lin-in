import { Routes } from '@angular/router';
import { PassportComponent } from './components/layout/passport/passport.component';
import { RegisterComponent } from './components/layout/register/register.component';

export const routes: Routes = [
  { path: 'passport', component: PassportComponent },
  { path: 'register', component: RegisterComponent },
  // 你可以加上首頁或其它頁面
  { path: '', redirectTo: 'passport', pathMatch: 'full' }
];
