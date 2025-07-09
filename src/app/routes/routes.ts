import { Routes } from '@angular/router';
import { startPageGuard } from '@core';
import { authSimpleCanActivate, authSimpleCanActivateChild } from '@delon/auth';

import { LayoutBasicComponent, LayoutBlankComponent } from '../layout';
import { LayoutFrontendComponent } from '../layout/frontend/frontend.component';

export const routes: Routes = [
  // ===== 前台主路由（公開頁面，無需登入） =====
  {
    path: '',
    component: LayoutFrontendComponent,
    children: [
      { path: 'landing', loadChildren: () => import('../routes/landing/routes').then(m => m.routes) },
      { path: 'finance', loadChildren: () => import('../routes/finance/routes').then(m => m.routes) }
      // 其他前台頁面
    ]
  },

  // ===== 後台主路由（需登入權限） =====
  {
    path: '',
    component: LayoutBasicComponent,
    canActivate: [startPageGuard, authSimpleCanActivate],
    canActivateChild: [authSimpleCanActivateChild],
    data: {},
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/routes').then(m => m.routes)
      },
      {
        path: 'widgets',
        loadChildren: () => import('./widgets/routes').then(m => m.routes)
      },
      { path: 'style', loadChildren: () => import('./style/routes').then(m => m.routes) },
      { path: 'delon', loadChildren: () => import('./delon/routes').then(m => m.routes) },
      { path: 'extras', loadChildren: () => import('./extras/routes').then(m => m.routes) },
      { path: 'pro', loadChildren: () => import('./pro/routes').then(m => m.routes) },
      { path: 'landing', loadChildren: () => import('./landing/routes').then(m => m.routes) },
      { path: 'finance', loadChildren: () => import('./finance/routes').then(m => m.routes) }
      // 其他後台頁面
    ]
  },

  // ===== 空白頁/特殊頁（如資料視覺化） =====
  {
    path: 'data-v',
    component: LayoutBlankComponent,
    children: [{ path: '', loadChildren: () => import('./data-v/routes').then(m => m.routes) }]
  },

  // ===== 認證/例外頁（如登入、註冊、404） =====
  { path: '', loadChildren: () => import('./passport/routes').then(m => m.routes) },
  { path: 'exception', loadChildren: () => import('./exception/routes').then(m => m.routes) },
  { path: '**', redirectTo: 'exception/404' }
];
