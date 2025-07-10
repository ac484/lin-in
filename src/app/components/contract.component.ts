import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../service/auth/auth.service';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { globalMessageBus, GlobalMessage } from '../app.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-contract',
  standalone: true,
  imports: [CommonModule, MessageModule, ToastModule],
  template: `
    <ng-container *ngIf="!loading">
      <ng-container *ngIf="user">
        <div class="p-8 text-2xl text-center">合約內容：<br>這是專案的合約頁面，僅限登入用戶瀏覽。</div>
      </ng-container>
    </ng-container>
  `
})
export class ContractComponent implements OnDestroy {
  user: unknown = null;
  loading = true;
  private destroyed$ = new Subject<void>();
  private toastShown = false;

  constructor() {
    inject(AuthService).user$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(user => {
        this.user = user;
        this.loading = false;
        if (user === null && !this.toastShown) {
          globalMessageBus.next({
            severity: 'warn',
            summary: '請先登入',
            detail: '請先登入才能瀏覽合約內容。'
          });
          this.toastShown = true;
        }
        if (user) {
          this.toastShown = false; // 登入後重置
        }
      });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
} 