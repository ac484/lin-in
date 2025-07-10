import { Routes } from '@angular/router';
import { PassportComponent } from '../layout/passport/passport.component';
import { OpenComponent } from '../layout/open/open.component';
import { BlankComponent } from '../layout/blank/blank.component';
import { BasicComponent } from '../layout/basic/basic.component';
import { authGuard } from '../core/auth/auth.guard';
import { HomeComponent } from '../layout/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'passport', component: PassportComponent },
  { path: 'open', component: OpenComponent, canActivate: [authGuard] },
  { path: 'blank', component: BlankComponent, canActivate: [authGuard] },
  { path: 'basic', component: BasicComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
