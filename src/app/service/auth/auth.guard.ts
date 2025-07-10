import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { map, take } from 'rxjs/operators';
import { globalMessageBus } from '../../shared/services/global-message-bus';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService) as AuthService;
  const router = inject(Router);
  return auth.user$.pipe(
    take(1),
    map(user => {
      if (user) {
        return true;
      } else {
        globalMessageBus.next({ severity: 'warn', summary: '請先登入', detail: '請先登入才能瀏覽合約內容。' });
        router.navigate(['/passport']);
        return false;
      }
    })
  );
}; 