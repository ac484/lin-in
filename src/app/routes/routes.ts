import { Routes } from '@angular/router';
import { PassportComponent } from '../layout/passport/passport.component';
import { OpenComponent } from '../layout/open/open.component';
import { BlankComponent } from '../layout/blank/blank.component';
import { BasicComponent } from '../layout/basic/basic.component';

export const routes: Routes = [
  { path: 'passport', component: PassportComponent },
  { path: 'open', component: OpenComponent },
  { path: 'blank', component: BlankComponent },
  { path: 'basic', component: BasicComponent },
  { path: '', redirectTo: 'passport', pathMatch: 'full' },
  { path: '**', redirectTo: 'passport' }
];
