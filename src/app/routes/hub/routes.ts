import { Routes } from '@angular/router';
import { LayoutHubComponent } from 'src/app/layout/hub/hub.component';
import { HUB_FIREBASE_PROVIDERS } from 'src/app/core/hub/hub.firebase.providers';
import { AuthService } from './services/auth.service';

export const routes: Routes = [
  {
    path: '',
    component: LayoutHubComponent,
    providers: [
      ...HUB_FIREBASE_PROVIDERS,
      AuthService
    ],
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: 'logout',
        loadComponent: () => import('./logout/logout.component').then(m => m.LogoutComponent)
      }
    ]
  }
];
