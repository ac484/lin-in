import { Routes } from '@angular/router';
import { PassportComponent } from '../layout/passport/passport.component';
import { OpenComponent } from '../layout/open/open.component';
import { BlankComponent } from '../layout/blank/blank.component';
import { BasicComponent } from '../layout/basic/basic.component';
import { WorkComponent } from '../layout/work/work.component';
import { authGuard } from '../core/auth/auth.guard';
import { HomeComponent } from '../layout/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'passport', component: PassportComponent },
  {
    path: '',
    component: BasicComponent,
    canActivateChild: [authGuard],
    children: [
      { path: 'work', component: WorkComponent },
      { path: 'open', component: OpenComponent },
      { path: 'blank', component: BlankComponent },
      { path: 'basic', component: BasicComponent },
    ]
  },
  { path: '**', redirectTo: '' }
];
