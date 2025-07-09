import { Routes } from '@angular/router';
import { LayoutHubComponent } from 'src/app/layout/hub/hub.component';
import { HUB_FIREBASE_PROVIDERS } from 'src/app/core/hub/hub.firebase.providers';

export const routes: Routes = [
  {
    path: '',
    component: LayoutHubComponent,
    providers: [
      ...HUB_FIREBASE_PROVIDERS
      // AuthService // ← 這行註解或移除
    ],
    // children...
  }
];
